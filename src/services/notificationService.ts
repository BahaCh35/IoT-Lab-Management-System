import { notificationService as apiNotificationService, Notification } from './api/notificationService';

export type { Notification };

// Helper function to get user-specific storage key
const getUserNotificationKey = (): string => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return `nova_notifications_${userData.id || userData.email || 'default'}`;
    } catch {
      return 'nova_notifications_default';
    }
  }
  return 'nova_notifications_default';
};

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    try {
      return await apiNotificationService.getNotifications();
    } catch (error) {
      console.error('Error fetching notifications from API:', error);
      // Fallback to localStorage
      const key = getUserNotificationKey();
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    }
  },

  async getUnreadCount(): Promise<number> {
    try {
      return await apiNotificationService.getUnreadCount();
    } catch (error) {
      console.error('Error fetching unread count from API:', error);
      const notifications = await this.getNotifications();
      return notifications.filter(n => !n.read).length;
    }
  },

  async createNotification(notificationData: {
    userId: string;
    title: string;
    message: string;
    type: Notification['type'];
    link?: string;
  }): Promise<Notification> {
    return apiNotificationService.createNotification(notificationData);
  },

  async markAsRead(id: string): Promise<Notification> {
    return apiNotificationService.markAsRead(id);
  },

  async markAllAsRead(): Promise<void> {
    return apiNotificationService.markAllAsRead();
  },

  async deleteNotification(id: string): Promise<void> {
    return apiNotificationService.deleteNotification(id);
  },

  async clearAll(): Promise<void> {
    return apiNotificationService.clearAll();
  },
};
