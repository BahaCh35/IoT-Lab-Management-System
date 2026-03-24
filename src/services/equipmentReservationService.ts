import { Reservation } from '../types';
import { equipmentReservationService as apiEquipmentReservationService } from './api/equipmentReservationService';

export const equipmentReservationService = {
  async getReservations(): Promise<Reservation[]> {
    return apiEquipmentReservationService.getReservations();
  },

  async getReservationById(id: string): Promise<Reservation | undefined> {
    try {
      return await apiEquipmentReservationService.getReservationById(id);
    } catch {
      return undefined;
    }
  },

  async getReservationsByUserId(userId: string): Promise<Reservation[]> {
    return apiEquipmentReservationService.getReservationsByUserId(userId);
  },

  async getReservationsByStatus(status: Reservation['status']): Promise<Reservation[]> {
    return apiEquipmentReservationService.getReservationsByStatus(status);
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
    return apiEquipmentReservationService.createReservation(reservationData);
  },

  async updateReservation(id: string, data: Partial<Reservation>): Promise<Reservation | undefined> {
    try {
      return await apiEquipmentReservationService.updateReservation(id, data);
    } catch {
      return undefined;
    }
  },

  async approveReservation(id: string): Promise<Reservation | undefined> {
    try {
      return await apiEquipmentReservationService.approveReservation(id);
    } catch {
      return undefined;
    }
  },

  async rejectReservation(id: string, reason: string): Promise<Reservation | undefined> {
    try {
      return await apiEquipmentReservationService.rejectReservation(id, reason);
    } catch {
      return undefined;
    }
  },

  async cancelReservation(id: string): Promise<Reservation | undefined> {
    try {
      return await apiEquipmentReservationService.cancelReservation(id);
    } catch {
      return undefined;
    }
  },

  async getReservationStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
  }> {
    return apiEquipmentReservationService.getReservationStats();
  },
};
