import { PartsRequest, User } from '../types';

let partsRequests: PartsRequest[] = [
  {
    id: 'parts-req-001',
    technicianId: '201',
    technicianName: 'John',
    partName: 'Voltage Regulator IC LM7815',
    quantity: 5,
    reason: 'Power Supply Unit repairs - voltage regulation failures',
    requestedDate: '2024-02-20T08:00:00Z',
    status: 'arrived',
    approvedBy: { id: '1', name: 'Admin', email: 'admin@novation.com', role: 'admin', createdAt: '2024-01-01' }
  },
  {
    id: 'parts-req-002',
    technicianId: '202',
    technicianName: 'Sarah',
    partName: 'Cooling Fan Assembly 5V',
    quantity: 3,
    reason: 'Raspberry Pi 4 overheating - fan replacement needed',
    requestedDate: '2024-02-23T09:00:00Z',
    status: 'approved',
    approvedBy: { id: '1', name: 'Admin', email: 'admin@novation.com', role: 'admin', createdAt: '2024-01-01' }
  },
  {
    id: 'parts-req-003',
    technicianId: '201',
    technicianName: 'John',
    partName: 'USB Cable Type-B 3m',
    quantity: 10,
    reason: 'General stock replenishment - multiple devices needing replacement cables',
    requestedDate: '2024-02-25T10:30:00Z',
    status: 'pending'
  },
  {
    id: 'parts-req-004',
    technicianId: '202',
    technicianName: 'Sarah',
    partName: 'Heating Element 40W',
    quantity: 2,
    reason: 'Soldering iron repair - heating element replacement',
    requestedDate: '2024-02-19T08:00:00Z',
    status: 'arrived',
    approvedBy: { id: '1', name: 'Admin', email: 'admin@novation.com', role: 'admin', createdAt: '2024-01-01' }
  },
  {
    id: 'parts-req-005',
    technicianId: '201',
    technicianName: 'John',
    partName: 'Electrolytic Capacitor 10μF 50V',
    quantity: 20,
    reason: 'Multiple power supply repairs - capacitor failures',
    requestedDate: '2024-02-21T14:00:00Z',
    status: 'approved',
    approvedBy: { id: '1', name: 'Admin', email: 'admin@novation.com', role: 'admin', createdAt: '2024-01-01' }
  },
  {
    id: 'parts-req-006',
    technicianId: '202',
    technicianName: 'Sarah',
    partName: 'Battery CR2032 (Lithium Coin Cell)',
    quantity: 15,
    reason: 'Multimeter and test equipment battery stock',
    requestedDate: '2024-02-24T11:00:00Z',
    status: 'pending'
  }
];

// Component inventory - track parts available in storage
const componentInventory: Record<string, number> = {
  'Resistor 1K Ohm 1/4W': 150,
  'Resistor 10K Ohm 1/4W': 200,
  'Capacitor 10μF 50V': 85,
  'Capacitor 100μF 50V': 45,
  'LED Red 5mm': 80,
  'LED Green 5mm': 60,
  'Diode 1N4007': 120,
  'Transistor BC547': 95,
  'IC 74HC595': 30,
  'IC LM7805': 25,
  'IC LM7815': 20,
  'USB Cable Type-A to Type-B': 12,
  'USB Cable Type-C': 8,
  'Male Header Pins 2.54mm': 200,
  'Female Header Socket 2.54mm': 150,
  'Breadboard (400pt)': 5,
  'Breadboard (830pt)': 3,
  'Jumper Wires Set': 15,
  'Soldering Iron Tip': 25,
  'Solder Wire 60/40': 10,
  'Flux Paste': 5,
  'Heat Shrink Tubing': 20,
  'Thermal Paste': 8,
  'Cooling Fan 5V': 12,
  'Heatsink CPU': 6
};

export const partsService = {
  /**
   * Get all parts requests
   */
  getAllPartsRequests(): PartsRequest[] {
    return [...partsRequests];
  },

  /**
   * Get parts requests with filtering
   */
  getPartsRequests(filters?: { status?: string; technicianId?: string }): PartsRequest[] {
    let requests = [...partsRequests];

    if (filters?.status) {
      requests = requests.filter((r) => r.status === filters.status);
    }

    if (filters?.technicianId) {
      requests = requests.filter((r) => r.technicianId === filters.technicianId);
    }

    return requests;
  },

  /**
   * Get single parts request by ID
   */
  getPartsRequestById(id: string): PartsRequest | undefined {
    return partsRequests.find((r) => r.id === id);
  },

  /**
   * Create new parts request
   */
  requestParts(data: Partial<PartsRequest>): PartsRequest {
    const newRequest: PartsRequest = {
      id: `parts-req-${Date.now()}`,
      technicianId: data.technicianId || '',
      technicianName: data.technicianName || '',
      partName: data.partName || '',
      quantity: data.quantity || 1,
      reason: data.reason || '',
      requestedDate: data.requestedDate || new Date().toISOString(),
      status: 'pending'
    };
    partsRequests.push(newRequest);
    return newRequest;
  },

  /**
   * Approve parts request
   */
  approveParts(requestId: string, approver: User): PartsRequest | undefined {
    const request = partsRequests.find((r) => r.id === requestId);
    if (request) {
      request.status = 'approved';
      request.approvedBy = approver;
    }
    return request;
  },

  /**
   * Reject parts request (pending → rejected)
   */
  rejectParts(requestId: string): PartsRequest | undefined {
    const request = partsRequests.find((r) => r.id === requestId);
    if (request && request.status === 'pending') {
      request.status = 'rejected';
    }
    return request;
  },

  /**
   * Cancel approved parts request that hasn't arrived yet (approved → cancelled)
   */
  cancelParts(requestId: string): PartsRequest | undefined {
    const request = partsRequests.find((r) => r.id === requestId);
    if (request && request.status === 'approved') {
      request.status = 'cancelled';
    }
    return request;
  },

  /**
   * Mark parts as arrived
   */
  markPartsArrived(requestId: string): PartsRequest | undefined {
    const request = partsRequests.find((r) => r.id === requestId);
    if (request && request.status === 'approved') {
      request.status = 'arrived';
      // Add parts to inventory
      if (componentInventory[request.partName]) {
        componentInventory[request.partName] += request.quantity;
      } else {
        componentInventory[request.partName] = request.quantity;
      }
    }
    return request;
  },

  /**
   * Get component inventory with stock levels
   */
  getComponentInventory(): Record<string, number> {
    return { ...componentInventory };
  },

  /**
   * Get single component stock level
   */
  getComponentStock(partName: string): number {
    return componentInventory[partName] || 0;
  },

  /**
   * Update component stock
   */
  updateComponentStock(partName: string, quantity: number): void {
    componentInventory[partName] = quantity;
  },

  /**
   * Consume parts from inventory (when used in repair)
   */
  consumeParts(partName: string, quantity: number): boolean {
    if ((componentInventory[partName] || 0) >= quantity) {
      componentInventory[partName] = (componentInventory[partName] || 0) - quantity;
      return true;
    }
    return false;
  },

  /**
   * Check if part is low in stock (less than 10 units)
   */
  isLowStock(partName: string): boolean {
    return (componentInventory[partName] || 0) < 10;
  },

  /**
   * Get all parts that are low in stock
   */
  getLowStockParts(): string[] {
    return Object.entries(componentInventory)
      .filter(([_, quantity]) => quantity < 10)
      .map(([name, _]) => name);
  },

  /**
   * Get statistics about parts
   */
  getPartsStats() {
    return {
      totalRequests: partsRequests.length,
      pendingRequests: partsRequests.filter((r) => r.status === 'pending').length,
      approvedRequests: partsRequests.filter((r) => r.status === 'approved').length,
      arrivedRequests: partsRequests.filter((r) => r.status === 'arrived').length,
      totalPartTypes: Object.keys(componentInventory).length,
      lowStockParts: this.getLowStockParts().length
    };
  }
};
