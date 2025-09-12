/**
 * Cloudflare Worker endpoint to receive Clerk webhooks and sync users into D1
 */
export interface Env {
  DATABASE: D1Database;
  CLERK_WEBHOOK_SECRET?: string;
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      const body = await request.json();

      // Best-effort: handle Clerk user.created event
      const type = body.type || body.event?.type;
      const data = body.data || body.event?.data || body;

      if (type === 'user.created' || (data && data.object === 'user')) {
        const user = data.object || data;
        const id = user.id || user.user_id || user.clerk_id;
        const email = (user.email_addresses && user.email_addresses[0]?.email_address) || user.primary_email_address || user.email || '';
        const firstName = user.first_name || user.firstName || '';
        const lastName = user.last_name || user.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim() || user.name || '';
        const avatar = user.profile_image_url || user.image_url || user.imageUrl || null;

        if (!id) {
          return new Response(JSON.stringify({ success: false, error: 'Missing user id' }), { status: 400 });
        }

        // Insert or ignore if exists
        await env.DATABASE.prepare(`
          INSERT OR REPLACE INTO user_profiles (id, full_name, email, avatar_url, role, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          id,
          fullName,
          email,
          avatar,
          'user',
          'active',
          new Date().toISOString(),
          new Date().toISOString()
        ).run();

        return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ success: false, error: 'Unhandled event type' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    } catch (err: any) {
      return new Response(JSON.stringify({ success: false, error: err.message || String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }
};
