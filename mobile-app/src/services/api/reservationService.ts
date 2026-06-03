import apiClient from './client';
import { Reservation } from '../../types';

export const reservationService = {
  // Equipment Reservations
  async getEquipmentReservations(): Promise<Reservation[]> {
    const res = await apiClient.get<Reservation[]>('/equipment-reservations');
    return res.data;
  },

  async getEquipmentReservationStats(): Promise<Record<string, any>> {
    const res = await apiClient.get('/equipment-reservations/stats');
    return res.data;
  },

  async approveEquipmentReservation(id: string): Promise<Reservation> {
    const res = await apiClient.put<Reservation>(`/equipment-reservations/${id}/approve`);
    return res.data;
  },

  async rejectEquipmentReservation(id: string, reason: string): Promise<Reservation> {
    const res = await apiClient.put<Reservation>(`/equipment-reservations/${id}/reject`, {
      rejection_reason: reason,
    });
    return res.data;
  },

  async cancelEquipmentReservation(id: string): Promise<Reservation> {
    const res = await apiClient.put<Reservation>(`/equipment-reservations/${id}/cancel`);
    return res.data;
  },

  // Lab Reservations
  async getLabReservations(): Promise<any[]> {
    const res = await apiClient.get<any[]>('/lab-reservations');
    return res.data;
  },

  async approveLabReservation(id: string): Promise<any> {
    const res = await apiClient.put(`/lab-reservations/${id}/approve`);
    return res.data;
  },

  async rejectLabReservation(id: string, reason: string): Promise<any> {
    const res = await apiClient.put(`/lab-reservations/${id}/reject`, {
      rejection_reason: reason,
    });
    return res.data;
  },

  // Meeting Room Reservations
  async getMeetingRoomReservations(): Promise<any[]> {
    const res = await apiClient.get<any[]>('/meeting-room-reservations');
    return res.data;
  },

  async approveMeetingRoomReservation(id: string): Promise<any> {
    const res = await apiClient.put(`/meeting-room-reservations/${id}/approve`);
    return res.data;
  },

  async rejectMeetingRoomReservation(id: string, reason: string): Promise<any> {
    const res = await apiClient.put(`/meeting-room-reservations/${id}/reject`, {
      rejection_reason: reason,
    });
    return res.data;
  },
};
