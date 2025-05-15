import { createBrowserClient } from "@supabase/ssr";

// Define notification types
export type NotificationCategory = "system" | "update" | "alert";

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  category?: NotificationCategory;
}

/**
 * Service to handle notifications
 */
export class NotificationService {
  private supabase;

  constructor() {
    this.supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  /**
   * Get all notifications for the current user
   */
  async getNotifications(): Promise<Notification[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        return [];
      }

      // For demo purposes - replace with actual Supabase query
      // Example of how the real implementation might look:
      // const { data, error } = await this.supabase
      //   .from('notifications')
      //   .select('*')
      //   .eq('user_id', user.id)
      //   .order('created_at', { ascending: false });
      
      // if (error) throw error;
      // return data.map(n => ({
      //   ...n,
      //   createdAt: new Date(n.created_at)
      // }));

      // Mock data for demo
      return this.getMockNotifications();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      // Real implementation would update the database
      // const { error } = await this.supabase
      //   .from('notifications')
      //   .update({ read: true })
      //   .eq('id', id)
      //   .eq('user_id', user.id);
      
      // return !error;

      // Mock success
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      // Real implementation would update the database
      // const { error } = await this.supabase
      //   .from('notifications')
      //   .update({ read: true })
      //   .eq('user_id', user.id);
      
      // return !error;

      // Mock success
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      // Real implementation would delete from the database
      // const { error } = await this.supabase
      //   .from('notifications')
      //   .delete()
      //   .eq('id', id)
      //   .eq('user_id', user.id);
      
      // return !error;

      // Mock success
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  /**
   * Create a notification for the current user
   */
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      // Real implementation would insert into the database
      // const { error } = await this.supabase
      //   .from('notifications')
      //   .insert({
      //     user_id: user.id,
      //     title: notification.title,
      //     message: notification.message,
      //     category: notification.category || 'system',
      //     read: false,
      //     created_at: new Date().toISOString()
      //   });
      
      // return !error;

      // Mock success
      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const notifications = await this.getNotifications();
      return notifications.filter(n => !n.read).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Mock data for demo purposes
   */
  private getMockNotifications(): Notification[] {
    return [
      {
        id: '1',
        title: 'Welcome to StorePartner',
        message: 'Thank you for joining our platform. We are excited to help you grow your business.',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        category: "system"
      },
      {
        id: '2',
        title: 'New store guide available',
        message: 'Check out our latest guide for optimizing your store layout and improving customer experience.',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        category: "update"
      },
      {
        id: '3',
        title: 'Weekly report ready',
        message: 'Your weekly store performance report is now available. View your metrics and insights now.',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        category: "update"
      },
      {
        id: '4',
        title: 'Security alert',
        message: 'We detected a login attempt from a new device. If this was you, you can ignore this message.',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
        category: "alert"
      },
      {
        id: '5',
        title: 'New feature: AI product descriptions',
        message: 'We\'ve added a new AI tool to help you create better product descriptions. Try it out today!',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
        category: "update"
      }
    ];
  }
}

// Export a singleton instance
export const notificationService = new NotificationService(); 