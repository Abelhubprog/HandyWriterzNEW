import { toast } from 'react-hot-toast';

interface StableLinkPaymentConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
  webhookSecret: string;
}

interface PaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  customerEmail: string;
  metadata?: Record<string, any>;
  redirectUrls: {
    success: string;
    cancel?: string;
    failure?: string;
  };
}

interface PaymentResponse {
  paymentId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentUrl: string;
  amount: number;
  currency: string;
  transactionHash?: string;
}

class StableLinkPaymentService {
  private config: StableLinkPaymentConfig;
  private baseUrl: string;

  constructor(config: StableLinkPaymentConfig) {
    this.config = config;
    this.baseUrl = config.environment === 'production'
      ? 'https://api.stablelink.xyz/v1'
      : 'https://api-sandbox.stablelink.xyz/v1';
  }

  async createPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          order_id: paymentRequest.orderId,
          customer_email: paymentRequest.customerEmail,
          metadata: paymentRequest.metadata || {},
          redirect_urls: paymentRequest.redirectUrls,
          payment_methods: ['usdc', 'usdt', 'eth', 'btc'],
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Payment creation failed');
      }

      const data = await response.json();
      return {
        paymentId: data.id,
        status: data.status,
        paymentUrl: data.payment_url,
        amount: data.amount,
        currency: data.currency,
        transactionHash: data.transaction_hash
      };
    } catch (error) {
      console.error('StableLink payment creation error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create payment');
    }
  }

  async checkPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment status');
      }

      const data = await response.json();
      return {
        paymentId: data.id,
        status: data.status,
        paymentUrl: data.payment_url,
        amount: data.amount,
        currency: data.currency,
        transactionHash: data.transaction_hash
      };
    } catch (error) {
      console.error('Payment status check error:', error);
      throw error;
    }
  }

  async processWebhook(payload: string, signature: string): Promise<boolean> {
    try {
      const crypto = await import('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', this.config.webhookSecret)
        .update(payload)
        .digest('hex');

      const providedSignature = signature.replace('sha256=', '');
      if (expectedSignature !== providedSignature) {
        throw new Error('Invalid webhook signature');
      }

      const event = JSON.parse(payload);
      switch (event.type) {
        case 'payment.completed':
          await this.handlePaymentCompleted(event.data);
          break;
        case 'payment.failed':
          await this.handlePaymentFailed(event.data);
          break;
        case 'payment.cancelled':
          await this.handlePaymentCancelled(event.data);
          break;
        default:
          console.log('Unhandled webhook event:', event.type);
      }

      return true;
    } catch (error) {
      console.error('Webhook processing error:', error);
      return false;
    }
  }

  private async handlePaymentCompleted(paymentData: any) {
    console.log('StableLink payment completed:', paymentData);
    // TODO: update order status, notify user, persist payment
  }

  private async handlePaymentFailed(paymentData: any) {
    console.log('StableLink payment failed:', paymentData);
    // TODO: handle failed payment
  }

  private async handlePaymentCancelled(paymentData: any) {
    console.log('StableLink payment cancelled:', paymentData);
    // TODO: handle cancelled payment
  }
}

const stableLinkConfig: StableLinkPaymentConfig = {
  apiKey: import.meta.env.VITE_STABLELINK_API_KEY || '',
  environment: import.meta.env.VITE_STABLELINK_ENVIRONMENT === 'production' ? 'production' : 'sandbox',
  webhookSecret: import.meta.env.VITE_STABLELINK_WEBHOOK_SECRET || ''
};

export const stableLinkPaymentService = new StableLinkPaymentService(stableLinkConfig);
export default stableLinkPaymentService;
