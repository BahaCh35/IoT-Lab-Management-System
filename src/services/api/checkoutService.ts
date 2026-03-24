import { Equipment, Checkout } from '../../types';
import apiClient from './client';

export const checkoutService = {
  // Equipment methods
  async getEquipment(): Promise<Equipment[]> {
    return apiClient.get<Equipment[]>('/equipment');
  },

  async getEquipmentById(id: string): Promise<Equipment> {
    return apiClient.get<Equipment>(`/equipment/${id}`);
  },

  async getEquipmentByCategory(category: Equipment['category']): Promise<Equipment[]> {
    return apiClient.get<Equipment[]>(`/equipment/category/${category}`);
  },

  async getAvailableEquipment(): Promise<Equipment[]> {
    return apiClient.get<Equipment[]>('/equipment/available');
  },

  async searchEquipment(query: string): Promise<Equipment[]> {
    return apiClient.get<Equipment[]>(`/equipment/search?q=${encodeURIComponent(query)}`);
  },

  // Checkout methods
  async checkoutEquipment(
    equipmentId: string,
    userId: string,
    userName: string,
    expectedReturnDate: string,
    notes?: string
  ): Promise<Checkout> {
    return apiClient.post<Checkout>('/checkouts', {
      equipment_id: equipmentId,
      user_id: userId,
      user_name: userName,
      expected_return_date: expectedReturnDate,
      notes,
    });
  },

  async checkInEquipment(checkoutId: string, notes?: string): Promise<Checkout> {
    return apiClient.put<Checkout>(`/checkouts/${checkoutId}/checkin`, { notes });
  },

  async checkInByQRCode(qrCode: string, notes?: string): Promise<Checkout> {
    return apiClient.post<Checkout>('/checkouts/qr-checkin', { qr_code: qrCode, notes });
  },

  async getCheckouts(): Promise<Checkout[]> {
    return apiClient.get<Checkout[]>('/checkouts');
  },

  async getActiveCheckouts(): Promise<Checkout[]> {
    return apiClient.get<Checkout[]>('/checkouts/active');
  },

  async getUserActiveCheckouts(userId: string): Promise<Checkout[]> {
    return apiClient.get<Checkout[]>(`/checkouts/user/${userId}/active`);
  },

  async getUserCheckoutHistory(userId: string): Promise<Checkout[]> {
    return apiClient.get<Checkout[]>(`/checkouts/user/${userId}`);
  },

  async getCheckoutById(id: string): Promise<Checkout> {
    return apiClient.get<Checkout>(`/checkouts/${id}`);
  },

  async getCheckoutByQRCode(qrCode: string): Promise<Checkout> {
    return apiClient.get<Checkout>(`/checkouts/qr/${encodeURIComponent(qrCode)}`);
  },

  async getCheckoutStats(): Promise<{
    totalCheckouts: number;
    activeCheckouts: number;
    returnedCheckouts: number;
    overdueCheckouts: number;
  }> {
    return apiClient.get('/checkouts/stats');
  },

  async getOverdueCheckouts(): Promise<Checkout[]> {
    return apiClient.get<Checkout[]>('/checkouts/overdue');
  },
};

export default checkoutService;
