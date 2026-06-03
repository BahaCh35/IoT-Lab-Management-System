import apiClient from './client';
import { UserProfile, ActivityLog } from '../../types';

export const userService = {
  async getUsers(): Promise<UserProfile[]> {
    const res = await apiClient.get<UserProfile[]>('/users');
    return res.data;
  },

  async getUserById(id: string): Promise<UserProfile> {
    const res = await apiClient.get<UserProfile>(`/users/${id}`);
    return res.data;
  },

  async createUser(data: Partial<UserProfile> & { password?: string }): Promise<UserProfile> {
    const res = await apiClient.post<UserProfile>('/users', data);
    return res.data;
  },

  async updateUser(id: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const res = await apiClient.put<UserProfile>(`/users/${id}`, data);
    return res.data;
  },

  async activateUser(id: string): Promise<UserProfile> {
    const res = await apiClient.put<UserProfile>(`/users/${id}/activate`);
    return res.data;
  },

  async deactivateUser(id: string): Promise<UserProfile> {
    const res = await apiClient.put<UserProfile>(`/users/${id}/deactivate`);
    return res.data;
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  async getUserActivity(userId: string): Promise<ActivityLog[]> {
    const res = await apiClient.get<ActivityLog[]>(`/users/${userId}/activity`);
    return res.data;
  },

  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    engineers: number;
    admins: number;
    technicians: number;
    byDepartment: Record<string, number>;
  }> {
    const res = await apiClient.get('/users/stats');
    return res.data;
  },
};
