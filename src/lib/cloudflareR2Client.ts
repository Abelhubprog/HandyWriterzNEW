/**
 * Cloudflare R2 Client
 * Handles integration with Cloudflare R2 storage for media files
 */

export interface R2UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  publicAccess?: boolean;
  maxAge?: number;
}

export interface R2File {
  key: string;
  url: string;
  size: number;
  lastModified: Date;
  etag: string;
  contentType: string;
  metadata?: Record<string, string>;
}

/**
 * Cloudflare R2 Client for managing media file uploads, downloads, and organization
 */
export class CloudflareR2Client {
  private readonly apiUrl: string;
  private readonly accountId: string;
  private readonly bucketName: string;
  private readonly apiToken: string;
  private readonly publicDomain: string;

  constructor() {
    this.apiUrl = import.meta.env.VITE_CLOUDFLARE_API_URL || 'https://api.cloudflare.com/client/v4';
    this.accountId = import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID || '';
    this.bucketName = import.meta.env.VITE_CLOUDFLARE_R2_BUCKET || 'handywriterz-media';
    this.apiToken = import.meta.env.VITE_CLOUDFLARE_API_TOKEN || '';
    this.publicDomain = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_DOMAIN || '';

    if (!this.accountId || !this.apiToken) {
    }

    // In development mode, log the configuration
    if (import.meta.env.DEV) {
      console.log('[CloudflareR2Client] Config:', {
        apiUrl: this.apiUrl,
        accountIdConfigured: !!this.accountId,
        bucketName: this.bucketName,
        apiTokenConfigured: !!this.apiToken,
        publicDomain: this.publicDomain || '(not configured)'
      });
    }
  }

  /**
   * Get the R2 API URL for production or development
   */
  private getR2ApiUrl(): string {
    if (this.isDevelopmentMode()) {
      return 'http://localhost:8788/api/r2';
    }

    return `${window.location.origin}/api/r2`;
  }

  /**
   * Get headers for API requests with authentication
   */
  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Upload a file to R2 storage
   */
  /**
   * Upload file in development mode - uses local storage and simulates the upload
   * This is only used during development when Cloudflare R2 is not available
   */
  private async uploadFileDevelopment(file: File, path: string, options: R2UploadOptions = {}, progressCallback?: (progress: number) => void): Promise<R2File> {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();

        // Simulate progress updates
        if (progressCallback) {
          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            progressCallback(Math.min(progress, 100));
            if (progress >= 100) {
              clearInterval(interval);
            }
          }, 300);
        }

        reader.onload = () => {
          // In development, we'll just return a mock R2File object
          // We're not actually storing the file anywhere in dev mode
          const filePath = path || `${Date.now()}-${file.name}`;
          const fileUrl = this.getPublicUrl(filePath);


          if (progressCallback) {
            progressCallback(100);
          }

          setTimeout(() => {
            resolve({
              key: filePath,
              url: fileUrl,
              size: file.size,
              lastModified: new Date(),
              etag: `dev-${Date.now()}`,
              contentType: options.contentType || file.type,
              metadata: options.metadata ? { ...options.metadata } : undefined
            });
          }, 500); // Add a small delay to make it feel realistic
        };

        reader.onerror = () => {
          reject(new Error('Failed to read file during development mode simulation'));
        };

        // Start reading the file (we don't actually store it anywhere in dev)
        reader.readAsDataURL(file);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Check if we're running in development mode
   * This is more robust than just checking import.meta.env.DEV
   */
  private isDevelopmentMode(): boolean {
    // Check for development environment indicators
    const devIndications = [
      import.meta.env.MODE === 'development',
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
       window.location.hostname === '127.0.0.1' ||
       window.location.hostname.startsWith('192.168.'))
    ];

    // Return true if ANY dev indication is true
    return devIndications.some(indicator => indicator === true);
  }

  async uploadFile(file: File, path: string, options: R2UploadOptions = {}, progressCallback?: (progress: number) => void): Promise<R2File> {
    // Check if we're configured for production R2 usage
    const useProductionR2 = !this.isDevelopmentMode() ||
      (this.apiToken && this.accountId && this.bucketName);

    // If not fully configured for production or in dev mode, use simulation
    if (!useProductionR2) {
      return this.uploadFileDevelopment(file, path, options, progressCallback);
    }

    try {
      // Generate a unique file path if not provided
      const filePath = path || `${Date.now()}-${file.name}`;

      // Create a FormData object for the file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('key', filePath);

      // Add metadata if provided
      if (options.metadata) {
        formData.append('metadata', JSON.stringify(options.metadata));
      }

      // Get the API URL
      const url = `${this.getR2ApiUrl()}/upload`;

      // Setup progress tracking if callback is provided
      if (progressCallback) {
        // We need to use XMLHttpRequest for progress tracking
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              progressCallback(progress);
            }
          };

          xhr.onload = async () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const result = JSON.parse(xhr.responseText);

                resolve({
                  key: result.key,
                  url: result.url,
                  size: result.size,
                  lastModified: new Date(result.lastModified),
                  etag: result.etag || `etag-${Date.now()}`,
                  contentType: result.contentType || file.type,
                  metadata: result.metadata
                });
              } catch (error) {
                reject(error);
              }
            } else {
              reject(new Error(`Failed to upload file: ${xhr.statusText}`));
            }
          };

          xhr.onerror = () => {
            reject(new Error('Network error during file upload'));
          };

          xhr.open('POST', url);

          // Start the upload
          xhr.send(formData);
        });
      } else {
        // Standard fetch-based upload without progress reporting
        const response = await fetch(url, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to upload file: ${response.statusText}`);
        }

        const result = await response.json();

        return {
          key: result.key,
          url: result.url,
          size: result.size,
          lastModified: new Date(result.lastModified),
          etag: result.etag || `etag-${Date.now()}`,
          contentType: result.contentType || file.type,
          metadata: result.metadata
        };
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a list of files in the bucket with optional prefix filter
   */
  async listFiles(prefix?: string, limit: number = 1000): Promise<R2File[]> {
    try {
      // Check for development mode
      if (this.isDevelopmentMode()) {
        return [
          {
            key: `mock-file-1-${Date.now()}.pdf`,
            url: this.getPublicUrl(`mock-file-1-${Date.now()}.pdf`),
            size: 12345,
            lastModified: new Date(),
            etag: `dev-${Date.now()}-1`,
            contentType: 'application/pdf'
          },
          {
            key: `mock-file-2-${Date.now()}.jpg`,
            url: this.getPublicUrl(`mock-file-2-${Date.now()}.jpg`),
            size: 54321,
            lastModified: new Date(Date.now() - 86400000), // Yesterday
            etag: `dev-${Date.now()}-2`,
            contentType: 'image/jpeg'
          }
        ];
      }

      // Add query parameters
      const params = new URLSearchParams();
      if (prefix) params.append('prefix', prefix);
      if (limit) params.append('limit', limit.toString());

      const url = `${this.getR2ApiUrl()}/list?${params.toString()}`;

      // Get the list of files
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to list files: ${response.statusText}`);
      }

      const data = await response.json();

      // Map the response to R2File objects
      return data.files.map((obj: any) => ({
        key: obj.key,
        url: obj.url || this.getPublicUrl(obj.key),
        size: obj.size,
        lastModified: new Date(obj.lastModified),
        etag: obj.etag,
        contentType: obj.contentType || 'application/octet-stream',
        metadata: obj.metadata
      }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get details for a specific file
   */
  async getFileDetails(key: string): Promise<R2File> {
    try {
      // Check for development mode
      if (this.isDevelopmentMode()) {
        return {
          key,
          url: this.getPublicUrl(key),
          size: 12345, // Mock size
          lastModified: new Date(),
          etag: `dev-${Date.now()}`,
          contentType: 'application/octet-stream',
          metadata: { devMode: 'true' }
        };
      }

      // Prepare the request URL
      const params = new URLSearchParams({
        key: key
      });

      const url = `${this.getR2ApiUrl()}/details?${params.toString()}`;

      // Get file details
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to get file details: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        key: data.key,
        url: data.url || this.getPublicUrl(data.key),
        size: data.size,
        lastModified: new Date(data.lastModified),
        etag: data.etag || `etag-${Date.now()}`,
        contentType: data.contentType || 'application/octet-stream',
        metadata: data.metadata || {}
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a file from R2 storage
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      // Check for development mode
      if (this.isDevelopmentMode()) {
        return true;
      }

      // Prepare the request URL
      const url = `${this.getR2ApiUrl()}`;

      // Delete the file
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key })
      });

      if (!response.ok) {
        throw new Error(`Failed to delete file: ${response.statusText}`);
      }

      const data = await response.json();
      return data.success === true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Make a file publicly accessible
   */
  async makeFilePublic(key: string, maxAge: number = 31536000): Promise<string> {
    try {
      // This is a placeholder - actual implementation will depend on how
      // your Cloudflare R2 bucket is configured with public access

      // If using Cloudflare R2 with Workers to manage access:
      // 1. Set appropriate CORS headers
      // 2. Update cache-control
      // For now, we just return the public URL assuming you've configured R2 with public access

      return this.getPublicUrl(key);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get the public URL for a file (depends on your R2 bucket configuration)
   */
  getPublicUrl(key: string): string {
    // Replace with your actual public URL format
    const publicDomain = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_DOMAIN ||
      `${this.bucketName}.${import.meta.env.VITE_CLOUDFLARE_CUSTOM_DOMAIN || 'r2.dev'}`;

    return `https://${publicDomain}/${encodeURIComponent(key)}`;
  }

  /**
   * Organize files by moving them to a different path
   */
  async moveFile(oldKey: string, newKey: string): Promise<R2File> {
    try {
      // In R2, "moving" means copying then deleting

      // Step 1: Get the file content
      const getUrl = `${this.apiUrl}/accounts/${this.accountId}/r2/buckets/${this.bucketName}/objects/${encodeURIComponent(oldKey)}`;
      const getResponse = await fetch(getUrl, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!getResponse.ok) {
        throw new Error(`Failed to get file for moving: ${getResponse.statusText}`);
      }

      const fileBlob = await getResponse.blob();

      // Step 2: Copy the file to the new location
      const copyUrl = `${this.apiUrl}/accounts/${this.accountId}/r2/buckets/${this.bucketName}/objects/${encodeURIComponent(newKey)}`;
      const copyResponse = await fetch(copyUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': fileBlob.type,
        },
        body: fileBlob,
      });

      if (!copyResponse.ok) {
        throw new Error(`Failed to copy file: ${copyResponse.statusText}`);
      }

      // Step 3: Delete the original file
      await this.deleteFile(oldKey);

      // Return the new file details
      return await this.getFileDetails(newKey);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a folder (actually a placeholder object with a trailing slash)
   */
  async createFolder(path: string): Promise<boolean> {
    try {
      // Ensure path ends with a slash
      const folderPath = path.endsWith('/') ? path : `${path}/`;

      // Create an empty object with the folder path
      const url = `${this.apiUrl}/accounts/${this.accountId}/r2/buckets/${this.bucketName}/objects/${encodeURIComponent(folderPath)}`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/x-directory',
        },
        body: new Blob([], { type: 'application/x-directory' }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create folder: ${response.statusText}`);
      }

      const data = await response.json();
      return data.success === true;
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const r2Client = new CloudflareR2Client();
export default r2Client;
