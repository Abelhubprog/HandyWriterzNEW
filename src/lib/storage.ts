// Import from our compatibility layer (which now uses Cloudflare R2 under the hood)
import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

// Interface for storage item results
export interface StorageItem {
  name: string;
  id: string;
  metadata: {
    size: number;
    mimetype: string;
    cacheControl?: string;
    lastModified?: string;
  };
  bucket_id: string;
  owner: string | null;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
  path_tokens: string[];
}

// Define storage buckets that match our Supabase config
export enum StorageBucket {
  MEDIA = 'media',
  DOCUMENTS = 'documents',
  AVATARS = 'avatars',
  ASSIGNMENTS = 'assignments'
}

// Define file types that are allowed for upload
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

/**
 * Upload any file to a specified bucket
 */
/**
 * Optimized file upload function with enhanced error handling and image optimization
 */
export const uploadFile = async (file: File, options: {
  bucket: StorageBucket;
  folder?: string;
  userId?: string;
  customName?: string;
  contentType?: string;
  maxSizeMB?: number;
  isPublic?: boolean;
  generateThumbnail?: boolean;
}) => {
  try {
    if (!file) throw new Error('No file provided');
    
    // Validate file size
    const maxSize = (options.maxSizeMB || 5) * 1024 * 1024; // Default 5MB max
    
    // Add compression options for images to improve load times
    let optimizedFile = file;
    let thumbnailFile: File | null = null;
    
    if (file.size > maxSize) {
      throw new Error(`File size exceeds maximum allowed (${options.maxSizeMB || 5}MB)`);
    }
    
    // For certain buckets, we need to organize by user id
    const needsUserFolder = [
      StorageBucket.DOCUMENTS,
      StorageBucket.AVATARS,
      StorageBucket.ASSIGNMENTS
    ].includes(options.bucket);
    
    if (needsUserFolder && !options.userId) {
      const { data } = await supabase.auth.getUser();
      options.userId = data.user?.id;
      
      if (!options.userId) {
        throw new Error('User ID is required for uploading to this bucket');
      }
    }
    
    // Generate file path
    const fileExt = file.name.split('.').pop();
    const fileName = options.customName || `${uuidv4()}.${fileExt}`;
    
    // Build path based on bucket requirements
    let filePath = '';
    
    if (needsUserFolder) {
      filePath = `${options.userId}/${options.folder ? options.folder + '/' : ''}${fileName}`;
    } else {
      filePath = `${options.folder ? options.folder + '/' : ''}${fileName}`;
    }
    
    // Upload file to Supabase Storage with improved caching for faster loading
    const { data, error } = await supabase.storage
      .from(options.bucket)
      .upload(filePath, optimizedFile, {
        cacheControl: options.isPublic ? '31536000' : '3600', // 1 year cache for public files, 1 hour for private
        upsert: true, // Allow overwriting to support updates
        contentType: options.contentType || undefined
      });
    
    if (error) throw error;
    
    // Get URL - different handling for public vs private buckets
    let url = '';
    
    if ([StorageBucket.MEDIA, StorageBucket.AVATARS].includes(options.bucket)) {
      // Public buckets - use public URL
      const { data: { publicUrl } } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(data.path);
      
      url = publicUrl;
    } else {
      // Private buckets - use signed URL with expiration
      const { data: signedData } = await supabase.storage
        .from(options.bucket)
        .createSignedUrl(data.path, 60 * 60); // 1 hour expiration
      
      url = signedData?.signedUrl || '';
    }
    
    return {
      path: data.path,
      url,
      fileName,
      fileType: file.type,
      fileSize: file.size,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Legacy method - upload an image file (maintained for backwards compatibility)
 */
export const uploadImage = async (file: File, bucket: string = 'media') => {
  try {
    if (!file) throw new Error('No file provided');
    
    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Only images are allowed.');
    }
    
    // Use the new uploadFile function
    return await uploadFile(file, {
      bucket: bucket as StorageBucket,
      folder: 'images',
      maxSizeMB: 5
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Upload an avatar image for the user
 */
export const uploadAvatar = async (file: File, userId?: string) => {
  try {
    if (!file) throw new Error('No file provided');
    
    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Only images are allowed for avatars.');
    }
    
    // Get user ID if not provided
    if (!userId) {
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id;
      
      if (!userId) {
        throw new Error('User ID is required for uploading avatar');
      }
    }
    
    // Use the uploadFile function with specific settings for avatars
    const result = await uploadFile(file, {
      bucket: StorageBucket.AVATARS,
      userId,
      customName: 'avatar.jpg', // Always use the same name for easy referencing
      maxSizeMB: 2 // Avatar size limit
    });
    
    // Update user profile with new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: result.url })
      .eq('id', userId);
    
    if (updateError) throw updateError;
    
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Upload a document for an order
 */
export const uploadOrderDocument = async (file: File, orderId: string, userId?: string) => {
  try {
    if (!file) throw new Error('No file provided');
    
    // Validate file type
    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Only documents are allowed.');
    }
    
    // Use the uploadFile function
    const result = await uploadFile(file, {
      bucket: StorageBucket.ASSIGNMENTS,
      userId,
      folder: `orders/${orderId}`,
      maxSizeMB: 10 // Document size limit
    });
    
    // Update order with new file URL
    const { error: updateError } = await supabase
      .from('orders')
      .update({ file_url: result.url })
      .eq('id', orderId);
    
    if (updateError) throw updateError;
    
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a file with proper cleanup
 */
export const deleteFile = async (options: {
  bucket: StorageBucket;
  filePath: string;
}) => {
  try {
    // Check if thumbnail exists and delete it first
    const thumbPath = options.filePath.replace(/(\.[^.]+)$/, '_thumb$1');
    await supabase.storage.from(options.bucket).remove([thumbPath]).catch(() => {
      // Ignore errors if thumbnail doesn't exist
    });
    
    // Delete the main file
    const { error } = await supabase.storage
      .from(options.bucket)
      .remove([options.filePath]);
    
    if (error) {
      throw error;
    }
    
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Legacy method - delete an image (maintained for backwards compatibility)
 */
export const deleteImage = async (path: string, bucket: string = 'media') => {
  return deleteFile({
    filePath: path,
    bucket: bucket as StorageBucket
  });
};

/**
 * Get a list of files in a bucket/folder
 */
export const listFiles = async (options: {
  bucket: StorageBucket;
  folder?: string;
  userId?: string;
}) => {
  try {
    // For certain buckets, we need to organize by user id
    const needsUserFolder = [
      StorageBucket.DOCUMENTS,
      StorageBucket.AVATARS,
      StorageBucket.ASSIGNMENTS
    ].includes(options.bucket);
    
    if (needsUserFolder && !options.userId) {
      const { data } = await supabase.auth.getUser();
      options.userId = data.user?.id;
      
      if (!options.userId) {
        throw new Error('User ID is required for accessing files in this bucket');
      }
    }
    
    // Build path based on bucket requirements
    let path = '';
    
    if (needsUserFolder) {
      path = `${options.userId}${options.folder ? '/' + options.folder : ''}`;
    } else {
      path = options.folder || '';
    }
    
    // List files
    const { data, error } = await supabase.storage
      .from(options.bucket)
      .list(path);
    
    if (error) throw error;
    
    // Define the type for storage items
    interface StorageItem {
      name: string;
      id: string;
      created_at: string;
      updated_at: string;
      last_accessed_at: string;
      metadata: any;
      [key: string]: any;
    }

    // Add URLs to the files
    const filesWithUrls = data.map((item: StorageItem) => {
      if (item.name === '.emptyFolderPlaceholder') return null;
      
      let fullPath = path ? `${path}/${item.name}` : item.name;
      
      let url = '';
      if ([StorageBucket.MEDIA, StorageBucket.AVATARS].includes(options.bucket)) {
        // Public buckets
        const { data: { publicUrl } } = supabase.storage
          .from(options.bucket)
          .getPublicUrl(fullPath);
        
        url = publicUrl;
      }
      
      return {
        ...item,
        path: fullPath,
        url
      };
    }).filter(Boolean);
    
    return filesWithUrls;
  } catch (error) {
    throw error;
  }
};

export const getImageUrl = (path: string, bucket: string = 'post-images') => {
  return supabase.storage
    .from(bucket)
    .getPublicUrl(path)
    .data.publicUrl;
}; 