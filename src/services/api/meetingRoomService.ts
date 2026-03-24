import { MeetingRoom, MeetingRoomReservation, User } from '../../types';
import apiClient from './client';

export const meetingRoomService = {
  async getMeetingRooms(): Promise<MeetingRoom[]> {
    return apiClient.get<MeetingRoom[]>('/meeting-rooms');
  },

  async getMeetingRoomById(id: string): Promise<MeetingRoom> {
    return apiClient.get<MeetingRoom>(`/meeting-rooms/${id}`);
  },

  async createMeetingRoom(roomData: Partial<MeetingRoom>): Promise<MeetingRoom> {
    return apiClient.post<MeetingRoom>('/meeting-rooms', roomData);
  },

  async updateMeetingRoom(id: string, roomData: Partial<MeetingRoom>): Promise<MeetingRoom> {
    return apiClient.put<MeetingRoom>(`/meeting-rooms/${id}`, roomData);
  },

  async deleteMeetingRoom(id: string): Promise<void> {
    await apiClient.delete(`/meeting-rooms/${id}`);
  },

  async getMeetingRoomReservations(): Promise<MeetingRoomReservation[]> {
    return apiClient.get<MeetingRoomReservation[]>('/meeting-room-reservations');
  },

  async getMeetingRoomReservationsByRoomId(roomId: string): Promise<MeetingRoomReservation[]> {
    const reservations = await this.getMeetingRoomReservations();
    return reservations.filter(r => r.roomId === roomId);
  },

  async getMeetingRoomReservationsByUserId(userId: string): Promise<MeetingRoomReservation[]> {
    const reservations = await this.getMeetingRoomReservations();
    return reservations.filter(r => r.user.id === userId);
  },

  async createMeetingRoomReservation(reservationData: {
    roomId: string;
    user: User;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
  }): Promise<MeetingRoomReservation> {
    return apiClient.post<MeetingRoomReservation>('/meeting-room-reservations', {
      room_id: reservationData.roomId,
      user_id: reservationData.user.id,
      title: reservationData.title,
      date: reservationData.date,
      start_time: reservationData.startTime,
      end_time: reservationData.endTime,
    });
  },

  async approveMeetingRoomReservation(id: string): Promise<MeetingRoomReservation> {
    return apiClient.put<MeetingRoomReservation>(`/meeting-room-reservations/${id}/approve`);
  },

  async rejectMeetingRoomReservation(id: string, reason?: string): Promise<MeetingRoomReservation> {
    return apiClient.put<MeetingRoomReservation>(`/meeting-room-reservations/${id}/reject`, { reason });
  },

  async getMeetingRoomStats(): Promise<{
    total: number;
    active: number;
    totalCapacity: number;
  }> {
    return apiClient.get('/meeting-rooms/stats');
  },
};

export default meetingRoomService;
