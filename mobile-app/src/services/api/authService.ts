import apiClient, { TOKEN_KEY } from './client';
import * as SecureStore from 'expo-secure-store';
import { UserProfile } from '../../types';

const USER_KEY = 'auth_user';

export interface LoginResponse {
  user: UserProfile;
  token: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/login', {
      email,
      password,
    });
    const { user, token } = response.data;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    return { user, token };
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/logout');
    } finally {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    }
  },

  async getCurrentUser(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/user');
    return response.data;
  },

  async getStoredUser(): Promise<UserProfile | null> {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  async getStoredToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    return !!token;
  },
};
