import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { cloudflareDb } from '@/lib/cloudflare';
import { toast } from 'react-hot-toast';

export interface BillingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  interval: 'month' | 'year';
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  type: 'payment' | 'refund';
  created_at: string;
  metadata: any;
}

export interface Invoice {
  id: string;
  user_id: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'void';
  due_date: string;
  paid_at?: string;
  items: Array<{
    description: string;
    amount: number;
    quantity: number;
  }>;
}

export function useBilling() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const getPlans = async () => {
    try {
      const data = await cloudflareDb.query(
        'SELECT * FROM billing_plans ORDER BY price ASC'
      );
      return data.results || [];
    } catch (error) {
      return null;
    }
  };

  const getCurrentPlan = async () => {
    if (!user) return null;

    try {
      const data = await cloudflareDb.query(
        `SELECT s.*, p.* FROM user_subscriptions s 
         JOIN billing_plans p ON s.plan_id = p.id 
         WHERE s.user_id = ? LIMIT 1`,
        [user.id]
      );
      return data.results?.[0] || null;
    } catch (error) {
      return null;
    }
  };

  const subscribeToPlan = async (planId: string) => {
    if (!user) {
      toast.error('You must be logged in to subscribe');
      return { success: false };
    }

    setLoading(true);
    try {
      // First, check if user already has a subscription
      const existingData = await cloudflareDb.query(
        'SELECT id FROM user_subscriptions WHERE user_id = ? LIMIT 1',
        [user.id]
      );

      if (existingData.results && existingData.results.length > 0) {
        // Update existing subscription
        await cloudflareDb.query(
          'UPDATE user_subscriptions SET plan_id = ?, updated_at = ? WHERE id = ?',
          [planId, new Date().toISOString(), existingData.results[0].id]
        );
      } else {
        // Create new subscription
        await cloudflareDb.query(
          'INSERT INTO user_subscriptions (user_id, plan_id, status, start_date) VALUES (?, ?, ?, ?)',
          [user.id, planId, 'active', new Date().toISOString()]
        );
      }

      toast.success('Successfully subscribed to plan');
      return { success: true };
    } catch (error: any) {
      toast.error('Failed to subscribe to plan');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!user) {
      toast.error('You must be logged in to cancel subscription');
      return { success: false };
    }

    setLoading(true);
    try {
      await cloudflareDb.query(
        'UPDATE user_subscriptions SET status = ?, cancelled_at = ? WHERE user_id = ?',
        ['cancelled', new Date().toISOString(), user.id]
      );

      toast.success('Successfully cancelled subscription');
      return { success: true };
    } catch (error: any) {
      toast.error('Failed to cancel subscription');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getTransactionHistory = async () => {
    if (!user) return [];

    try {
      const data = await cloudflareDb.query(
        'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC',
        [user.id]
      );
      return data.results || [];
    } catch (error) {
      return [];
    }
  };

  const getInvoices = async () => {
    if (!user) return [];

    try {
      const data = await cloudflareDb.query(
        'SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC',
        [user.id]
      );
      return data.results || [];
    } catch (error) {
      return [];
    }
  };

  const createInvoice = async (items: Array<{ description: string; amount: number; quantity: number }>) => {
    if (!user) {
      toast.error('You must be logged in to create an invoice');
      return { success: false };
    }

    try {
      const totalAmount = items.reduce((sum, item) => sum + (item.amount * item.quantity), 0);
      
      const data = await cloudflareDb.query(
        'INSERT INTO invoices (user_id, amount, status, due_date, items) VALUES (?, ?, ?, ?, ?) RETURNING *',
        [
          user.id,
          totalAmount,
          'draft',
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          JSON.stringify(items)
        ]
      );

      return { success: true, data: data.results?.[0] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const processPayment = async (amount: number, metadata: any = {}) => {
    if (!user) {
      toast.error('You must be logged in to make a payment');
      return { success: false };
    }

    setLoading(true);
    try {
      const data = await cloudflareDb.query(
        'INSERT INTO transactions (user_id, amount, status, type, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?) RETURNING *',
        [user.id, amount, 'completed', 'payment', JSON.stringify(metadata), new Date().toISOString()]
      );

      toast.success('Payment processed successfully');
      return { success: true, data: data.results?.[0] };
    } catch (error: any) {
      toast.error('Failed to process payment');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const requestRefund = async (transactionId: string, reason: string) => {
    if (!user) {
      toast.error('You must be logged in to request a refund');
      return { success: false };
    }

    try {
      // First, get the original transaction
      const transactionData = await cloudflareDb.query(
        'SELECT * FROM transactions WHERE id = ? LIMIT 1',
        [transactionId]
      );

      if (!transactionData.results || transactionData.results.length === 0) {
        throw new Error('Transaction not found');
      }

      const transaction = transactionData.results[0];

      // Create refund record
      await cloudflareDb.query(
        'INSERT INTO transactions (user_id, amount, status, type, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [
          user.id,
          transaction.amount,
          'pending',
          'refund',
          JSON.stringify({
            original_transaction_id: transactionId,
            reason
          }),
          new Date().toISOString()
        ]
      );

      toast.success('Refund request submitted successfully');
      return { success: true };
    } catch (error: any) {
      toast.error('Failed to request refund');
      return { success: false, error: error.message };
    }
  };

  return {
    loading,
    getPlans,
    getCurrentPlan,
    subscribeToPlan,
    cancelSubscription,
    getTransactionHistory,
    getInvoices,
    createInvoice,
    processPayment,
    requestRefund
  };
}
