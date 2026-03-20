import { MeetingRoom, MeetingRoomReservation, User } from '../types';

let meetingRooms: MeetingRoom[] = [
  {
    id: 'room-1',
    name: 'Conference Room A',
    capacity: 12,
    floor: 2,
    location: 'Building A, East Wing',
    amenities: ['Projector', 'Whiteboard', 'Video Conference', 'WiFi'],
    isActive: true,
  },
  {
    id: 'room-2',
    name: 'Conference Room B',
    capacity: 8,
    floor: 2,
    location: 'Building A, West Wing',
    amenities: ['Projector', 'Sound System', 'WiFi'],
    isActive: true,
  },
  {
    id: 'room-3',
    name: 'Meeting Room C',
    capacity: 6,
    floor: 1,
    location: 'Building B, Main Hall',
    amenities: ['Whiteboard', 'WiFi', 'Kitchen Access'],
    isActive: true,
  },
  {
    id: 'room-4',
    name: 'Board Room',
    capacity: 20,
    floor: 3,
    location: 'Building A, Executive Level',
    amenities: ['Projector', 'Video Conference', 'Sound System', 'Parking'],
    isActive: true,
  },
];

let meetingReservations: MeetingRoomReservation[] = [
  {
    id: 'res-1',
    roomId: 'room-1',
    user: { id: '101', name: 'Ahmed', email: 'engineer@novation.com', role: 'engineer', createdAt: '2024-01-01' },
    title: 'Team Standup',
    date: '2024-02-22',
    startTime: '10:00',
    endTime: '10:30',
    status: 'approved',
    approver: { id: '1', name: 'Admin', email: 'admin@novation.com', role: 'admin', createdAt: '2024-01-01' },
  },
  {
    id: 'res-2',
    roomId: 'room-2',
    user: { id: '102', name: 'Asma', email: 'engineer1@novation.com', role: 'engineer', createdAt: '2024-01-01' },
    title: 'Client Meeting',
    date: '2024-02-23',
    startTime: '14:00',
    endTime: '15:30',
    status: 'pending',
  },
  {
    id: 'res-3',
    roomId: 'room-3',
    user: { id: '103', name: 'Ali', email: 'engineer2@novation.com', role: 'engineer', createdAt: '2024-01-01' },
    title: 'Project Planning',
    date: '2024-02-24',
    startTime: '09:00',
    endTime: '11:00',
    status: 'approved',
    approver: { id: '1', name: 'Admin', email: 'admin@novation.com', role: 'admin', createdAt: '2024-01-01' },
  },
];

export const meetingRoomService = {
  getMeetingRooms() {
    return [...meetingRooms];
  },

  getMeetingRoomById(id: string) {
    return meetingRooms.find((r) => r.id === id);
  },

  createMeetingRoom(data: Partial<MeetingRoom>) {
    const newRoom: MeetingRoom = {
      id: `room-${Date.now()}`,
      name: data.name || 'New Room',
      capacity: data.capacity || 0,
      floor: data.floor || 1,
      location: data.location || 'TBD',
      amenities: data.amenities || [],
      isActive: data.isActive !== false ? true : false,
    };
    meetingRooms.push(newRoom);
    return newRoom;
  },

  updateMeetingRoom(id: string, data: Partial<MeetingRoom>) {
    const room = meetingRooms.find((r) => r.id === id);
    if (room) {
      Object.assign(room, data);
    }
    return room;
  },

  deleteMeetingRoom(id: string) {
    meetingRooms = meetingRooms.filter((r) => r.id !== id);
  },

  getMeetingRoomReservations(roomId?: string) {
    if (roomId) {
      return meetingReservations.filter((r) => r.roomId === roomId);
    }
    return [...meetingReservations];
  },

  approveMeetingRoomReservation(id: string, approver: User) {
    const res = meetingReservations.find((r) => r.id === id);
    if (res) {
      res.status = 'approved';
      res.approver = approver;
    }
    return res;
  },

  rejectMeetingRoomReservation(id: string, approver: User) {
    const res = meetingReservations.find((r) => r.id === id);
    if (res) {
      res.status = 'rejected';
      res.approver = approver;
    }
    return res;
  },

  getStats() {
    return {
      totalRooms: meetingRooms.length,
      activeRooms: meetingRooms.filter((r) => r.isActive).length,
      totalCapacity: meetingRooms.reduce((sum, r) => sum + r.capacity, 0),
      totalReservations: meetingReservations.length,
      pendingReservations: meetingReservations.filter((r) => r.status === 'pending').length,
    };
  },
};
