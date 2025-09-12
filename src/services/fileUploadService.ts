import { cloudflareUploadService } from './cloudflareUploadService';
import { FiFileText, FiImage, FiVideo, FiMusic, FiFile } from 'react-icons/fi';
import { formatFileSize } from '@/utils/formatters';

// File categories
export type FileCategory = 'document' | 'image' | 'video' | 'audio' | 'other';

// Maximum file size (50MB)
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Allowed file types by category
export const ALLOWED_FILE_TYPES = {
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
  'text/markdown',
    'text/csv',
    'application/rtf',
    'application/zip'
  ],
  image: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'image/webp',
    'image/tiff'
  ],
  video: [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-ms-wmv',
    'video/webm'
  ],
  audio: [
    'audio/mpeg',
    'audio/x-wav',
    'audio/ogg',
    'audio/aac',
    'audio/webm'
  ]
};

// Validate file
export const validateFile = (file: File, allowedCategories: FileCategory[] = ['document', 'image', 'video', 'audio']): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds the maximum limit of ${formatFileSize(MAX_FILE_SIZE)}`
    };
  }

  // Check file type
  let fileCategory = getFileCategory(file.type);

  // If the browser reports a generic mime type (like application/octet-stream)
  // or the mime isn't mapped, fall back to extension-based detection so we
  // don't falsely reject valid files like .md, .txt, .zip, .docx, etc.
  if (fileCategory === 'other' || file.type === 'application/octet-stream') {
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (ext) {
      fileCategory = getFileCategoryByExtension(ext);
    }
  }

  if (fileCategory === 'other' || !allowedCategories.includes(fileCategory)) {
    return {
      valid: false,
      error: `File type not supported. Allowed types: ${allowedCategories.join(', ')}`
    };
  }

  return { valid: true };
};

// Get file category from mime type
export const getFileCategory = (mimeType: string): FileCategory => {
  if (ALLOWED_FILE_TYPES.document.includes(mimeType)) return 'document';
  if (ALLOWED_FILE_TYPES.image.includes(mimeType)) return 'image';
  if (ALLOWED_FILE_TYPES.video.includes(mimeType)) return 'video';
  if (ALLOWED_FILE_TYPES.audio.includes(mimeType)) return 'audio';
  return 'other';
};

// Fallback: map by file extension
export const getFileCategoryByExtension = (ext: string): FileCategory => {
  const docExts = ['pdf','doc','docx','txt','md','markdown','rtf','csv','xls','xlsx','ppt','pptx','zip'];
  const imgExts = ['jpg','jpeg','png','gif','svg','webp','tiff','bmp'];
  const videoExts = ['mp4','mov','avi','wmv','webm'];
  const audioExts = ['mp3','wav','ogg','aac'];

  if (docExts.includes(ext)) return 'document';
  if (imgExts.includes(ext)) return 'image';
  if (videoExts.includes(ext)) return 'video';
  if (audioExts.includes(ext)) return 'audio';
  return 'other';
};

// Get file icon based on category
export const getFileIcon = (category: FileCategory) => {
  switch (category) {
    case 'document':
      return FiFileText;
    case 'image':
      return FiImage;
    case 'video':
      return FiVideo;
    case 'audio':
      return FiMusic;
    default:
      return FiFile;
  }
};

// Upload a file to Cloudflare R2 storage
export const uploadFile = async (
  file: File, 
  bucket: string, 
  path: string, 
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; url?: string; path?: string; error?: string }> => {
  try {
    // Validate file first
    const validation = validateFile(file);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      };
    }

    // Simulate progress for now (Cloudflare R2 doesn't provide upload progress)
    if (onProgress) {
      onProgress(0);
      const progressInterval = setInterval(() => {
        onProgress(Math.min(90, Math.random() * 80 + 10));
      }, 100);
      
      setTimeout(() => {
        clearInterval(progressInterval);
        onProgress(100);
      }, 1000);
    }

    // Upload using Cloudflare service
    const result = await cloudflareUploadService.uploadFile(file, {
      folder: path,
      bucket: bucket
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Upload failed'
      };
    }

    return {
      success: true,
      url: result.url,
      path: result.key
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
};

// Download a file
export const downloadFile = (url: string, fileName: string): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Delete a file from storage
export const deleteFile = async (bucket: string, path: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const result = await cloudflareUploadService.deleteFile(path);
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
};

// Upload multiple files with progress tracking
export const uploadFiles = async (
  files: File[],
  bucket: string,
  path: string,
  onProgress?: (progress: number, file: File, index: number) => void
): Promise<Array<{
  success: boolean;
  file?: File;
  fileName?: string;
  url?: string;
  path?: string;
  error?: string;
}>> => {
  const results = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = await uploadFile(file, bucket, path, 
      (progress) => onProgress && onProgress(progress, file, i)
    );
    
    results.push({
      ...result,
      file: result.success ? file : undefined,
      fileName: file.name
    });
  }

  return results;
};

// Upload multiple files with simpler interface for dashboard
export const uploadMultipleFiles = async (
  files: File[],
  onProgress?: (progress: number) => void,
  folder: string = 'orders'
): Promise<Array<{
  success: boolean;
  file?: File;
  fileName?: string;
  url?: string;
  path?: string;
  error?: string;
}>> => {
  const results = [];
  let totalProgress = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      // Validate file first
      const validation = validateFile(file);
      if (!validation.valid) {
        results.push({
          success: false,
          file,
          fileName: file.name,
          error: validation.error
        });
        continue;
      }

      // Use the document submission service for consistency
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop() || 'bin';
      const fileName = `${timestamp}_${i}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `${folder}/${Date.now()}/${fileName}`;

      // Import and use document submission service
      const { documentSubmissionService } = await import('./documentSubmissionService');

      // Retry logic for transient upload failures
      const MAX_ATTEMPTS = 3;
      let attempt = 0;
      let lastError: any = null;
      let uploadOk = false;
      let uploadResult: any = null;

      while (attempt < MAX_ATTEMPTS && !uploadOk) {
        attempt++;
        try {
          uploadResult = await documentSubmissionService.uploadToR2Worker(file, filePath);
          if (uploadResult && uploadResult.success) {
            uploadOk = true;
            break;
          }
          lastError = uploadResult?.error || 'Upload failed';
        } catch (err) {
          lastError = err;
        }

        // backoff before retry
        await new Promise(res => setTimeout(res, 300 * attempt));
      }

      if (uploadOk && uploadResult) {
        results.push({
          success: true,
          file,
          fileName: file.name,
          url: uploadResult.url,
          path: filePath
        });
      } else {
        results.push({
          success: false,
          file,
          fileName: file.name,
          error: lastError instanceof Error ? lastError.message : String(lastError || 'Upload failed')
        });
      }

    } catch (error) {
      results.push({
        success: false,
        file,
        fileName: file.name,
        error: error instanceof Error ? error.message : 'Upload failed'
      });
    }

    // Update progress
    totalProgress = ((i + 1) / files.length) * 100;
    if (onProgress) {
      onProgress(Math.round(totalProgress));
    }
  }

  return results;
};

// Utility function to format file size
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Default export
const fileUploadService = {
  uploadFile,
  uploadFiles,
  uploadMultipleFiles,
  downloadFile,
  deleteFile,
  validateFile,
  getFileCategory,
  getFileIcon,
  formatBytes
};

export default fileUploadService;
