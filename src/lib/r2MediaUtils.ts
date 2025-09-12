/**
 * Utility functions for working with Cloudflare R2 media storage
 */
import { CloudflareR2Client } from './cloudflareR2Client';
import mockR2Client from './mockR2Client';

// Check if required environment variables are available
const isR2Configured = () => {
  return Boolean(
    import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID &&
    import.meta.env.VITE_CLOUDFLARE_R2_BUCKET &&
    import.meta.env.VITE_CLOUDFLARE_API_TOKEN
  );
};

// Create an instance of the R2 client or use mock client if not configured
const r2Client = isR2Configured() 
  ? new CloudflareR2Client({
      accountId: import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID,
      bucketName: import.meta.env.VITE_CLOUDFLARE_R2_BUCKET,
      apiToken: import.meta.env.VITE_CLOUDFLARE_API_TOKEN,
      apiUrl: import.meta.env.VITE_CLOUDFLARE_API_URL,
      publicDomain: import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_DOMAIN,
    })
  : mockR2Client;

// Log which client is being used

export interface MediaItem {
  id: string;
  name: string;
  type: string; // 'image', 'video', 'audio', 'document', 'other'
  mimeType: string;
  size: number;
  url: string;
  previewUrl?: string;
  uploadedAt: string;
  createdBy?: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

/**
 * Convert R2File to MediaItem format
 */
export function r2FileToMediaItem(file: R2File): MediaItem {
  // Extract file extension and determine type
  let type = 'document';
  const mimeType = file.contentType || 'application/octet-stream';
  
  if (mimeType.startsWith('image/')) {
    type = 'image';
  } else if (mimeType.startsWith('video/')) {
    type = 'video';
  } else if (mimeType.startsWith('audio/')) {
    type = 'audio';
  } else if (
    mimeType.includes('pdf') || 
    mimeType.includes('document') || 
    mimeType.includes('text')
  ) {
    type = 'document';
  } else {
    type = 'other';
  }
  
  // Extract filename from path
  const filename = file.key.split('/').pop() || file.key;
  
  // Extract timestamp from metadata or use last modified
  const uploadedAtStr = file.metadata?.uploadedAt || file.lastModified.toISOString();
  
  return {
    id: file.key,
    name: filename,
    type,
    mimeType,
    size: file.size,
    url: file.url,
    previewUrl: type === 'image' ? file.url : undefined,
    uploadedAt: uploadedAtStr,
    createdBy: file.metadata?.createdBy || 'admin'
  };
}

/**
 * Get all media items from R2 storage
 */
export async function getAllMediaItems(): Promise<MediaItem[]> {
  try {
    const r2Files = await r2Client.listFiles();
    return r2Files.map(r2FileToMediaItem);
  } catch (error) {
    throw error;
  }
}

/**
 * Get media items of a specific type
 */
export async function getMediaItemsByType(type: string): Promise<MediaItem[]> {
  try {
    // Use type as folder prefix for filtering
    // In our R2 structure, files are stored in type-based folders
    const prefix = `${type}/`;
    const r2Files = await r2Client.listFiles(prefix);
    return r2Files.map(r2FileToMediaItem);
  } catch (error) {
    throw error;
  }
}

/**
 * Upload a file to R2 storage
 */
export async function uploadMediaFile(
  file: File, 
  userId?: string
): Promise<MediaItem> {
  try {
    // Determine file type folder for organization
    let typeFolder = 'other';
    if (file.type.startsWith('image/')) {
      typeFolder = 'images';
    } else if (file.type.startsWith('video/')) {
      typeFolder = 'videos';
    } else if (file.type.startsWith('audio/')) {
      typeFolder = 'audio';
    } else if (
      file.type.includes('pdf') || 
      file.type.includes('document') || 
      file.type.includes('text')
    ) {
      typeFolder = 'documents';
    }
    
    // Generate a clean filename
    const safeFileName = file.name.replace(/[^a-zA-Z0-9-.]/g, '_');
    const filePath = `${typeFolder}/${Date.now()}-${safeFileName}`;
    
    // Upload to R2 storage
    const result = await r2Client.uploadFile(file, filePath, {
      contentType: file.type,
      metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        createdBy: userId || 'admin'
      },
      publicAccess: true
    });
    
    return r2FileToMediaItem(result);
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a file from R2 storage
 */
export async function deleteMediaFile(key: string): Promise<boolean> {
  try {
    return await r2Client.deleteFile(key);
  } catch (error) {
    throw error;
  }
}

/**
 * Sort media items
 */
export function sortMediaItems(
  items: MediaItem[], 
  sortBy: 'name' | 'uploadedAt' | 'size' = 'uploadedAt',
  sortOrder: 'asc' | 'desc' = 'desc'
): MediaItem[] {
  return [...items].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'uploadedAt':
        comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
}

/**
 * Filter media items by search query
 */
export function filterMediaItems(items: MediaItem[], query: string): MediaItem[] {
  if (!query) return items;
  
  const lowercaseQuery = query.toLowerCase();
  return items.filter(item => 
    item.name.toLowerCase().includes(lowercaseQuery) || 
    item.type.toLowerCase().includes(lowercaseQuery)
  );
}

/**
 * Paginate media items
 */
export function paginateMediaItems(
  items: MediaItem[], 
  page: number, 
  itemsPerPage: number
): MediaItem[] {
  const startIndex = (page - 1) * itemsPerPage;
  return items.slice(startIndex, startIndex + itemsPerPage);
}

/**
 * Move a file to a different folder in R2
 */
export async function moveMediaFile(oldKey: string, newFolder: string): Promise<MediaItem> {
  try {
    // Extract filename from old key
    const filename = oldKey.split('/').pop() || oldKey;
    
    // Create new key with new folder
    const newKey = `${newFolder}/${filename}`;
    
    // Move the file
    const result = await r2Client.moveFile(oldKey, newKey);
    
    return r2FileToMediaItem(result);
  } catch (error) {
    throw error;
  }
}

/**
 * Create a folder in R2 (creates empty placeholder object)
 */
export async function createMediaFolder(folderPath: string): Promise<boolean> {
  try {
    return await r2Client.createFolder(folderPath);
  } catch (error) {
    throw error;
  }
}
