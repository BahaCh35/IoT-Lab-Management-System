import apiClient from './client';
import { Notification } from '../../types';

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const res = await apiClient.get<Notification[]>('/notifications');
    return res.data;
  },

  async getUnreadCount(): Promise<number> {
    const res = await apiClient.get<{ count: number }>('/notifications/unread-count');
    return res.data.count;
  },

  async markAsRead(id: string): Promise<Notification> {
    const res = await apiClient.put<Notification>(`/notifications/${id}/read`);
    return res.data;
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

  async registerDeviceToken(token: string): Promise<void> {
    await apiClient.post('/device-tokens', { token });
  },

  async unregisterDeviceToken(token: string): Promise<void> {
    await apiClient.delete('/device-tokens', { data: { token } });
  },
};
