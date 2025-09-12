import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Grid, FolderPlus } from 'lucide-react';
import MediaLibrary from './MediaLibrary';
import MediaUpload from './MediaUpload';
import { toast } from 'react-hot-toast';
import { createMediaFolder } from '@/lib/r2MediaUtils';
import { useAdminAuth } from '@/hooks/useAdminAuth';

/**
 * Media Manager component that provides a complete interface for
 * managing media files using Cloudflare R2 storage
 */
const MediaManager: React.FC = () => {
  const { user } = useAdminAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'browse');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<Array<{ url: string; type: string; id: string }>>([]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('tab', value);
      return newParams;
    });
  };

  // Handle media selection from library
  const handleMediaSelect = (media: { url: string; type: string; id: string }) => {
    setSelectedMedia(prev => {
      // Check if already selected
      if (prev.some(item => item.id === media.id)) {
        return prev.filter(item => item.id !== media.id);
      } else {
        return [...prev, media];
      }
    });
  };

  // Handle upload completion
  const handleUploadComplete = (files: Array<{ url: string; name: string; key: string; type: string }>) => {
    // You could do additional processing here if needed
  };

  // Create folder handler
  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    try {
      setIsCreatingFolder(true);
      // Sanitize folder name
      const sanitizedFolderName = folderName.trim().replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();
      await createMediaFolder(sanitizedFolderName);
      toast.success(`Folder "${sanitizedFolderName}" created successfully`);
      setFolderName('');
      // Refresh the library view
      // This is just a trick to force the MediaLibrary to refresh
      setActiveTab('upload');
      setTimeout(() => {
        setActiveTab('browse');
      }, 100);
    } catch (error) {
      toast.error('Failed to create folder');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media Manager</h1>
          <p className="text-gray-600 mt-1">
            Upload, organize, and manage media files for your content
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="browse" className="px-6">
                <Grid className="mr-2 h-4 w-4" />
                Browse Media
              </TabsTrigger>
              <TabsTrigger value="upload" className="px-6">
                <Upload className="mr-2 h-4 w-4" />
                Upload Files
              </TabsTrigger>
            </TabsList>

            {/* Create folder button */}
            <div className="flex items-center space-x-2">
              <div className={`${isCreatingFolder ? 'flex' : 'hidden'} items-center space-x-2`}>
                <input
                  type="text"
                  placeholder="New folder name"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateFolder();
                  }}
                />
                <Button 
                  onClick={handleCreateFolder}
                  disabled={!folderName.trim() || isCreatingFolder}
                >
                  Create
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreatingFolder(false);
                    setFolderName('');
                  }}
                >
                  Cancel
                </Button>
              </div>

              <Button
                variant="outline"
                className={`${isCreatingFolder ? 'hidden' : 'flex'} items-center`}
                onClick={() => setIsCreatingFolder(true)}
              >
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
              </Button>
            </div>
          </div>

          <TabsContent value="browse" className="mt-0">
            <Card>
              <CardContent className="p-0">
                <MediaLibrary 
                  onSelect={handleMediaSelect} 
                  maxSelection={10} 
                  acceptedTypes={['image', 'video', 'audio', 'document']}
                  isModal={false}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="mt-0">
            <Card>
              <CardContent className="p-0">
                <MediaUpload
                  onUploadComplete={handleUploadComplete}
                  maxFiles={10}
                  allowedTypes={[
                    'image/jpeg', 
                    'image/png', 
                    'image/gif', 
                    'image/webp',
                    'video/mp4', 
                    'video/webm',
                    'audio/mp3',
                    'audio/wav',
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                  ]}
                  folder=""
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Selected Media (optional section) */}
        {selectedMedia.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Selected Media ({selectedMedia.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {selectedMedia.map((media) => (
                  <div key={media.id} className="relative border rounded-md overflow-hidden">
                    {media.type.startsWith('image') ? (
                      <img src={media.url} alt="" className="w-full h-32 object-cover" />
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center bg-gray-100">
                        <span className="text-sm text-gray-500">{media.type}</span>
                      </div>
                    )}
                    <button
                      className="absolute top-2 right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                      onClick={() => setSelectedMedia(prev => prev.filter(item => item.id !== media.id))}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedMedia([])}
                >
                  Clear Selection
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MediaManager;
