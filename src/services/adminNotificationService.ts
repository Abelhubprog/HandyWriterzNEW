import databaseService from '@/services/databaseService';
import { v4 as uuidv4 } from 'uuid';

// Notification priority levels
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

// Notification channels
export type NotificationChannel = 'in-app' | 'email' | 'sms' | 'telegram' | 'discord' | 'slack';

// Notification status
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'delivered' | 'read';

// Notification data
export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  status: Record<NotificationChannel, NotificationStatus>;
  metadata: Record<string, any>;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

// Channel configurations
interface ChannelConfig {
  enabled: boolean;
  target: string;
}

interface NotificationConfig {
  email?: ChannelConfig;
  sms?: ChannelConfig;
  telegram?: ChannelConfig;
  discord?: ChannelConfig;
  slack?: ChannelConfig;
}

/**
 * Admin notification service that supports multiple channels
 * Simplified version using the new database service
 */
export const adminNotificationService = {
  // Config defaults
  defaultConfig: {
    email: {
      enabled: true,
      target: 'admin@handywriterz.com'
    },
    telegram: {
      enabled: process.env.TELEGRAM_ADMIN_CHAT_ID ? true : false,
      target: process.env.TELEGRAM_ADMIN_CHAT_ID || ''
    }
  } as NotificationConfig,
  
  /**
   * Send notification to admin with priority and channel selection
   */
  async notify(
    title: string,
    message: string,
    options: {
      priority?: NotificationPriority;
      channels?: NotificationChannel[];
      metadata?: Record<string, any>;
      user_id?: string;
      config?: NotificationConfig;
    } = {}
  ): Promise<{ success: boolean; notificationId: string; channels: NotificationChannel[] }> {
    const { 
      priority = 'medium',
      channels = ['in-app', 'email'],
      metadata = {},
      user_id,
      config = this.defaultConfig
    } = options;
    
    const notificationId = uuidv4();
    const timestamp = new Date().toISOString();
    
    // Create notification record
    const notification: AdminNotification = {
      id: notificationId,
      title,
      message,
      priority,
      channels,
      status: this.initializeStatus(channels),
      metadata,
      user_id,
      created_at: timestamp,
      updated_at: timestamp
    };
    
    // Try to store in database
    try {
      await databaseService.create('admin_notifications', {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        channels: notification.channels,
        status: notification.status,
        metadata: notification.metadata,
        user_id: notification.user_id,
        created_at: notification.created_at,
        updated_at: notification.updated_at
      });
    } catch (error) {
      // Continue even if storage fails - we'll try to deliver anyway
    }
    
    // Dispatch to all channels
    const successfulChannels: NotificationChannel[] = [];
    
    // Dispatch in parallel
    const dispatchers = channels.map(channel => 
      this.dispatchToChannel(notification, channel, config)
        .then(success => {
          if (success) successfulChannels.push(channel);
          notification.status[channel] = success ? 'sent' : 'failed';
        })
        .catch(() => {
          notification.status[channel] = 'failed';
        })
    );
    
    await Promise.allSettled(dispatchers);
    
    // Update notification status
    notification.updated_at = new Date().toISOString();
    
    try {
      await databaseService.update('admin_notifications', notification.id, {
        status: notification.status,
        updated_at: notification.updated_at
      });
    } catch (error) {
    }
    
    return {
      success: successfulChannels.length > 0,
      notificationId: notification.id,
      channels: successfulChannels
    };
  },
  
  /**
   * Initialize status for all channels
   */
  initializeStatus(channels: NotificationChannel[]): Record<NotificationChannel, NotificationStatus> {
    const status: Partial<Record<NotificationChannel, NotificationStatus>> = {};
    
    channels.forEach(channel => {
      status[channel] = 'pending';
    });
    
    return status as Record<NotificationChannel, NotificationStatus>;
  },
  
  /**
   * Dispatch notification to a specific channel
   */
  async dispatchToChannel(
    notification: AdminNotification,
    channel: NotificationChannel,
    config: NotificationConfig
  ): Promise<boolean> {
    try {
      switch (channel) {
        case 'in-app':
          return await this.sendInAppNotification(notification);
          
        case 'email':
          if (!config.email?.enabled) return false;
          return await this.sendEmailNotification(notification, config.email.target);
          
        case 'sms':
          if (!config.sms?.enabled) return false;
          return await this.sendSmsNotification(notification, config.sms.target);
          
        case 'telegram':
          if (!config.telegram?.enabled) return false;
          return await this.sendTelegramNotification(notification, config.telegram.target);
          
        case 'discord':
          if (!config.discord?.enabled) return false;
          return await this.sendDiscordNotification(notification, config.discord.target);
          
        case 'slack':
          if (!config.slack?.enabled) return false;
          return await this.sendSlackNotification(notification, config.slack.target);
          
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Send in-app notification
   */
  async sendInAppNotification(notification: AdminNotification): Promise<boolean> {
    try {
      // Try to create an admin message
      await databaseService.create('admin_messages', {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        metadata: notification.metadata,
        user_id: notification.user_id,
        is_read: false,
        created_at: notification.created_at
      });
      
      return true;
    } catch (error) {
      
      // Try fallback to regular messages
      if (notification.user_id) {
        try {
          const formattedContent = `
📢 ADMIN NOTIFICATION - ${notification.priority.toUpperCase()} PRIORITY
----------------------------------------------------------
${notification.title}
----------------------------------------------------------
${notification.message}
          `.trim();
          
          await databaseService.create('messages', {
            user_id: notification.user_id,
            content: formattedContent,
            sender_type: 'admin',
            is_read: false
          });
          
          return true;
        } catch (fallbackError) {
        }
      }
      
      return false;
    }
  },
  
  /**
   * Send email notification (mock implementation)
   */
  async sendEmailNotification(notification: AdminNotification, target: string): Promise<boolean> {
    try {
      // Mock email sending
      
      // In a real implementation, integrate with an email service
      return true;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Send SMS notification (mock implementation)
   */
  async sendSmsNotification(notification: AdminNotification, target: string): Promise<boolean> {
    try {
      // Mock SMS sending
      const priorityPrefix = {
        low: '[INFO]',
        medium: '[NOTICE]',
        high: '[IMPORTANT]',
        urgent: '[URGENT]'
      };
      
      const message = `${priorityPrefix[notification.priority]} ${notification.title}\n\n${notification.message.substring(0, 140)}${notification.message.length > 140 ? '...' : ''}`;
      
      
      // In a real implementation, integrate with an SMS service
      return true;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Send Telegram notification (mock implementation)
   */
  async sendTelegramNotification(notification: AdminNotification, target: string): Promise<boolean> {
    try {
      // Mock Telegram sending
      const priorityEmoji = {
        low: '📓',
        medium: '📘',
        high: '📙',
        urgent: '📕'
      };
      
      const message = `
${priorityEmoji[notification.priority]} *${notification.title}*
_Priority: ${notification.priority.toUpperCase()}_

${notification.message}

${notification.user_id ? `👤 User: \`${notification.user_id}\`` : ''}
🆔 Notification ID: \`${notification.id}\`
⏰ Time: ${new Date(notification.created_at).toLocaleString()}
      `.trim();
      
      
      // In a real implementation, integrate with Telegram Bot API
      return true;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Send Discord notification (mock implementation)
   */
  async sendDiscordNotification(notification: AdminNotification, webhookUrl: string): Promise<boolean> {
    try {
      
      // In a real implementation, send to Discord webhook
      return true;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Send Slack notification (mock implementation)
   */
  async sendSlackNotification(notification: AdminNotification, webhookUrl: string): Promise<boolean> {
    try {
      
      // In a real implementation, send to Slack webhook
      return true;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      // Try admin_messages table first
      try {
        await databaseService.update('admin_messages', notificationId, { is_read: true });
        return true;
      } catch (error) {
      }
      
      // Try updating the notification record
      await databaseService.update('admin_notifications', notificationId, {
        'status.in-app': 'read',
        updated_at: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      return false;
    }
  }
};

export default adminNotificationService;