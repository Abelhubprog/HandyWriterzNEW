import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { cloudflareDb } from '@/lib/cloudflare';
import { toast } from 'react-hot-toast';

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

export function useNotifications() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;

    // Initial fetch
    fetchNotifications();

    // Note: Real-time subscriptions would need to be implemented differently with Cloudflare
    // For now, we'll poll for updates periodically or use WebSockets/SSE separately
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // Poll every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch notifications
      const data = await cloudflareDb.query(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
        [user.id]
      );

      const notifications = data.results || [];
      setNotifications(notifications);
      setUnreadCount(notifications.filter((n: Notification) => !n.read).length);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await cloudflareDb.query(
        'UPDATE notifications SET read = ? WHERE id = ?',
        [true, notificationId]
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      await cloudflareDb.query(
        'UPDATE notifications SET read = ? WHERE user_id = ? AND read = ?',
        [true, user.id, false]
      );

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await cloudflareDb.query(
        'DELETE FROM notifications WHERE id = ?',
        [notificationId]
      );

      setNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      );
      
      // Update unread count if needed
      const wasUnread = notifications.find((n) => n.id === notificationId && !n.read);
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
    }
  };

  const clearAllNotifications = async () => {
    if (!user) return;

    try {
      await cloudflareDb.query(
        'DELETE FROM notifications WHERE user_id = ?',
        [user.id]
      );

      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
    }
  };

  // Helper function to get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    refresh: fetchNotifications,
  };
}
