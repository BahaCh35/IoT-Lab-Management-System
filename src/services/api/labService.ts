import { Lab, LabReservation, User } from '../../types';
import apiClient from './client';

export const labService = {
  async getLabs(): Promise<Lab[]> {
    return apiClient.get<Lab[]>('/labs');
  },

  async getLabById(id: string): Promise<Lab> {
    return apiClient.get<Lab>(`/labs/${id}`);
  },

  async createLab(labData: Partial<Lab>): Promise<Lab> {
    return apiClient.post<Lab>('/labs', labData);
  },

  async updateLab(id: string, labData: Partial<Lab>): Promise<Lab> {
    return apiClient.put<Lab>(`/labs/${id}`, labData);
  },

  async deleteLab(id: string): Promise<void> {
    await apiClient.delete(`/labs/${id}`);
  },

  async getLabReservations(): Promise<LabReservation[]> {
    return apiClient.get<LabReservation[]>('/lab-reservations');
  },

  async getLabReservationsByLabId(labId: string): Promise<LabReservation[]> {
    const reservations = await this.getLabReservations();
    return reservations.filter(r => r.labId === labId);
  },

  async getLabReservationsByUserId(userId: string): Promise<LabReservation[]> {
    const reservations = await this.getLabReservations();
    return reservations.filter(r => r.user.id === userId);
  },

  async createLabReservation(reservationData: {
    labId: string;
    user: User;
    purpose: string;
    date: string;
    startTime: string;
    endTime: string;
  }): Promise<LabReservation> {
    return apiClient.post<LabReservation>('/lab-reservations', {
      lab_id: reservationData.labId,
      user_id: reservationData.user.id,
      purpose: reservationData.purpose,
      date: reservationData.date,
      start_time: reservationData.startTime,
      end_time: reservationData.endTime,
    });
  },

  async approveLabReservation(id: string): Promise<LabReservation> {
    return apiClient.put<LabReservation>(`/lab-reservations/${id}/approve`);
  },

  async rejectLabReservation(id: string, reason?: string): Promise<LabReservation> {
    return apiClient.put<LabReservation>(`/lab-reservations/${id}/reject`, { reason });
  },

  async getLabStats(): Promise<{
    total: number;
    active: number;
    totalCapacity: number;
  }> {
    return apiClient.get('/labs/stats');
  },
};

export default labService;
