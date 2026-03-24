import { MeetingRoom, MeetingRoomReservation, User } from '../types';
import { meetingRoomService as apiMeetingRoomService } from './api/meetingRoomService';

export const meetingRoomService = {
  async getMeetingRooms(): Promise<MeetingRoom[]> {
    return apiMeetingRoomService.getMeetingRooms();
  },

  async getMeetingRoomById(id: string): Promise<MeetingRoom | undefined> {
    try {
      return await apiMeetingRoomService.getMeetingRoomById(id);
    } catch {
      return undefined;
    }
  },

  async createMeetingRoom(roomData: Partial<MeetingRoom>): Promise<MeetingRoom> {
    return apiMeetingRoomService.createMeetingRoom(roomData);
  },

  async updateMeetingRoom(id: string, roomData: Partial<MeetingRoom>): Promise<MeetingRoom | undefined> {
    try {
      return await apiMeetingRoomService.updateMeetingRoom(id, roomData);
    } catch {
      return undefined;
    }
  },

  async deleteMeetingRoom(id: string): Promise<void> {
    return apiMeetingRoomService.deleteMeetingRoom(id);
  },

  async getMeetingRoomReservations(): Promise<MeetingRoomReservation[]> {
    return apiMeetingRoomService.getMeetingRoomReservations();
  },

  async getMeetingRoomReservationsByRoomId(roomId: string): Promise<MeetingRoomReservation[]> {
    return apiMeetingRoomService.getMeetingRoomReservationsByRoomId(roomId);
  },

  async getMeetingRoomReservationsByUserId(userId: string): Promise<MeetingRoomReservation[]> {
    return apiMeetingRoomService.getMeetingRoomReservationsByUserId(userId);
  },

  async createMeetingRoomReservation(reservationData: {
    roomId: string;
    user: User;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
  }): Promise<MeetingRoomReservation> {
    return apiMeetingRoomService.createMeetingRoomReservation(reservationData);
  },

  async approveMeetingRoomReservation(id: string): Promise<MeetingRoomReservation | undefined> {
    try {
      return await apiMeetingRoomService.approveMeetingRoomReservation(id);
    } catch {
      return undefined;
    }
  },

  async rejectMeetingRoomReservation(id: string, reason?: string): Promise<MeetingRoomReservation | undefined> {
    try {
      return await apiMeetingRoomService.rejectMeetingRoomReservation(id, reason);
    } catch {
      return undefined;
    }
  },

  async getMeetingRoomStats(): Promise<{
    total: number;
    active: number;
    totalCapacity: number;
  }> {
    return apiMeetingRoomService.getMeetingRoomStats();
  },
};
