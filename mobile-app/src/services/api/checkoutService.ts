import apiClient from './client';
import { Checkout } from '../../types';

export const checkoutService = {
  async getCheckouts(): Promise<Checkout[]> {
    const res = await apiClient.get<Checkout[]>('/checkouts');
    return res.data;
  },

  async getActiveCheckouts(): Promise<Checkout[]> {
    const res = await apiClient.get<Checkout[]>('/checkouts/active');
    return res.data;
  },

  async getOverdueCheckouts(): Promise<Checkout[]> {
    const res = await apiClient.get<Checkout[]>('/checkouts/overdue');
    return res.data;
  },

  async getCheckoutStats(): Promise<Record<string, any>> {
    const res = await apiClient.get('/checkouts/stats');
    return res.data;
  },

  async getUserCheckouts(userId: string): Promise<Checkout[]> {
    const res = await apiClient.get<Checkout[]>(`/checkouts/user/${userId}`);
    return res.data;
  },

  async createCheckout(data: {
    equipmentId: string;
    userId: string;
    expectedReturnDate: string;
    notes?: string;
  }): Promise<Checkout> {
    const res = await apiClient.post<Checkout>('/checkouts', data);
    return res.data;
  },

  async checkinEquipment(id: string, notes?: string): Promise<Checkout> {
    const res = await apiClient.put<Checkout>(`/checkouts/${id}/checkin`, { notes });
    return res.data;
  },

  async qrCheckin(qrCode: string): Promise<Checkout> {
    const res = await apiClient.post<Checkout>('/checkouts/qr-checkin', { qr_code: qrCode });
    return res.data;
  },

  async getByQrCode(qrCode: string): Promise<Checkout> {
    const res = await apiClient.get<Checkout>(`/checkouts/qr/${qrCode}`);
    return res.data;
  },
};
