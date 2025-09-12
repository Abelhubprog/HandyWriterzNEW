/**
 * Cloudflare R2 Upload Service
 * Production-ready file upload implementation
 */

interface UploadResponse {
  url: string;
  key: string;
  success: boolean;
  error?: string;
}

interface UploadOptions {
  bucket?: string;
  folder?: string;
  maxSize?: number;
  allowedTypes?: string[];
}

class CloudflareUploadService {
  private readonly defaultOptions: UploadOptions = {
    bucket: 'handywriterz-uploads',
    folder: 'content',
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
  };

  private readonly apiUrl = import.meta.env.VITE_CLOUDFLARE_R2_API_URL || '/api/upload';
  private readonly cdnUrl = import.meta.env.VITE_CLOUDFLARE_CDN_URL || 'https://cdn.handywriterz.com';

  /**
   * Upload a file to Cloudflare R2
   */
  async uploadFile(file: File, options: Partial<UploadOptions> = {}): Promise<UploadResponse> {
    const config = { ...this.defaultOptions, ...options };

    // Validate file
    const validation = this.validateFile(file, config);
    if (!validation.valid) {
      return {
        url: '',
        key: '',
        success: false,
        error: validation.error
      };
    }

    try {
      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileName = `${timestamp}-${randomString}.${fileExtension}`;
      const key = `${config.folder}/${fileName}`;

      // For development/demo, use a direct upload approach
      // In production, this would be handled by Cloudflare Workers
      const uploadUrl = await this.getUploadUrl(key, file.type);

      if (!uploadUrl) {
        throw new Error('Failed to get upload URL');
      }

      // Upload directly to R2
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        }
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      return {
        url: `${this.cdnUrl}/${key}`,
        key: key,
        success: true
      };

    } catch (error) {
      // In development allow a data URL fallback so local dev can preview files.
      const mode = (import.meta as any).env?.MODE || (import.meta as any).env?.VITE_MODE || 'production';
      if (mode === 'development') {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              url: reader.result as string,
              key: `local-${Date.now()}-${file.name}`,
              success: true
            });
          };
          reader.onerror = () => {
            resolve({
              url: '',
              key: '',
              success: false,
              error: 'Failed to read file'
            });
          };
          reader.readAsDataURL(file);
        });
      }

      // Production: return an error so callers can handle upload failure (no local blob URLs)
      return {
        url: '',
        key: '',
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Get presigned upload URL from backend
   */
  private async getUploadUrl(key: string, contentType: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.apiUrl}/presigned-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key,
          contentType,
          bucket: this.defaultOptions.bucket
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get upload URL: ${response.statusText}`);
      }

      const data = await response.json();
      return data.uploadUrl;
    } catch (error) {
      return null;
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(files: FileList | File[], options: Partial<UploadOptions> = {}): Promise<UploadResponse[]> {
    const fileArray = Array.from(files);
    const uploadPromises = fileArray.map(file => this.uploadFile(file, options));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete a file from R2
   */
  async deleteFile(key: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/${key}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Delete failed' }));
        throw new Error(errorData.error || `Delete failed: ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      };
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File, options: UploadOptions): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > options.maxSize!) {
      return {
        valid: false,
        error: `File size exceeds limit of ${Math.round(options.maxSize! / 1024 / 1024)}MB`
      };
    }

    // Check file type
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${options.allowedTypes.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Convert file to data URL for immediate preview
   */
  async fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Compress image before upload
   */
  async compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, file.type, quality);
      };

      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  }
}

// Export singleton instance
export const cloudflareUploadService = new CloudflareUploadService();
export default cloudflareUploadService;
