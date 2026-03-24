import apiClient from './client';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    return apiClient.get<Notification[]>('/notifications');
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>('/notifications/unread-count');
    return response.count;
  },

  async createNotification(notificationData: {
    userId: string;
    title: string;
    message: string;
    type: Notification['type'];
    link?: string;
  }): Promise<Notification> {
    return apiClient.post<Notification>('/notifications', notificationData);
  },

  async markAsRead(id: string): Promise<Notification> {
    return apiClient.put<Notification>(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.put('/notifications/read-all');
  },

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },

  async clearAll(): Promise<void> {
    await apiClient.delete('/notifications');
  },
};

export default notificationService;
