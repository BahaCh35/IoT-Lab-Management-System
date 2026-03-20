import { MaintenanceRequest, User, Location } from '../types';

let maintenanceRequests: MaintenanceRequest[] = [
  {
    id: 'maint-001',
    equipmentId: 'eq-001',
    equipmentName: 'Arduino Uno',
    problemDescription: 'USB port not connecting, tried multiple cables',
    reportedBy: { id: '101', name: 'Ahmed', email: 'engineer@novation.com', role: 'engineer', createdAt: '2024-01-01' },
    reportedDate: '2024-02-24T09:30:00Z',
    priority: 'high',
    status: 'pending',
    notes: '',
    partsUsed: [],
    timeSpent: 0,
    photos: [],
    location: { building: 'Building A', room: 'Lab 1', cabinet: 'Cabinet 2', drawer: 'D3', shelf: 'Top' }
  },
  {
    id: 'maint-002',
    equipmentId: 'eq-002',
    equipmentName: 'Oscilloscope',
    problemDescription: 'Display showing vertical lines, calibration might be off',
    reportedBy: { id: '102', name: 'Asma', email: 'engineer@novation.com', role: 'engineer', createdAt: '2024-01-01' },
    reportedDate: '2024-02-23T14:00:00Z',
    priority: 'medium',
    status: 'in-progress',
    assignedTo: { id: '201', name: 'John', email: 'technician@novation.com', role: 'technician', createdAt: '2024-01-01' },
    claimedDate: '2024-02-24T08:00:00Z',
    notes: 'Opened device, checking internal connectors and calibration settings',
    partsUsed: [],
    timeSpent: 1.5,
    photos: [],
    location: { building: 'Building A', room: 'Lab 2', cabinet: 'Cabinet 1', drawer: 'D1', shelf: 'Middle' }
  },
  {
    id: 'maint-003',
    equipmentId: 'eq-003',
    equipmentName: 'Raspberry Pi 4',
    problemDescription: 'Device overheating and shutting down, heatsink fan not spinning',
    reportedBy: { id: '103', name: 'Ali', email: 'engineer@novation.com', role: 'engineer', createdAt: '2024-01-01' },
    reportedDate: '2024-02-22T11:15:00Z',
    priority: 'high',
    status: 'waiting-parts',
    assignedTo: { id: '202', name: 'Sarah', email: 'technician@novation.com', role: 'technician', createdAt: '2024-01-01' },
    claimedDate: '2024-02-23T09:00:00Z',
    notes: 'Fan motor is dead, ordered replacement cooling fan. Waiting for delivery.',
    partsUsed: [],
    timeSpent: 0.5,
    photos: [],
    location: { building: 'Building B', room: 'Lab 3', cabinet: 'Cabinet 2', drawer: 'D2', shelf: 'Bottom' }
  },
  {
    id: 'maint-004',
    equipmentId: 'eq-004',
    equipmentName: 'Power Supply Unit (30V)',
    problemDescription: 'Output voltage unstable, fluctuating between 25V and 32V',
    reportedBy: { id: '101', name: 'Ahmed', email: 'engineer@novation.com', role: 'engineer', createdAt: '2024-01-01' },
    reportedDate: '2024-02-20T15:45:00Z',
    priority: 'medium',
    status: 'completed',
    assignedTo: { id: '201', name: 'John', email: 'technician@novation.com', role: 'technician', createdAt: '2024-01-01' },
    claimedDate: '2024-02-21T08:00:00Z',
    completedDate: '2024-02-22T16:30:00Z',
    notes: 'Replaced faulty voltage regulator IC. Tested output voltage stability - now stable at 30V +/- 0.1V. Recalibrated for accuracy.',
    partsUsed: ['Voltage Regulator IC LM7815', 'Electrolytic Capacitor 10μF'],
    timeSpent: 2.5,
    photos: [],
    location: { building: 'Building A', room: 'Storage', cabinet: 'Cabinet 1', drawer: 'D1', shelf: 'Top' }
  },
  {
    id: 'maint-005',
    equipmentId: 'eq-005',
    equipmentName: 'Digital Multimeter',
    problemDescription: 'Battery running low, measurement readings inconsistent',
    reportedBy: { id: '102', name: 'Asma', email: 'engineer@novation.com', role: 'engineer', createdAt: '2024-01-01' },
    reportedDate: '2024-02-25T10:00:00Z',
    priority: 'low',
    status: 'pending',
    notes: '',
    partsUsed: [],
    timeSpent: 0,
    photos: [],
    location: { building: 'Building A', room: 'Lab 1', cabinet: 'Cabinet 3', drawer: 'D1', shelf: 'Top' }
  },
  {
    id: 'maint-006',
    equipmentId: 'eq-006',
    equipmentName: 'USB Oscilloscope',
    problemDescription: 'Not recognized by computer, driver issues',
    reportedBy: { id: '103', name: 'Ali', email: 'engineer@novation.com', role: 'engineer', createdAt: '2024-01-01' },
    reportedDate: '2024-02-19T13:30:00Z',
    priority: 'medium',
    status: 'cannot-repair',
    assignedTo: { id: '202', name: 'Sarah', email: 'technician@novation.com', role: 'technician', createdAt: '2024-01-01' },
    claimedDate: '2024-02-20T08:00:00Z',
    completedDate: '2024-02-20T14:00:00Z',
    notes: 'Driver corrupted and cannot be reinstalled. Device hardware is functional but requires professional software repair. Recommended for replacement.',
    partsUsed: [],
    timeSpent: 1,
    photos: [],
    location: { building: 'Building B', room: 'Lab 4', cabinet: 'Cabinet 1', drawer: 'D2', shelf: 'Middle' }
  },
  {
    id: 'maint-007',
    equipmentId: 'eq-007',
    equipmentName: 'Soldering Iron - Weller',
    problemDescription: 'Heating element not working, temperature not rising above room temperature',
    reportedBy: { id: '101', name: 'Ahmed', email: 'engineer@novation.com', role: 'engineer', createdAt: '2024-01-01' },
    reportedDate: '2024-02-18T12:00:00Z',
    priority: 'high',
    status: 'completed',
    assignedTo: { id: '201', name: 'John', email: 'technician@novation.com', role: 'technician', createdAt: '2024-01-01' },
    claimedDate: '2024-02-19T08:00:00Z',
    completedDate: '2024-02-19T11:30:00Z',
    notes: 'Replacement heater element installed. Tested heating performance - reaches 360°C in 30 seconds. All functions working.',
    partsUsed: ['Heating Element 40W'],
    timeSpent: 1.5,
    photos: [],
    location: { building: 'Building A', room: 'Soldering Station', cabinet: 'Cabinet 1', drawer: 'D1', shelf: 'Top' }
  }
];

export const maintenanceService = {
  getMaintenanceRequests(filters?: {
    status?: string;
    priority?: string;
    technicianId?: string;
  }): MaintenanceRequest[] {
    let requests = [...maintenanceRequests];

    if (filters?.status) {
      requests = requests.filter((r) => r.status === filters.status);
    }

    if (filters?.priority) {
      requests = requests.filter((r) => r.priority === filters.priority);
    }

    if (filters?.technicianId) {
      requests = requests.filter((r) => r.assignedTo?.id === filters.technicianId);
    }

    return requests;
  },

  getMaintenanceRequestById(id: string): MaintenanceRequest | undefined {
    return maintenanceRequests.find((r) => r.id === id);
  },

  createMaintenanceRequest(data: Partial<MaintenanceRequest>): MaintenanceRequest {
    const newRequest: MaintenanceRequest = {
      id: `maint-${Date.now()}`,
      equipmentId: data.equipmentId || '',
      equipmentName: data.equipmentName || 'Unknown Equipment',
      problemDescription: data.problemDescription || '',
      reportedBy: data.reportedBy || { id: '', name: '', email: '', role: 'engineer', createdAt: new Date().toISOString() },
      reportedDate: data.reportedDate || new Date().toISOString(),
      priority: data.priority || 'medium',
      status: 'pending',
      notes: '',
      partsUsed: [],
      timeSpent: 0,
      photos: [],
      location: data.location || { building: '', room: '', cabinet: '', drawer: '' }
    };
    maintenanceRequests.push(newRequest);
    return newRequest;
  },

  claimTask(taskId: string, technician: User): MaintenanceRequest | undefined {
    const task = maintenanceRequests.find((r) => r.id === taskId);
    if (task && task.status === 'pending') {
      task.assignedTo = technician;
      task.claimedDate = new Date().toISOString();
      task.status = 'in-progress';
    }
    return task;
  },

  updateTaskStatus(taskId: string, status: string, notes?: string): MaintenanceRequest | undefined {
    const task = maintenanceRequests.find((r) => r.id === taskId);
    if (task) {
      task.status = status as any;
      if (notes) {
        task.notes = notes;
      }
      if (status === 'completed' || status === 'cannot-repair') {
        task.completedDate = new Date().toISOString();
      }
    }
    return task;
  },

  addNotes(taskId: string, notes: string): MaintenanceRequest | undefined {
    const task = maintenanceRequests.find((r) => r.id === taskId);
    if (task) {
      task.notes = notes;
    }
    return task;
  },

  addPhotos(taskId: string, photos: string[]): MaintenanceRequest | undefined {
    const task = maintenanceRequests.find((r) => r.id === taskId);
    if (task) {
      task.photos = [...(task.photos || []), ...photos];
    }
    return task;
  },

  addPartsUsed(taskId: string, parts: string[]): MaintenanceRequest | undefined {
    const task = maintenanceRequests.find((r) => r.id === taskId);
    if (task) {
      task.partsUsed = [...(task.partsUsed || []), ...parts];
    }
    return task;
  },

  completeTask(taskId: string, technician: User, notes: string, timeSpent: number): MaintenanceRequest | undefined {
    const task = maintenanceRequests.find((r) => r.id === taskId);
    if (task) {
      task.status = 'completed';
      task.completedDate = new Date().toISOString();
      task.notes = notes;
      task.timeSpent = timeSpent;
      task.assignedTo = technician;
    }
    return task;
  },

  getMaintenanceHistory(filters?: {
    dateRange?: [string, string];
    technicianId?: string;
    equipmentType?: string;
  }): MaintenanceRequest[] {
    let history = maintenanceRequests.filter((r) => r.status === 'completed' || r.status === 'cannot-repair');

    if (filters?.dateRange) {
      const [startDate, endDate] = filters.dateRange;
      history = history.filter((r) => {
        const completedDate = r.completedDate || '';
        return completedDate >= startDate && completedDate <= endDate;
      });
    }

    if (filters?.technicianId) {
      history = history.filter((r) => r.assignedTo?.id === filters.technicianId);
    }

    if (filters?.equipmentType) {
      history = history.filter((r) => r.equipmentName.includes(filters.equipmentType || ''));
    }

    return history;
  },

  getStats() {
    return {
      total: maintenanceRequests.length,
      pending: maintenanceRequests.filter((r) => r.status === 'pending').length,
      inProgress: maintenanceRequests.filter((r) => r.status === 'in-progress').length,
      waitingParts: maintenanceRequests.filter((r) => r.status === 'waiting-parts').length,
      completed: maintenanceRequests.filter((r) => r.status === 'completed').length,
      cannotRepair: maintenanceRequests.filter((r) => r.status === 'cannot-repair').length
    };
  }
};
