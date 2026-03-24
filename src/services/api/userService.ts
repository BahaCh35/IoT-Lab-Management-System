import { UserProfile, ActivityLog } from '../../types';
import apiClient from './client';

export const userService = {
  async getUsers(): Promise<UserProfile[]> {
    return apiClient.get<UserProfile[]>('/users');
  },

  async getUserById(id: string): Promise<UserProfile> {
    return apiClient.get<UserProfile>(`/users/${id}`);
  },

  async getUserByEmail(email: string): Promise<UserProfile | undefined> {
    const users = await this.getUsers();
    return users.find(u => u.email === email);
  },

  async createUser(userData: Partial<UserProfile> & { password?: string }): Promise<UserProfile> {
    return apiClient.post<UserProfile>('/users', userData);
  },

  async updateUser(id: string, userData: Partial<UserProfile>): Promise<UserProfile> {
    return apiClient.put<UserProfile>(`/users/${id}`, userData);
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  async activateUser(id: string): Promise<UserProfile> {
    return apiClient.put<UserProfile>(`/users/${id}/activate`);
  },

  async deactivateUser(id: string): Promise<UserProfile> {
    return apiClient.put<UserProfile>(`/users/${id}/deactivate`);
  },

  async getUserActivity(id: string): Promise<ActivityLog[]> {
    return apiClient.get<ActivityLog[]>(`/users/${id}/activity`);
  },

  async getUserStats(): Promise<{
    total: number;
    byRole: Record<string, number>;
    active: number;
    inactive: number;
  }> {
    return apiClient.get('/users/stats');
  },
};

export default userService;
