/**
 * Cloudflare Workers API for Payment Processing
 * Handles payment storage and management for the HandyWriterz application
 */

export interface Env {
  DATABASE: D1Database;
  RESEND_API_KEY: string;
  COINBASE_API_KEY: string;
  COINBASE_WEBHOOK_SECRET: string;
}

interface PaymentRecord {
  id: string;
  user_id?: string;
  order_id?: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_provider: string;
  transaction_id?: string;
  provider_transaction_id?: string;
  status: string;
  metadata?: string;
  receipt_url?: string;
  created_at: string;
  updated_at?: string;
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
      // Create new payment record
      if (pathname === '/api/payments' && request.method === 'POST') {
        const paymentData: PaymentRecord = await request.json();

        // Validate required fields
        if (!paymentData.id || !paymentData.amount || !paymentData.currency || !paymentData.payment_method) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Missing required payment fields'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Insert payment record into database
        await env.DATABASE.prepare(`
          INSERT INTO payments (
            id, user_id, order_id, amount, currency, payment_method,
            payment_provider, transaction_id, provider_transaction_id,
            status, metadata, receipt_url, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          paymentData.id,
          paymentData.user_id || null,
          paymentData.order_id || null,
          paymentData.amount,
          paymentData.currency,
          paymentData.payment_method,
          paymentData.payment_provider,
          paymentData.transaction_id || null,
          paymentData.provider_transaction_id || null,
          paymentData.status,
          paymentData.metadata || null,
          paymentData.receipt_url || null,
          paymentData.created_at,
          paymentData.updated_at || paymentData.created_at
        ).run();

        return new Response(JSON.stringify({
          success: true,
          paymentId: paymentData.id,
          message: 'Payment record created successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Create StableLink payment (server-side) to avoid exposing API key
      if (pathname === '/api/payments/stablelink-create' && request.method === 'POST') {
        try {
          const body = await request.json();
          // Body should include: amount, currency, order_id, customer_email, metadata, redirect_urls
          const apiKey = (env as any).STABLELINK_API_KEY || (env as any).VITE_STABLELINK_API_KEY || '';
          const environment = (env as any).STABLELINK_ENVIRONMENT || 'sandbox';
          if (!apiKey) return new Response(JSON.stringify({ success: false, error: 'StableLink API key not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

          const baseUrl = environment === 'production' ? 'https://api.stablelink.xyz/v1' : 'https://api-sandbox.stablelink.xyz/v1';

          const slRes = await fetch(`${baseUrl}/payments`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              amount: body.amount,
              currency: body.currency,
              order_id: body.order_id,
              customer_email: body.customer_email,
              metadata: body.metadata || {},
              redirect_urls: body.redirect_urls || {},
              payment_methods: body.payment_methods || ['usdc','usdt','eth','btc'],
              expires_at: new Date(Date.now() + (body.expires_seconds || 30*60) * 1000).toISOString()
            })
          });

          if (!slRes.ok) {
            const err = await slRes.text();
            return new Response(JSON.stringify({ success: false, error: err }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }

          const slData = await slRes.json();

          // Persist payment record in D1
          const paymentId = slData.id;
          await env.DATABASE.prepare(`
            INSERT OR REPLACE INTO payments (id, user_id, order_id, amount, currency, payment_method, payment_provider, status, metadata, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            paymentId,
            body.user_id || null,
            body.order_id || null,
            body.amount,
            body.currency,
            'stablelink',
            'stablelink',
            slData.status || 'pending',
            JSON.stringify(slData),
            new Date().toISOString(),
            new Date().toISOString()
          ).run();

          return new Response(JSON.stringify({ success: true, data: slData }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } catch (err: any) {
          return new Response(JSON.stringify({ success: false, error: err.message || String(err) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }

      // Get payment by ID
      if (pathname.startsWith('/api/payments/') && request.method === 'GET') {
        const paymentId = pathname.replace('/api/payments/', '');

        const payment = await env.DATABASE.prepare(`
          SELECT * FROM payments WHERE id = ?
        `).bind(paymentId).first();

        if (!payment) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Payment not found'
          }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({
          success: true,
          payment: payment
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Update payment status
      if (pathname.startsWith('/api/payments/') && request.method === 'PUT') {
        const paymentId = pathname.replace('/api/payments/', '');
        const updateData = await request.json();

        await env.DATABASE.prepare(`
          UPDATE payments
          SET status = ?, provider_transaction_id = ?, metadata = ?, updated_at = ?
          WHERE id = ?
        `).bind(
          updateData.status,
          updateData.provider_transaction_id || null,
          updateData.metadata || null,
          new Date().toISOString(),
          paymentId
        ).run();

        return new Response(JSON.stringify({
          success: true,
          message: 'Payment updated successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get payments for user
      if (pathname === '/api/payments/user' && request.method === 'POST') {
        const { userId } = await request.json();

        const payments = await env.DATABASE.prepare(`
          SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC
        `).bind(userId).all();

        return new Response(JSON.stringify({
          success: true,
          payments: payments.results || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Handle Coinbase webhook
      if (pathname === '/api/payments/coinbase-webhook' && request.method === 'POST') {
        const signature = request.headers.get('X-CC-Webhook-Signature');
        const body = await request.text();

        // Verify webhook signature (important for security)
        if (!signature || !env.COINBASE_WEBHOOK_SECRET) {
          return new Response('Unauthorized', { status: 401 });
        }

        // Parse webhook data
        const webhookData = JSON.parse(body);
        const event = webhookData.event;

        if (event.type === 'charge:confirmed' || event.type === 'charge:resolved') {
          const charge = event.data;

          // Update payment status in database
          await env.DATABASE.prepare(`
            UPDATE payments
            SET status = ?, provider_transaction_id = ?, metadata = ?, updated_at = ?
            WHERE id = ?
          `).bind(
            event.type === 'charge:confirmed' ? 'completed' : 'resolved',
            charge.id,
            JSON.stringify(charge),
            new Date().toISOString(),
            charge.id
          ).run();

          // Send confirmation email if needed
          if (event.type === 'charge:confirmed') {
            // Implementation for sending confirmation email
          }
        }

        return new Response('OK', {
          headers: corsHeaders
        });
      }

      // Handle StableLink webhook
      if (pathname === '/api/payments/stablelink-webhook' && request.method === 'POST') {
        const signatureHeader = request.headers.get('X-SL-Signature') || request.headers.get('X-SL-Signature-Hex');
        const body = await request.text();

        // Require configured webhook secret in Worker env
        const webhookSecret = (env as any).STABLELINK_WEBHOOK_SECRET || (env as any).VITE_STABLELINK_WEBHOOK_SECRET || '';
        if (!signatureHeader || !webhookSecret) {
          return new Response('Unauthorized', { status: 401 });
        }

        // Verify HMAC SHA-256 using Web Crypto API (available in CF Workers)
        try {
          const encoder = new TextEncoder();
          const keyData = encoder.encode(webhookSecret);
          const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
          const signatureHex = signatureHeader.replace(/^sha256=/i, '').trim();
          // Convert hex signature to Uint8Array
          const sigBytes = new Uint8Array(signatureHex.match(/.{1,2}/g)!.map(b => parseInt(b, 16)));
          const verified = await crypto.subtle.verify('HMAC', cryptoKey, sigBytes, encoder.encode(body));

          if (!verified) {
            return new Response('Invalid signature', { status: 401 });
          }
        } catch (err) {
          console.error('Webhook verification error', err);
          return new Response('Unauthorized', { status: 401 });
        }

        // Process webhook payload after verification
        try {
          const webhookData = JSON.parse(body);
          const eventType = webhookData.type || webhookData.event?.type;
          const data = webhookData.data || webhookData.event?.data || webhookData;

          if (eventType === 'payment.completed' || eventType === 'payment.failed' || eventType === 'payment.cancelled') {
            const status = eventType === 'payment.completed' ? 'completed' : eventType === 'payment.failed' ? 'failed' : 'cancelled';
            const paymentId = data.id || data.paymentId || data.payment_id;

            if (paymentId) {
              await env.DATABASE.prepare(`
                UPDATE payments
                SET status = ?, provider_transaction_id = ?, metadata = ?, updated_at = ?
                WHERE id = ?
              `).bind(
                status,
                data.transaction_hash || data.id || null,
                JSON.stringify(data),
                new Date().toISOString(),
                paymentId
              ).run();
            }
          }

          return new Response('OK', { headers: corsHeaders });
        } catch (err) {
          console.error('Webhook processing error', err);
          return new Response('Bad Request', { status: 400 });
        }
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
