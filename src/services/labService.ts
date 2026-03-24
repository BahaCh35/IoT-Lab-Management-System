import { Lab, LabReservation, User } from '../types';
import { labService as apiLabService } from './api/labService';

export const labService = {
  async getLabs(): Promise<Lab[]> {
    return apiLabService.getLabs();
  },

  async getLabById(id: string): Promise<Lab | undefined> {
    try {
      return await apiLabService.getLabById(id);
    } catch {
      return undefined;
    }
  },

  async createLab(labData: Partial<Lab>): Promise<Lab> {
    return apiLabService.createLab(labData);
  },

  async updateLab(id: string, labData: Partial<Lab>): Promise<Lab | undefined> {
    try {
      return await apiLabService.updateLab(id, labData);
    } catch {
      return undefined;
    }
  },

  async deleteLab(id: string): Promise<void> {
    return apiLabService.deleteLab(id);
  },

  async getLabReservations(): Promise<LabReservation[]> {
    return apiLabService.getLabReservations();
  },

  async getLabReservationsByLabId(labId: string): Promise<LabReservation[]> {
    return apiLabService.getLabReservationsByLabId(labId);
  },

  async getLabReservationsByUserId(userId: string): Promise<LabReservation[]> {
    return apiLabService.getLabReservationsByUserId(userId);
  },

  async createLabReservation(reservationData: {
    labId: string;
    user: User;
    purpose: string;
    date: string;
    startTime: string;
    endTime: string;
  }): Promise<LabReservation> {
    return apiLabService.createLabReservation(reservationData);
  },

  async approveLabReservation(id: string): Promise<LabReservation | undefined> {
    try {
      return await apiLabService.approveLabReservation(id);
    } catch {
      return undefined;
    }
  },

  async rejectLabReservation(id: string, reason?: string): Promise<LabReservation | undefined> {
    try {
      return await apiLabService.rejectLabReservation(id, reason);
    } catch {
      return undefined;
    }
  },

  async getLabStats(): Promise<{
    total: number;
    active: number;
    totalCapacity: number;
  }> {
    return apiLabService.getLabStats();
  },
};
