import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, AlertCircle, Clock, ArrowLeft, Save, Eye, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ContentWorkflow from './ContentWorkflow';
import ContentScheduling from './ContentScheduling';
import { contentVersionService } from '@/services/contentVersionService';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface ContentManagementProps {
  postId: string;
  onBack?: () => void;
  initialContent?: string;
  onSaveDraft?: (content: string) => Promise<void>;
  onPreview?: () => void;
  onPublish?: () => Promise<void>;
}

const ContentManagement: React.FC<ContentManagementProps> = ({
  postId,
  onBack,
  initialContent,
  onSaveDraft,
  onPreview,
  onPublish
}) => {
  const { user } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('workflow');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState<string | null>(null);
  const [content, setContent] = useState<string>(initialContent || '');
  
  // Load scheduling info on mount
  useEffect(() => {
    const loadSchedulingInfo = async () => {
      try {
        const contentDetails = await contentVersionService.getContentDetails(postId);
        if (contentDetails.scheduledPublishDate) {
          setScheduledDate(contentDetails.scheduledPublishDate);
        }
      } catch (err) {
        // Non-critical error, don't show to user
      }
    };
    
    loadSchedulingInfo();
  }, [postId]);
  
  // Handle scheduling
  const handleSchedule = async (scheduledDate: string | null) => {
    if (!scheduledDate) return;
    
    try {
      setIsLoading(true);
      await contentVersionService.scheduleContent(postId, scheduledDate);
      setScheduledDate(scheduledDate);
      return Promise.resolve();
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle unscheduling
  const handleUnschedule = async () => {
    try {
      setIsLoading(true);
      await contentVersionService.unscheduleContent(postId);
      setScheduledDate(null);
      return Promise.resolve();
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle save draft
  const handleSaveDraft = async () => {
    if (!onSaveDraft) return;
    
    try {
      setIsLoading(true);
      setError(null);
      await onSaveDraft(content);
      toast.success('Draft saved successfully');
    } catch (err) {
      setError('Failed to save draft. Please try again.');
      toast.error('Failed to save draft');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle publish
  const handlePublish = async () => {
    if (!onPublish) return;
    
    try {
      setIsLoading(true);
      setError(null);
      await onPublish();
      toast.success('Content published successfully');
    } catch (err) {
      setError('Failed to publish content. Please try again.');
      toast.error('Failed to publish content');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
          <h2 className="text-2xl font-bold">Content Management</h2>
        </div>
        <div className="flex space-x-2">
          {onSaveDraft && (
            <Button variant="outline" onClick={handleSaveDraft} disabled={isLoading}>
              <Save className="h-4 w-4 mr-1" />
              Save Draft
            </Button>
          )}
          {onPreview && (
            <Button variant="outline" onClick={onPreview} disabled={isLoading}>
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
          )}
          {onPublish && (
            <Button onClick={handlePublish} disabled={isLoading}>
              <Upload className="h-4 w-4 mr-1" />
              Publish Now
            </Button>
          )}
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      {/* Scheduled notification */}
      {scheduledDate && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-blue-500 mr-2" />
            <p className="text-blue-700">
              This content is scheduled for publication on{' '}
              {new Date(scheduledDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      )}
      
      {/* Tabs for workflow, scheduling, SEO */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="workflow">
            <FileText className="h-4 w-4 mr-1" />
            Workflow & Review
          </TabsTrigger>
          <TabsTrigger value="scheduling">
            <Clock className="h-4 w-4 mr-1" />
            Scheduling
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="workflow" className="mt-4">
          <ContentWorkflow postId={postId} />
        </TabsContent>
        
        <TabsContent value="scheduling" className="mt-4">
          <ContentScheduling
            postId={postId}
            initialScheduledDate={scheduledDate || undefined}
            onSchedule={handleSchedule}
            onUnschedule={handleUnschedule}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentManagement;
