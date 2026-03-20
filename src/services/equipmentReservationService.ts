import { Reservation, User } from '../types';

let equipmentReservations: Reservation[] = [
  {
    id: 'eq-res-1',
    equipmentId: 'eq-001',
    equipment: 'Arduino Uno',
    userId: '101',
    userName: 'Ahmed',
    startDate: '2024-02-20',
    endDate: '2024-02-22',
    status: 'approved',
    approver: { id: '1', name: 'Admin', email: 'admin@novation.com', role: 'admin', createdAt: '2024-01-01' },
    createdDate: '2024-02-19T08:00:00Z'
  },
  {
    id: 'eq-res-2',
    equipmentId: 'eq-002',
    equipment: 'Oscilloscope',
    userId: '102',
    userName: 'Asma',
    startDate: '2024-02-25',
    endDate: '2024-02-28',
    status: 'pending',
    createdDate: '2024-02-23T10:00:00Z'
  },
  {
    id: 'eq-res-3',
    equipmentId: 'eq-003',
    equipment: 'Raspberry Pi 4',
    userId: '103',
    userName: 'Ali',
    startDate: '2024-03-01',
    endDate: '2024-03-05',
    status: 'rejected',
    approver: { id: '1', name: 'Admin', email: 'admin@novation.com', role: 'admin', createdAt: '2024-01-01' },
    rejectionReason: 'Equipment under maintenance',
    createdDate: '2024-02-28T14:00:00Z'
  }
];

export const equipmentReservationService = {
  getReservations(filters?: { userId?: string; status?: string }): Reservation[] {
    let reservations = [...equipmentReservations];

    if (filters?.userId) {
      reservations = reservations.filter((r) => r.userId === filters.userId);
    }

    if (filters?.status) {
      reservations = reservations.filter((r) => r.status === filters.status);
    }

    return reservations;
  },

  getReservationById(id: string): Reservation | undefined {
    return equipmentReservations.find((r) => r.id === id);
  },

  createReservation(data: Partial<Reservation>): Reservation {
    const newReservation: Reservation = {
      id: `eq-res-${Date.now()}`,
      equipmentId: data.equipmentId || '',
      equipment: data.equipment || 'Unknown Equipment',
      userId: data.userId || '',
      userName: data.userName || '',
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      status: 'pending',
      notes: data.notes || '',
      createdDate: new Date().toISOString(),
    };
    equipmentReservations.push(newReservation);
    return newReservation;
  },

  updateReservation(id: string, data: Partial<Reservation>): Reservation | undefined {
    const reservation = equipmentReservations.find((r) => r.id === id);
    if (reservation) {
      Object.assign(reservation, data);
    }
    return reservation;
  },

  approveReservation(id: string, approver: User): Reservation | undefined {
    const reservation = equipmentReservations.find((r) => r.id === id);
    if (reservation) {
      reservation.status = 'approved';
      reservation.approver = approver;
    }
    return reservation;
  },

  rejectReservation(id: string, approver: User, reason: string): Reservation | undefined {
    const reservation = equipmentReservations.find((r) => r.id === id);
    if (reservation) {
      reservation.status = 'rejected';
      reservation.approver = approver;
      reservation.rejectionReason = reason;
    }
    return reservation;
  },

  cancelReservation(id: string): void {
    const reservation = equipmentReservations.find((r) => r.id === id);
    if (reservation) {
      reservation.status = 'cancelled';
    }
  },

  getStats() {
    return {
      total: equipmentReservations.length,
      pending: equipmentReservations.filter((r) => r.status === 'pending').length,
      approved: equipmentReservations.filter((r) => r.status === 'approved').length,
      rejected: equipmentReservations.filter((r) => r.status === 'rejected').length,
      cancelled: equipmentReservations.filter((r) => r.status === 'cancelled').length,
    };
  },
};
