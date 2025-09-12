import { logger } from '../lib/logger';
import databaseService from './databaseService';

interface ChargeOptions {
  amount: number;
  currency: string;
  name: string;
  description: string;
  metadata?: Record<string, string>;
}

interface ChargeResponse {
  id: string;
  url: string;
  status: string;
}

export async function createCharge(options: ChargeOptions): Promise<ChargeResponse> {
  try {
    const response = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': process.env.COINBASE_COMMERCE_API_KEY!,
        'X-CC-Version': '2018-03-22'
      },
      body: JSON.stringify({
        name: options.name,
        description: options.description,
        pricing_type: 'fixed_price',
        local_price: {
          amount: options.amount.toString(),
          currency: options.currency
        },
        metadata: options.metadata
      })
    });

    if (!response.ok) {
      const error = await response.json();
      logger.error('Failed to create charge', { error });
      throw new Error('Failed to create payment charge');
    }

    const data = await response.json();
    return {
      id: data.data.id,
      url: data.data.hosted_url,
      status: data.data.timeline[0]?.status
    };
  } catch (error) {
    logger.error('Payment service error', { error });
    throw new Error('Failed to create payment charge');
  }
}

export async function verifyPayment(chargeId: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.commerce.coinbase.com/charges/${chargeId}`, {
      headers: {
        'X-CC-Api-Key': process.env.COINBASE_COMMERCE_API_KEY!,
        'X-CC-Version': '2018-03-22'
      }
    });

    if (!response.ok) {
      logger.error('Failed to verify payment', { 
        chargeId,
        status: response.status 
      });
      return false;
    }

    const data = await response.json();
    const timeline = data.data.timeline;
    const lastStatus = timeline[timeline.length - 1]?.status;

    // Check if payment is confirmed
    const isConfirmed = lastStatus === 'COMPLETED' || lastStatus === 'CONFIRMED';
    
    if (!isConfirmed) {
      logger.info('Payment not confirmed', { 
        chargeId,
        status: lastStatus 
      });
    }

    return isConfirmed;
  } catch (error) {
    logger.error('Payment verification error', { error, chargeId });
    return false;
  }
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
  created_at: string;
  metadata: {
    plan_id?: string;
    plan_name?: string;
    invoice_id?: string;
    receipt_url?: string;
  };
}

class PaymentService {
  async createPayment(data: {
    amount: number;
    currency: string;
    user_id: string;
    method: string;
    metadata?: Record<string, any>;
  }): Promise<Payment> {
    try {
      const paymentData = {
        id: `payment_${Date.now()}`,
        amount: data.amount,
        currency: data.currency,
        user_id: data.user_id,
        status: 'succeeded' as const,
        method: data.method,
        metadata: data.metadata || {},
        created_at: new Date().toISOString()
      };

      // For now, use mock data since we need to implement payments table in database
      // TODO: Implement payments table in Cloudflare D1 schema
      return paymentData;
    } catch (error) {
      logger.error('Failed to create payment:', error);
      throw new Error('Failed to create payment');
    }
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    try {
      // Mock data for development - replace with actual database call
      // TODO: Implement with databaseService.getPayments(userId)
      return [
        {
          id: `payment_${Date.now()}`,
          amount: 50.00,
          currency: 'USD',
          status: 'succeeded',
          created_at: new Date().toISOString(),
          metadata: {
            plan_id: 'plan_basic',
            plan_name: 'Basic Plan'
          }
        }
      ];
    } catch (error) {
      logger.error('Failed to get user payments:', error);
      return [];
    }
  }

  async getPaymentById(paymentId: string): Promise<Payment | null> {
    try {
      // Mock implementation - replace with actual database call
      // TODO: Implement with databaseService.getPayment(paymentId)
      return {
        id: paymentId,
        amount: 50.00,
        currency: 'USD',
        status: 'succeeded',
        created_at: new Date().toISOString(),
        metadata: {}
      };
    } catch (error) {
      logger.error('Failed to get payment:', error);
      return null;
    }
  }

  async updatePaymentStatus(paymentId: string, status: Payment['status']): Promise<boolean> {
    try {
      // Mock implementation - replace with actual database call
      // TODO: Implement with databaseService.updatePayment(paymentId, { status })
      logger.info(`Payment ${paymentId} status updated to ${status}`);
      return true;
    } catch (error) {
      logger.error('Failed to update payment status:', error);
      return false;
    }
  }
}

export const paymentService = new PaymentService();
