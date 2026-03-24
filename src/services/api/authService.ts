import { UserProfile } from '../../types';
import apiClient from './client';

interface LoginResponse {
  user: UserProfile;
  token: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/login', { email, password });
    apiClient.setToken(response.token);
    return response;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/logout');
    } finally {
      apiClient.setToken(null);
    }
  },

  async register(name: string, email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/register', {
      name,
      email,
      password,
      password_confirmation: password,
    });
    apiClient.setToken(response.token);
    return response;
  },

  async getCurrentUser(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/user');
  },

  isAuthenticated(): boolean {
    return !!apiClient.getToken();
  },
};

export default authService;
