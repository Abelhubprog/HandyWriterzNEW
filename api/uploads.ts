import { Router } from 'itty-router';

const router = Router();

router.post('/api/uploads', async (request: Request, env: any) => {
  try {
    const body = await request.json();

    const { userId, userName, userEmail, uploadTimestamp, fileCount, totalSize, fileNames, metadata } = body;

    if (!env.DB) {
      return new Response(JSON.stringify({ error: 'Database not configured' }), { status: 500 });
    }

    const stmt = await env.DB.prepare(`
      INSERT INTO uploads (user_id, user_name, user_email, upload_timestamp, file_count, total_size, file_names, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(userId, userName, userEmail, uploadTimestamp, fileCount, totalSize, JSON.stringify(fileNames || []), JSON.stringify(metadata || {})).run();

    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500 });
  }
});

addEventListener('fetch', (event: any) => {
  event.respondWith(router.handle(event.request, event));
});
