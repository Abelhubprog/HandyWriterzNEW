import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Image, File, X, AlertCircle } from 'lucide-react';
import { r2Client } from '@/lib/cloudflareR2Client';
import { toast } from 'react-hot-toast';

interface MediaUploadProps {
  onUploadComplete?: (files: Array<{ url: string; name: string; key: string; type: string }>) => void;
  maxFiles?: number;
  allowedTypes?: string[];
  folder?: string;
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  onUploadComplete,
  maxFiles = 10,
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  folder = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadedUrls, setUploadedUrls] = useState<Array<{ url: string; name: string; key: string; type: string }>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      
      // Validate files before adding them
      const validFiles: File[] = [];
      const newErrors: Record<string, string> = {};
      
      fileArray.forEach(file => {
        // Check file type
        if (!allowedTypes.includes(file.type)) {
          newErrors[file.name] = `File type ${file.type} not allowed`;
          return;
        }
        
        // Check file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          newErrors[file.name] = 'File is too large (max 10MB)';
          return;
        }
        
        validFiles.push(file);
      });
      
      // Don't add more than maxFiles
      if (uploadedFiles.length + validFiles.length > maxFiles) {
        toast.error(`You can only upload a maximum of ${maxFiles} files at once`);
        setErrors(prev => ({
          ...prev,
          maxFiles: `Maximum ${maxFiles} files allowed`
        }));
        return;
      }
      
      setErrors(newErrors);
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImageFile = (file: File) => {
    return file.type.startsWith('image/');
  };

  const handleUploadAllFiles = async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsUploading(true);
    const newUploadProgress: Record<string, number> = {};
    const newErrors: Record<string, string> = {};
    const uploadedFileUrls: Array<{ url: string; name: string; key: string; type: string }> = [];
    
    try {
      for (const file of uploadedFiles) {
        try {
          // Create a file path with folder if specified
          const filePath = folder 
            ? `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9-.]/g, '_')}` 
            : `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9-.]/g, '_')}`;
          
          // Update progress
          newUploadProgress[file.name] = 0;
          setUploadProgress({...newUploadProgress});
          
          // Upload to Cloudflare R2
          const result = await r2Client.uploadFile(file, filePath, {
            contentType: file.type,
            metadata: {
              originalName: file.name,
              uploadedAt: new Date().toISOString()
            },
            publicAccess: true
          });
          
          // Update progress to 100%
          newUploadProgress[file.name] = 100;
          setUploadProgress({...newUploadProgress});
          
          // Add to uploaded URLs
          uploadedFileUrls.push({
            url: result.url,
            name: file.name,
            key: result.key,
            type: file.type
          });
        } catch (error) {
          newErrors[file.name] = 'Failed to upload';
        }
      }
      
      setUploadedUrls([...uploadedUrls, ...uploadedFileUrls]);
      
      // Clear files that were successfully uploaded
      const failedFiles = uploadedFiles.filter(file => newErrors[file.name]);
      setUploadedFiles(failedFiles);
      
      // Notify of success
      if (uploadedFileUrls.length > 0) {
        toast.success(`Successfully uploaded ${uploadedFileUrls.length} files`);
        
        // Call the callback if provided
        if (onUploadComplete) {
          onUploadComplete(uploadedFileUrls);
        }
      }
    } catch (error) {
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
      setErrors(newErrors);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Media Upload</h1>
        <p className="text-gray-600 mt-1">Upload images and files for your content</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drag and drop files here
            </p>
            <p className="text-gray-600 mb-4">
              or click to browse files
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            <Button asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                Choose Files
              </label>
            </Button>
            <p className="text-sm text-gray-500 mt-4">
              Supported formats: Images, PDF, DOC, DOCX, TXT (Max 10MB each)
            </p>
          </div>
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files ({uploadedFiles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="border rounded-lg p-4 relative">
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  
                  <div className="flex items-center gap-3">
                    {isImageFile(file) ? (
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Image className="h-6 w-6 text-blue-600" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <File className="h-6 w-6 text-gray-600" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex gap-4">
              <Button 
                onClick={handleUploadAllFiles} 
                disabled={isUploading || uploadedFiles.length === 0}
              >
                {isUploading ? 'Uploading...' : 'Upload All Files'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setUploadedFiles([]);
                  setErrors({});
                }}
                disabled={isUploading}
              >
                Clear All
              </Button>
            </div>
            
            {/* Display uploaded URLs */}
            {uploadedUrls.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-2">Uploaded Files</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">File</th>
                        <th className="px-4 py-2 text-left">URL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadedUrls.map((file, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-2">{file.name}</td>
                          <td className="px-4 py-2 truncate max-w-[200px]">
                            <a 
                              href={file.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-blue-600 hover:underline"
                            >
                              {file.url}
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MediaUpload;