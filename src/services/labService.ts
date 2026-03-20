import { Lab, LabReservation, User } from '../types';

let labs: Lab[] = [
  {
    id: 'lab-1',
    name: 'IoT Lab',
    capacity: 15,
    equipment: ['Arduino Board', 'Raspberry Pi', 'Sensors', 'Breadboards'],
    floor: 2,
    isActive: true,
  },
  {
    id: 'lab-2',
    name: 'Electronics Lab',
    capacity: 12,
    equipment: ['Oscilloscope', 'Multimeter', 'Soldering Station', 'Power Supply'],
    floor: 1,
    isActive: true,
  },
  {
    id: 'lab-3',
    name: 'Robotics Lab',
    capacity: 20,
    equipment: ['Robot Arms', 'Motion Sensors', 'Controller Units', 'Safety Equipment'],
    floor: 3,
    isActive: true,
  },
];

let labReservations: LabReservation[] = [
  {
    id: 'lab-res-1',
    labId: 'lab-1',
    user: { id: '101', name: 'Ahmed', email: 'engineer@novation.com', role: 'engineer', createdAt: '2024-01-01' },
    purpose: 'IoT Project Development',
    date: '2024-02-22',
    startTime: '09:00',
    endTime: '12:00',
    status: 'approved',
    approver: { id: '1', name: 'Admin', email: 'admin@novation.com', role: 'admin', createdAt: '2024-01-01' },
  },
  {
    id: 'lab-res-2',
    labId: 'lab-2',
    user: { id: '102', name: 'Asma', email: 'engineer1@novation.com', role: 'engineer', createdAt: '2024-01-01' },
    purpose: 'Electronics Troubleshooting',
    date: '2024-02-23',
    startTime: '14:00',
    endTime: '16:00',
    status: 'pending',
  },
  {
    id: 'lab-res-3',
    labId: 'lab-3',
    user: { id: '103', name: 'Ali', email: 'engineer2@novation.com', role: 'engineer', createdAt: '2024-01-01' },
    purpose: 'Robotics Research',
    date: '2024-02-25',
    startTime: '10:00',
    endTime: '13:00',
    status: 'approved',
    approver: { id: '1', name: 'Admin', email: 'admin@novation.com', role: 'admin', createdAt: '2024-01-01' },
  },
];

export const labService = {
  getLabs() {
    return [...labs];
  },

  getLabById(id: string) {
    return labs.find((l) => l.id === id);
  },

  createLab(data: Partial<Lab>) {
    const newLab: Lab = {
      id: `lab-${Date.now()}`,
      name: data.name || 'New Lab',
      capacity: data.capacity || 0,
      equipment: data.equipment || [],
      floor: data.floor || 1,
      isActive: data.isActive !== false ? true : false,
    };
    labs.push(newLab);
    return newLab;
  },

  updateLab(id: string, data: Partial<Lab>) {
    const lab = labs.find((l) => l.id === id);
    if (lab) {
      Object.assign(lab, data);
    }
    return lab;
  },

  deleteLab(id: string) {
    labs = labs.filter((l) => l.id !== id);
  },

  getLabReservations(labId?: string) {
    if (labId) {
      return labReservations.filter((r) => r.labId === labId);
    }
    return [...labReservations];
  },

  approveLabReservation(id: string, approver: User) {
    const res = labReservations.find((r) => r.id === id);
    if (res) {
      res.status = 'approved';
      res.approver = approver;
    }
    return res;
  },

  rejectLabReservation(id: string, approver: User) {
    const res = labReservations.find((r) => r.id === id);
    if (res) {
      res.status = 'rejected';
      res.approver = approver;
    }
    return res;
  },

  getStats() {
    return {
      totalLabs: labs.length,
      activeLabs: labs.filter((l) => l.isActive).length,
      totalCapacity: labs.reduce((sum, l) => sum + l.capacity, 0),
      totalReservations: labReservations.length,
      pendingReservations: labReservations.filter((r) => r.status === 'pending').length,
    };
  },
};
