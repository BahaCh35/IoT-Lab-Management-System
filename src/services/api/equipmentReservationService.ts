import { Reservation } from '../../types';
import apiClient from './client';

export const equipmentReservationService = {
  async getReservations(): Promise<Reservation[]> {
    return apiClient.get<Reservation[]>('/equipment-reservations');
  },

  async getReservationById(id: string): Promise<Reservation> {
    return apiClient.get<Reservation>(`/equipment-reservations/${id}`);
  },

  async getReservationsByUserId(userId: string): Promise<Reservation[]> {
    return apiClient.get<Reservation[]>(`/equipment-reservations?user_id=${userId}`);
  },

  async getReservationsByStatus(status: Reservation['status']): Promise<Reservation[]> {
    return apiClient.get<Reservation[]>(`/equipment-reservations?status=${status}`);
  },

  async createReservation(reservationData: {
    equipmentId: string;
    equipmentName: string;
    userId: string;
    userName: string;
    startDate: string;
    endDate: string;
    notes?: string;
  }): Promise<Reservation> {
    return apiClient.post<Reservation>('/equipment-reservations', {
      equipment_id: reservationData.equipmentId,
      equipment_name: reservationData.equipmentName,
      user_id: reservationData.userId,
      user_name: reservationData.userName,
      start_date: reservationData.startDate,
      end_date: reservationData.endDate,
      notes: reservationData.notes,
    });
  },

  async updateReservation(id: string, data: Partial<Reservation>): Promise<Reservation> {
    return apiClient.put<Reservation>(`/equipment-reservations/${id}`, data);
  },

  async approveReservation(id: string): Promise<Reservation> {
    return apiClient.put<Reservation>(`/equipment-reservations/${id}/approve`);
  },

  async rejectReservation(id: string, reason: string): Promise<Reservation> {
    return apiClient.put<Reservation>(`/equipment-reservations/${id}/reject`, { reason });
  },

  async cancelReservation(id: string): Promise<Reservation> {
    return apiClient.put<Reservation>(`/equipment-reservations/${id}/cancel`);
  },

  async getReservationStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
  }> {
    return apiClient.get('/equipment-reservations/stats');
  },
};

export default equipmentReservationService;
