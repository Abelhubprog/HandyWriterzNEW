/**
 * Cloudflare Workers API for R2 Upload
 * Handles file uploads to Cloudflare R2 storage
 */

export interface Env {
  R2_BUCKET: R2Bucket;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_API_TOKEN: string;
}

interface UploadRequest {
  key: string;
  contentType: string;
  bucket?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Handle presigned URL generation
      if (pathname === '/api/upload/presigned-url' && request.method === 'POST') {
        const body: UploadRequest = await request.json();
        
        // Generate presigned URL for R2
        const presignedUrl = await env.R2_BUCKET.generatePresignedUrl(body.key, {
          method: 'PUT',
          expiresIn: 3600, // 1 hour
          contentType: body.contentType,
        });

        return new Response(JSON.stringify({
          uploadUrl: presignedUrl,
          key: body.key,
          success: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Handle direct file upload
      if (pathname === '/api/upload' && request.method === 'POST') {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const key = formData.get('key') as string;

        if (!file || !key) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Missing file or key'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Validate file size (50MB limit)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
          return new Response(JSON.stringify({
            success: false,
            error: 'File size exceeds 50MB limit'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Validate file type
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'text/plain',
          'text/csv',
          'application/rtf',
          'application/zip',
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/svg+xml',
          'image/webp'
        ];

        if (!allowedTypes.includes(file.type)) {
          return new Response(JSON.stringify({
            success: false,
            error: 'File type not allowed'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Upload to R2
        const uploadResult = await env.R2_BUCKET.put(key, file.stream(), {
          httpMetadata: {
            contentType: file.type,
            contentDisposition: `attachment; filename="${file.name}"`,
          },
          customMetadata: {
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
            fileSize: file.size.toString(),
          },
        });

        if (!uploadResult) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Failed to upload file to R2'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({
          success: true,
          key: key,
          url: `https://cdn.handywriterz.com/${key}`,
          size: file.size,
          type: file.type,
          name: file.name
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Handle file deletion
      if (pathname.startsWith('/api/upload/') && request.method === 'DELETE') {
        const key = pathname.replace('/api/upload/', '');
        
        await env.R2_BUCKET.delete(key);

        return new Response(JSON.stringify({
          success: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Handle file info
      if (pathname.startsWith('/api/upload/info/') && request.method === 'GET') {
        const key = pathname.replace('/api/upload/info/', '');
        
        const object = await env.R2_BUCKET.head(key);
        
        if (!object) {
          return new Response(JSON.stringify({
            exists: false
          }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({
          exists: true,
          size: object.size,
          lastModified: object.uploaded.toISOString(),
          contentType: object.httpMetadata?.contentType
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response('Not Found', { 
        status: 404,
        headers: corsHeaders
      });

    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },
};