import { R2Bucket } from '@cloudflare/workers-types';

interface Env {
  STORAGE: R2Bucket;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }
  
  try {
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/r2', '').replace(/^\/+/, '');
    
    // File operations based on HTTP method
    if (request.method === 'GET') {
      // Get file metadata or file list
      if (path === 'list') {
        // List files in bucket or prefix
        const prefix = url.searchParams.get('prefix') || '';
        const delimiter = url.searchParams.get('delimiter') || '/';
        const limit = parseInt(url.searchParams.get('limit') || '1000', 10);
        
        const listed = await env.STORAGE.list({
          prefix,
          delimiter,
          limit,
        });
        
        // Format response
        const files = listed.objects.map(object => ({
          key: object.key,
          size: object.size,
          etag: object.etag,
          lastModified: object.uploaded,
        }));
        
        return new Response(JSON.stringify({ 
          files, 
          prefixes: listed.delimitedPrefixes 
        }), {
          headers: { ...headers, 'Content-Type': 'application/json' }
        });
      } 
      else if (path === 'details') {
        // Get file metadata
        const key = url.searchParams.get('key');
        if (!key) {
          return new Response(JSON.stringify({ error: 'Missing file key' }), {
            status: 400,
            headers: { ...headers, 'Content-Type': 'application/json' }
          });
        }
        
        const object = await env.STORAGE.head(key);
        if (object === null) {
          return new Response(JSON.stringify({ error: 'File not found' }), {
            status: 404,
            headers: { ...headers, 'Content-Type': 'application/json' }
          });
        }
        
        // Generate public URL
        const publicUrl = `${url.origin}/r2/${key}`;
        
        return new Response(JSON.stringify({
          key,
          url: publicUrl,
          size: object.size,
          etag: object.etag,
          lastModified: object.uploaded,
          contentType: object.httpMetadata.contentType,
          metadata: object.customMetadata,
        }), {
          headers: { ...headers, 'Content-Type': 'application/json' }
        });
      }
      else {
        // Serve file directly
        const key = path;
        const object = await env.STORAGE.get(key);
        
        if (object === null) {
          return new Response('File not found', { status: 404, headers });
        }
        
        // Get file details and prepare headers for response
        const fileHeaders = new Headers(headers);
        fileHeaders.set('Content-Type', object.httpMetadata.contentType || 'application/octet-stream');
        fileHeaders.set('Content-Length', object.size.toString());
        fileHeaders.set('ETag', object.etag);
        
        if (object.httpMetadata.cacheControl) {
          fileHeaders.set('Cache-Control', object.httpMetadata.cacheControl);
        } else {
          fileHeaders.set('Cache-Control', 'public, max-age=31536000');
        }
        
        return new Response(object.body, {
          headers: fileHeaders
        });
      }
    } 
    else if (request.method === 'POST' || request.method === 'PUT') {
      // Handle file uploads
      if (path === 'upload') {
        // Get file key and other options from the request
        let key;
        let contentType;
        let metadata = {};
        let file;
        
        const contentTypeHeader = request.headers.get('Content-Type') || '';
        
        if (contentTypeHeader.includes('multipart/form-data')) {
          // Handle multipart form data upload
          const formData = await request.formData();
          file = formData.get('file') as File;
          key = formData.get('key') as string || file.name;
          contentType = file.type;
          
          // Parse metadata if provided
          const metadataField = formData.get('metadata');
          if (metadataField) {
            try {
              metadata = JSON.parse(metadataField as string);
            } catch (e) {
              console.error('Invalid metadata JSON:', e);
            }
          }
        } else {
          // Handle direct upload (not form data)
          const requestBody = await request.json();
          key = requestBody.key;
          
          // For direct uploads, we expect the file content to be base64 encoded
          if (!key || !requestBody.base64Content) {
            return new Response(JSON.stringify({ error: 'Missing key or file content' }), {
              status: 400,
              headers: { ...headers, 'Content-Type': 'application/json' }
            });
          }
          
          // Decode base64 content
          const binaryContent = atob(requestBody.base64Content);
          const bytes = new Uint8Array(binaryContent.length);
          for (let i = 0; i < binaryContent.length; i++) {
            bytes[i] = binaryContent.charCodeAt(i);
          }
          
          file = new Blob([bytes], { type: requestBody.contentType || 'application/octet-stream' });
          contentType = requestBody.contentType;
          metadata = requestBody.metadata || {};
        }
        
        if (!key) {
          return new Response(JSON.stringify({ error: 'Missing file key' }), {
            status: 400,
            headers: { ...headers, 'Content-Type': 'application/json' }
          });
        }
        
        // Upload the file to R2
        const uploadOptions = {
          httpMetadata: {
            contentType,
          },
          customMetadata: metadata
        };
        
        await env.STORAGE.put(key, file, uploadOptions);
        
        // Generate public URL
        const publicUrl = `${url.origin}/r2/${key}`;
        
        return new Response(JSON.stringify({
          key,
          url: publicUrl,
          size: file.size,
          lastModified: new Date().toISOString(),
          contentType,
          metadata
        }), {
          headers: { ...headers, 'Content-Type': 'application/json' }
        });
      }
    } 
    else if (request.method === 'DELETE') {
      // Delete file
      const requestBody = await request.json();
      const key = requestBody.key;
      
      if (!key) {
        return new Response(JSON.stringify({ error: 'Missing file key' }), {
          status: 400,
          headers: { ...headers, 'Content-Type': 'application/json' }
        });
      }
      
      // Delete file from R2
      await env.STORAGE.delete(key);
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }
    
    // Default response for unhandled routes
    return new Response(JSON.stringify({ error: 'Invalid operation' }), {
      status: 400,
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('R2 API error:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  }
};
