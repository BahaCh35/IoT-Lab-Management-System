import apiClient from './client';
import { Lab, MeetingRoom } from '../../types';

export const labService = {
  async getLabs(): Promise<Lab[]> {
    const res = await apiClient.get<Lab[]>('/labs');
    return res.data;
  },

  async getLabById(id: string): Promise<Lab> {
    const res = await apiClient.get<Lab>(`/labs/${id}`);
    return res.data;
  },

  async createLab(data: Partial<Lab>): Promise<Lab> {
    const res = await apiClient.post<Lab>('/labs', data);
    return res.data;
  },

  async updateLab(id: string, data: Partial<Lab>): Promise<Lab> {
    const res = await apiClient.put<Lab>(`/labs/${id}`, data);
    return res.data;
  },

  async deleteLab(id: string): Promise<void> {
    await apiClient.delete(`/labs/${id}`);
  },
};

export const meetingRoomService = {
  async getRooms(): Promise<MeetingRoom[]> {
    const res = await apiClient.get<MeetingRoom[]>('/meeting-rooms');
    return res.data;
  },

  async getRoomById(id: string): Promise<MeetingRoom> {
    const res = await apiClient.get<MeetingRoom>(`/meeting-rooms/${id}`);
    return res.data;
  },

  async createRoom(data: Partial<MeetingRoom>): Promise<MeetingRoom> {
    const res = await apiClient.post<MeetingRoom>('/meeting-rooms', data);
    return res.data;
  },

  async updateRoom(id: string, data: Partial<MeetingRoom>): Promise<MeetingRoom> {
    const res = await apiClient.put<MeetingRoom>(`/meeting-rooms/${id}`, data);
    return res.data;
  },

  async deleteRoom(id: string): Promise<void> {
    await apiClient.delete(`/meeting-rooms/${id}`);
  },
};
