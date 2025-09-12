import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface ContentSchedulingProps {
  postId: string;
  initialScheduledDate?: string; // ISO date string
  onSchedule: (scheduledDate: string | null) => Promise<void>;
  onUnschedule: () => Promise<void>;
}

const ContentScheduling: React.FC<ContentSchedulingProps> = ({
  postId,
  initialScheduledDate,
  onSchedule,
  onUnschedule
}) => {
  const { user } = useAdminAuth();
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Format date for display
  const formatDateForDisplay = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Initialize from props
  useEffect(() => {
    if (initialScheduledDate) {
      const date = new Date(initialScheduledDate);
      setScheduledDate(date.toISOString().split('T')[0]);
      
      // Format time as HH:MM
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      setScheduledTime(`${hours}:${minutes}`);
    } else {
      // Default to tomorrow at 9am
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      
      setScheduledDate(tomorrow.toISOString().split('T')[0]);
      setScheduledTime('09:00');
    }
  }, [initialScheduledDate]);
  
  // Handle schedule submission
  const handleSchedule = async () => {
    if (!scheduledDate || !scheduledTime) {
      setError('Please set both date and time for scheduling');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Combine date and time
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      
      // Validate that the scheduled time is in the future
      if (scheduledDateTime <= new Date()) {
        setError('Scheduled time must be in the future');
        return;
      }
      
      await onSchedule(scheduledDateTime.toISOString());
      toast.success('Content scheduled successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule content');
      toast.error('Failed to schedule content');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle unscheduling
  const handleUnschedule = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onUnschedule();
      toast.success('Content unscheduled');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unschedule content');
      toast.error('Failed to unschedule content');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Content Scheduling
        </CardTitle>
        <CardDescription>
          Schedule this content to be published automatically at a future date and time
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {initialScheduledDate && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md text-blue-800 flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            <div>
              <p className="font-medium">Currently scheduled for:</p>
              <p>{formatDateForDisplay(initialScheduledDate)}</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 rounded-md text-red-800 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            <p>{error}</p>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label htmlFor="scheduled-date" className="block text-sm font-medium text-gray-700 mb-1">
              Publication Date
            </label>
            <Input
              id="scheduled-date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full"
            />
          </div>
          
          <div>
            <label htmlFor="scheduled-time" className="block text-sm font-medium text-gray-700 mb-1">
              Publication Time
            </label>
            <Input
              id="scheduled-time"
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {initialScheduledDate ? (
          <>
            <Button 
              variant="outline" 
              onClick={handleUnschedule}
              disabled={isLoading}
            >
              Cancel Scheduling
            </Button>
            <Button 
              onClick={handleSchedule}
              disabled={isLoading || !scheduledDate || !scheduledTime}
            >
              Update Schedule
            </Button>
          </>
        ) : (
          <Button 
            onClick={handleSchedule}
            disabled={isLoading || !scheduledDate || !scheduledTime}
            className="w-full"
          >
            Schedule Publication
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ContentScheduling;
