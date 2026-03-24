import { UserProfile, ActivityLog } from '../types';
import { userService as apiUserService } from './api/userService';

export const userService = {
  async getUsers(): Promise<UserProfile[]> {
    return apiUserService.getUsers();
  },

  async getUserById(id: string): Promise<UserProfile | undefined> {
    return apiUserService.getUserById(id);
  },

  async getUserByEmail(email: string): Promise<UserProfile | undefined> {
    return apiUserService.getUserByEmail(email);
  },

  async createUser(data: Partial<UserProfile> & { password?: string }): Promise<UserProfile> {
    return apiUserService.createUser(data);
  },

  async updateUser(id: string, data: Partial<UserProfile>): Promise<UserProfile | undefined> {
    return apiUserService.updateUser(id, data);
  },

  async activateUser(id: string): Promise<UserProfile | undefined> {
    return apiUserService.activateUser(id);
  },

  async deactivateUser(id: string): Promise<UserProfile | undefined> {
    return apiUserService.deactivateUser(id);
  },

  async deleteUser(id: string): Promise<void> {
    return apiUserService.deleteUser(id);
  },

  async getUserActivity(userId: string): Promise<ActivityLog[]> {
    return apiUserService.getUserActivity(userId);
  },

  async getUserStats(): Promise<{
    total: number;
    byRole: Record<string, number>;
    active: number;
    inactive: number;
  }> {
    return apiUserService.getUserStats();
  },
};
