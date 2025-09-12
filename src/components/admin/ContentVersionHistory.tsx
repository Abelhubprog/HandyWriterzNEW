import React, { useState, useEffect } from 'react';
import { Clock, ArrowDownUp, Eye, RotateCcw, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface ContentVersion {
  id: string;
  version: number;
  createdAt: string;
  createdBy: string;
  notes?: string;
}

interface ContentVersionHistoryProps {
  postId: string;
  onRestoreVersion: (versionId: string) => Promise<void>;
  onPreviewVersion: (versionId: string) => void;
  onDeleteVersion: (versionId: string) => Promise<void>;
  currentVersionId?: string;
  fetchVersions: () => Promise<ContentVersion[]>;
}

const ContentVersionHistory: React.FC<ContentVersionHistoryProps> = ({
  postId,
  onRestoreVersion,
  onPreviewVersion,
  onDeleteVersion,
  currentVersionId,
  fetchVersions
}) => {
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Dialog states
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<ContentVersion | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Load versions
  useEffect(() => {
    loadVersions();
  }, [postId]);
  
  const loadVersions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchVersions();
      setVersions(data);
    } catch (err) {
      setError('Failed to load version history');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
  };
  
  // Get sorted versions
  const getSortedVersions = () => {
    return [...versions].sort((a, b) => {
      if (sortDirection === 'desc') {
        return b.version - a.version;
      } else {
        return a.version - b.version;
      }
    });
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Handle restore version
  const handleRestoreVersion = async () => {
    if (!selectedVersion) return;
    
    try {
      setIsLoading(true);
      setError(null);
      await onRestoreVersion(selectedVersion.id);
      setShowRestoreDialog(false);
      setSuccessMessage(`Restored to version ${selectedVersion.version}`);
      toast.success(`Version ${selectedVersion.version} restored successfully`);
      
      // Refresh versions list
      await loadVersions();
    } catch (err) {
      setError('Failed to restore version');
      toast.error('Failed to restore version');
    } finally {
      setIsLoading(false);
      setSelectedVersion(null);
    }
  };
  
  // Handle delete version
  const handleDeleteVersion = async () => {
    if (!selectedVersion) return;
    
    try {
      setIsLoading(true);
      setError(null);
      await onDeleteVersion(selectedVersion.id);
      setShowDeleteDialog(false);
      toast.success(`Version ${selectedVersion.version} deleted`);
      
      // Refresh versions list
      await loadVersions();
    } catch (err) {
      setError('Failed to delete version');
      toast.error('Failed to delete version');
    } finally {
      setIsLoading(false);
      setSelectedVersion(null);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Clock className="h-5 w-5 mr-2" />
          Version History
        </CardTitle>
        <CardDescription>
          View, restore, or delete previous versions of your content
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-md flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>{successMessage}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSuccessMessage(null)}
              className="ml-auto"
            >
              Dismiss
            </Button>
          </div>
        )}
        
        {isLoading && versions.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading version history...</p>
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No version history available</p>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleSortDirection}
                className="text-xs flex items-center"
              >
                <ArrowDownUp className="h-3 w-3 mr-1" />
                Sort by {sortDirection === 'desc' ? 'Newest First' : 'Oldest First'}
              </Button>
            </div>
            
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getSortedVersions().map((version) => (
                    <TableRow key={version.id} className={currentVersionId === version.id ? 'bg-blue-50' : ''}>
                      <TableCell className="font-medium">
                        {version.version}
                        {currentVersionId === version.id && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Current
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(version.createdAt)}</TableCell>
                      <TableCell>{version.createdBy}</TableCell>
                      <TableCell className="max-w-xs truncate">{version.notes || '-'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onPreviewVersion(version.id)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Preview</span>
                          </Button>
                          
                          {currentVersionId !== version.id && (
                            <Button 
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedVersion(version);
                                setShowRestoreDialog(true);
                              }}
                            >
                              <RotateCcw className="h-4 w-4" />
                              <span className="sr-only">Restore</span>
                            </Button>
                          )}
                          
                          {currentVersionId !== version.id && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setSelectedVersion(version);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
      
      {/* Restore Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Version {selectedVersion?.version}</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore to version {selectedVersion?.version}? 
              This will revert your content to this previous state.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowRestoreDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRestoreVersion}
              disabled={isLoading}
            >
              {isLoading ? 'Restoring...' : 'Restore Version'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Version {selectedVersion?.version}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete version {selectedVersion?.version}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteVersion}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Version'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ContentVersionHistory;
