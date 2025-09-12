/**
 * Storage Compatibility Layer for Cloudflare R2
 * 
 * This file provides a Supabase Storage API-like interface 
 * but uses Cloudflare R2 bucket storage under the hood.
 */

import { v4 as uuidv4 } from 'uuid';

// Define bucket types
export enum StorageBucket {
  MEDIA = 'media',
  DOCUMENTS = 'documents',
  AVATARS = 'avatars',
  ASSIGNMENTS = 'assignments'
}

// Define file type constraints
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

// Interface for storage response
export interface StorageResponse {
  data: any | null;
  error: Error | null;
}

// Storage item interface
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

// Cloudflare R2 Storage Client
class CloudflareStorage {
  private apiUrl: string;
  private apiToken: string;
  
  constructor() {
    this.apiUrl = import.meta.env.VITE_CLOUDFLARE_R2_API_URL || '';
    this.apiToken = import.meta.env.VITE_CLOUDFLARE_R2_API_TOKEN || '';
  }
  
  /**
   * Select a storage bucket
   */
  from(bucketName: StorageBucket) {
    return {
      /**
       * Upload a file to the bucket
       */
      upload: async (path: string, fileBody: File | Blob, options?: {
        cacheControl?: string;
        contentType?: string;
        upsert?: boolean;
      }): Promise<StorageResponse> => {
        try {
          if (!this.apiUrl) {
            throw new Error('Cloudflare R2 API URL not configured');
          }
          
          // Build the form data
          const formData = new FormData();
          formData.append('file', fileBody);
          formData.append('path', path);
          formData.append('bucket', bucketName);
          
          if (options?.cacheControl) {
            formData.append('cacheControl', options.cacheControl);
          }
          
          if (options?.contentType) {
            formData.append('contentType', options.contentType);
          }
          
          formData.append('upsert', options?.upsert ? 'true' : 'false');
          
          // Make request to our API endpoint that handles R2
          const response = await fetch(`${this.apiUrl}/storage/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.apiToken}`,
            },
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
          }
          
          const data = await response.json();
          return { data, error: null };
        } catch (error) {
          return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
        }
      },
      
      /**
       * Download a file from the bucket
       */
      download: async (path: string): Promise<StorageResponse> => {
        try {
          if (!this.apiUrl) {
            throw new Error('Cloudflare R2 API URL not configured');
          }
          
          const response = await fetch(`${this.apiUrl}/storage/download`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.apiToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              bucket: bucketName,
              path: path,
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Download failed: ${response.statusText}`);
          }
          
          const data = await response.blob();
          return { data, error: null };
        } catch (error) {
          return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
        }
      },
      
      /**
       * Get public URL for a file
       */
      getPublicUrl: (path: string) => {
        // Return the publicly accessible URL (through Cloudflare's CDN)
        const cdnUrl = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL || '';
        const publicUrl = `${cdnUrl}/${bucketName}/${path}`;
        
        return { data: { publicUrl }, error: null };
      },
      
      /**
       * List files in the bucket
       */
      list: async (options?: { limit?: number; offset?: number; sortBy?: { column: string; order: 'asc' | 'desc' }; path?: string }): Promise<StorageResponse> => {
        try {
          if (!this.apiUrl) {
            throw new Error('Cloudflare R2 API URL not configured');
          }
          
          const queryParams = new URLSearchParams();
          queryParams.append('bucket', bucketName);
          
          if (options?.limit) {
            queryParams.append('limit', options.limit.toString());
          }
          
          if (options?.offset) {
            queryParams.append('offset', options.offset.toString());
          }
          
          if (options?.path) {
            queryParams.append('prefix', options.path);
          }
          
          if (options?.sortBy) {
            queryParams.append('sortColumn', options.sortBy.column);
            queryParams.append('sortOrder', options.sortBy.order);
          }
          
          const response = await fetch(`${this.apiUrl}/storage/list?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${this.apiToken}`,
            },
          });
          
          if (!response.ok) {
            throw new Error(`List operation failed: ${response.statusText}`);
          }
          
          const data = await response.json();
          return { data, error: null };
        } catch (error) {
          return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
        }
      },
      
      /**
       * Remove files from the bucket
       */
      remove: async (paths: string[]): Promise<StorageResponse> => {
        try {
          if (!this.apiUrl) {
            throw new Error('Cloudflare R2 API URL not configured');
          }
          
          const response = await fetch(`${this.apiUrl}/storage/remove`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.apiToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              bucket: bucketName,
              paths: paths,
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Remove operation failed: ${response.statusText}`);
          }
          
          const data = await response.json();
          return { data, error: null };
        } catch (error) {
          return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
        }
      },
    };
  }
}

// Create and export an instance
export const storage = new CloudflareStorage();
export default storage;
