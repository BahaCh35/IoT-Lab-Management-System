import { Equipment, Checkout } from '../types';

// Mock equipment data with realistic items
let equipment: Equipment[] = [
  {
    id: 'eq-001',
    name: 'Arduino Uno',
    description: 'Microcontroller board with ATmega328P processor',
    category: 'microcontroller',
    status: 'available',
    location: { building: 'Building A', room: 'Lab 1', cabinet: 'Cabinet 1', drawer: 'D1' },
    qrCode: 'QR-EQ-001-ARDUINO-UNO',
    specifications: { processor: 'ATmega328P', memory: '32KB', voltage: '5V' },
    acquisitionDate: '2023-06-15',
    usageCount: 45,
    lastUsedBy: 'Ahmed',
    lastUsedDate: '2024-02-20',
    imageUrl: 'https://via.placeholder.com/200?text=Arduino+Uno',
  },
  {
    id: 'eq-002',
    name: 'Oscilloscope',
    description: 'Digital oscilloscope with 200MHz bandwidth',
    category: 'tool',
    status: 'available',
    location: { building: 'Building A', room: 'Lab 2', cabinet: 'Cabinet 2', drawer: 'D2' },
    qrCode: 'QR-EQ-002-OSCILLOSCOPE',
    specifications: { bandwidth: '200MHz', channels: '4', sampleRate: '1GSa/s' },
    acquisitionDate: '2022-11-08',
    usageCount: 120,
    lastUsedBy: 'Sara',
    lastUsedDate: '2024-02-19',
    imageUrl: 'https://via.placeholder.com/200?text=Oscilloscope',
  },
  {
    id: 'eq-003',
    name: 'Raspberry Pi 4',
    description: 'Single-board computer with 8GB RAM',
    category: 'microcontroller',
    status: 'available',
    location: { building: 'Building B', room: 'Lab 3', cabinet: 'Cabinet 1', drawer: 'D3' },
    qrCode: 'QR-EQ-003-RASPBERRY-PI-4',
    specifications: { cpu: 'Cortex A72', ram: '8GB', storage: 'microSD' },
    acquisitionDate: '2023-03-22',
    usageCount: 78,
    lastUsedBy: 'Ali',
    lastUsedDate: '2024-02-18',
    imageUrl: 'https://via.placeholder.com/200?text=Raspberry+Pi+4',
  },
  {
    id: 'eq-004',
    name: 'Power Supply Unit (30V)',
    description: 'Programmable DC power supply, 30V/5A',
    category: 'tool',
    status: 'available',
    location: { building: 'Building A', room: 'Lab 1', cabinet: 'Cabinet 3', drawer: 'D1' },
    qrCode: 'QR-EQ-004-PSU-30V',
    specifications: { voltage: '30V', current: '5A', accuracy: '0.1%' },
    acquisitionDate: '2023-01-10',
    usageCount: 92,
    lastUsedBy: 'Fatima',
    lastUsedDate: '2024-02-17',
    imageUrl: 'https://via.placeholder.com/200?text=PSU+30V',
  },
  {
    id: 'eq-005',
    name: 'Digital Multimeter',
    description: 'Handheld multimeter with data logging',
    category: 'tool',
    status: 'available',
    location: { building: 'Building A', room: 'Lab 1', cabinet: 'Cabinet 2', drawer: 'D1' },
    qrCode: 'QR-EQ-005-MULTIMETER',
    specifications: { ranges: 'DC/AC V,A,Ω', display: '6000 counts', resolution: '0.1mV' },
    acquisitionDate: '2023-05-20',
    usageCount: 156,
    lastUsedBy: 'Hassan',
    lastUsedDate: '2024-02-21',
    imageUrl: 'https://via.placeholder.com/200?text=Multimeter',
  },
  {
    id: 'eq-006',
    name: 'Function Generator',
    description: 'DDS function generator 25MHz, sine/square/triangle',
    category: 'tool',
    status: 'available',
    location: { building: 'Building B', room: 'Lab 4', cabinet: 'Cabinet 1', drawer: 'D2' },
    qrCode: 'QR-EQ-006-FUNC-GEN',
    specifications: { frequency: '25MHz', waveforms: '5', ampOutput: '20Vpp' },
    acquisitionDate: '2022-09-14',
    usageCount: 67,
    lastUsedBy: 'Layla',
    lastUsedDate: '2024-02-16',
    imageUrl: 'https://via.placeholder.com/200?text=Function+Generator',
  },
  {
    id: 'eq-007',
    name: 'Soldering Iron - Weller',
    description: 'Temperature-controlled soldering station',
    category: 'tool',
    status: 'available',
    location: { building: 'Building A', room: 'Soldering Station', cabinet: 'Cabinet 1', drawer: 'D1' },
    qrCode: 'QR-EQ-007-SOLDER-IRON',
    specifications: { temp: '200-500°C', power: '50W', tip: 'Interchangeable' },
    acquisitionDate: '2023-07-05',
    usageCount: 234,
    lastUsedBy: 'Mohammed',
    lastUsedDate: '2024-02-21',
    imageUrl: 'https://via.placeholder.com/200?text=Soldering+Iron',
  },
  {
    id: 'eq-008',
    name: 'Breadboard (830pt)',
    description: 'Solderless breadboard with 830 tie points',
    category: 'component',
    status: 'available',
    location: { building: 'Building A', room: 'Lab 1', cabinet: 'Cabinet 2', drawer: 'D3' },
    qrCode: 'QR-EQ-008-BREADBOARD',
    specifications: { tiePoints: '830', rows: '2', columns: '60' },
    acquisitionDate: '2023-02-28',
    usageCount: 189,
    lastUsedBy: 'Noor',
    lastUsedDate: '2024-02-20',
    imageUrl: 'https://via.placeholder.com/200?text=Breadboard',
  },
  {
    id: 'eq-009',
    name: 'USB Oscilloscope',
    description: 'Portable USB oscilloscope 100MHz',
    category: 'tool',
    status: 'available',
    location: { building: 'Building B', room: 'Lab 4', cabinet: 'Cabinet 2', drawer: 'D1' },
    qrCode: 'QR-EQ-009-USB-SCOPE',
    specifications: { bandwidth: '100MHz', channels: '2', resolution: '12-bit' },
    acquisitionDate: '2023-08-12',
    usageCount: 45,
    lastUsedBy: 'Karim',
    lastUsedDate: '2024-02-19',
    imageUrl: 'https://via.placeholder.com/200?text=USB+Oscilloscope',
  },
  {
    id: 'eq-010',
    name: 'Logic Analyzer',
    description: 'USB Logic Analyzer, 24 channels',
    category: 'tool',
    status: 'available',
    location: { building: 'Building A', room: 'Lab 2', cabinet: 'Cabinet 1', drawer: 'D2' },
    qrCode: 'QR-EQ-010-LOGIC-ANALYZER',
    specifications: { channels: '24', maxFreq: '24MHz', memory: '64MB' },
    acquisitionDate: '2023-04-06',
    usageCount: 34,
    lastUsedBy: 'Yasmin',
    lastUsedDate: '2024-02-21',
    imageUrl: 'https://via.placeholder.com/200?text=Logic+Analyzer',
  },
  {
    id: 'eq-011',
    name: 'STM32 Discovery Board',
    description: 'ARM Cortex-M4 microcontroller board',
    category: 'microcontroller',
    status: 'available',
    location: { building: 'Building B', room: 'Lab 3', cabinet: 'Cabinet 2', drawer: 'D2' },
    qrCode: 'QR-EQ-011-STM32',
    specifications: { processor: 'Cortex-M4', clock: '84MHz', memory: '192KB' },
    acquisitionDate: '2023-09-18',
    usageCount: 56,
    lastUsedBy: 'Omar',
    lastUsedDate: '2024-02-20',
    imageUrl: 'https://via.placeholder.com/200?text=STM32+Discovery',
  },
  {
    id: 'eq-012',
    name: 'Temperature/Humidity Sensor',
    description: 'DHT22 digital sensor module',
    category: 'sensor',
    status: 'available',
    location: { building: 'Building A', room: 'Lab 1', cabinet: 'Cabinet 4', drawer: 'D1' },
    qrCode: 'QR-EQ-012-DHT22',
    specifications: { range: '-40~80°C', accuracy: '±0.5°C', interface: 'Digital' },
    acquisitionDate: '2023-06-01',
    usageCount: 89,
    lastUsedBy: 'Amina',
    lastUsedDate: '2024-02-21',
    imageUrl: 'https://via.placeholder.com/200?text=DHT22+Sensor',
  },
  {
    id: 'eq-013',
    name: 'Motion Sensor (PIR)',
    description: 'Passive infrared motion detector module',
    category: 'sensor',
    status: 'available',
    location: { building: 'Building B', room: 'Lab 3', cabinet: 'Cabinet 1', drawer: 'D4' },
    qrCode: 'QR-EQ-013-PIR-SENSOR',
    specifications: { range: '5-10m', angle: '120°', voltage: '5-12V' },
    acquisitionDate: '2023-07-22',
    usageCount: 42,
    lastUsedBy: 'Rashid',
    lastUsedDate: '2024-02-18',
    imageUrl: 'https://via.placeholder.com/200?text=PIR+Sensor',
  },
  {
    id: 'eq-014',
    name: 'Ultrasonic Distance Sensor',
    description: 'HC-SR04 ultrasonic ranging module',
    category: 'sensor',
    status: 'available',
    location: { building: 'Building A', room: 'Lab 2', cabinet: 'Cabinet 3', drawer: 'D3' },
    qrCode: 'QR-EQ-014-ULTRASONIC',
    specifications: { range: '2cm-400cm', accuracy: '±3cm', frequency: '40kHz' },
    acquisitionDate: '2023-08-31',
    usageCount: 73,
    lastUsedBy: 'Dina',
    lastUsedDate: '2024-02-21',
    imageUrl: 'https://via.placeholder.com/200?text=Ultrasonic+Sensor',
  },
  {
    id: 'eq-015',
    name: 'LED Strip (RGB)',
    description: 'Addressable WS2812B RGB LED strip',
    category: 'component',
    status: 'available',
    location: { building: 'Building B', room: 'Lab 4', cabinet: 'Cabinet 3', drawer: 'D1' },
    qrCode: 'QR-EQ-015-LED-RGB',
    specifications: { leds: '30/meter', colors: '16.7M', voltage: '5V' },
    acquisitionDate: '2023-10-05',
    usageCount: 28,
    lastUsedBy: 'Zain',
    lastUsedDate: '2024-02-19',
    imageUrl: 'https://via.placeholder.com/200?text=RGB+LED+Strip',
  },
  {
    id: 'eq-016',
    name: 'DC Motor Controller',
    description: 'PWM DC motor driver module L298N',
    category: 'component',
    status: 'available',
    location: { building: 'Building A', room: 'Lab 1', cabinet: 'Cabinet 4', drawer: 'D2' },
    qrCode: 'QR-EQ-016-MOTOR-CTRL',
    specifications: { current: '2A continuous', voltage: '5-35V', channels: '2' },
    acquisitionDate: '2023-05-15',
    usageCount: 95,
    lastUsedBy: 'Rania',
    lastUsedDate: '2024-02-20',
    imageUrl: 'https://via.placeholder.com/200?text=Motor+Controller',
  },
  {
    id: 'eq-017',
    name: 'USB Cable (Type-A to Micro)',
    description: 'High-quality USB charging and data cable',
    category: 'component',
    status: 'available',
    location: { building: 'Building A', room: 'Lab 1', cabinet: 'Cabinet 1', drawer: 'D2' },
    qrCode: 'QR-EQ-017-USB-CABLE',
    specifications: { length: '2m', gauge: '28AWG', shielded: 'Yes' },
    acquisitionDate: '2023-01-20',
    usageCount: 234,
    lastUsedBy: 'Tarek',
    lastUsedDate: '2024-02-21',
    imageUrl: 'https://via.placeholder.com/200?text=USB+Cable',
  },
  {
    id: 'eq-018',
    name: 'Power Bank 20000mAh',
    description: 'Portable power bank with dual USB outputs',
    category: 'other',
    status: 'available',
    location: { building: 'Building B', room: 'Storage', cabinet: 'Cabinet 1', drawer: 'D2' },
    qrCode: 'QR-EQ-018-POWER-BANK',
    specifications: { capacity: '20000mAh', outputs: '2x USB', fastCharge: '18W' },
    acquisitionDate: '2023-03-08',
    usageCount: 156,
    lastUsedBy: 'Rana',
    lastUsedDate: '2024-02-18',
    imageUrl: 'https://via.placeholder.com/200?text=Power+Bank',
  },
  {
    id: 'eq-019',
    name: 'HDMI Cable (2m)',
    description: '4K HDMI 2.0 cable with gold connectors',
    category: 'component',
    status: 'available',
    location: { building: 'Building A', room: 'Lab 2', cabinet: 'Cabinet 2', drawer: 'D2' },
    qrCode: 'QR-EQ-019-HDMI-CABLE',
    specifications: { length: '2m', version: '2.0', resolution: '4K@60Hz' },
    acquisitionDate: '2023-04-12',
    usageCount: 67,
    lastUsedBy: 'Mariam',
    lastUsedDate: '2024-02-17',
    imageUrl: 'https://via.placeholder.com/200?text=HDMI+Cable',
  },
  {
    id: 'eq-020',
    name: 'ESP32 Development Board',
    description: 'WiFi + Bluetooth microcontroller with 10 GPIO',
    category: 'microcontroller',
    status: 'available',
    location: { building: 'Building B', room: 'Lab 3', cabinet: 'Cabinet 3', drawer: 'D3' },
    qrCode: 'QR-EQ-020-ESP32',
    specifications: { cpu: 'Dual-core Xtensa', wifi: '802.11 b/g/n', bluetooth: '4.2' },
    acquisitionDate: '2023-11-15',
    usageCount: 34,
    lastUsedBy: 'Salma',
    lastUsedDate: '2024-02-21',
    imageUrl: 'https://via.placeholder.com/200?text=ESP32',
  },
];

// Mock checkout history
let checkouts: Checkout[] = [
  {
    id: 'co-001',
    equipmentId: 'eq-001',
    userId: '101',
    userName: 'Ahmed',
    checkoutDate: '2024-02-20T08:30:00Z',
    expectedReturnDate: '2024-02-22T17:00:00Z',
    actualReturnDate: '2024-02-22T16:45:00Z',
    status: 'returned',
    notes: 'Used for IoT project - returned in good condition',
  },
  {
    id: 'co-002',
    equipmentId: 'eq-002',
    userId: '102',
    userName: 'Sara',
    checkoutDate: '2024-02-19T10:15:00Z',
    expectedReturnDate: '2024-02-21T17:00:00Z',
    actualReturnDate: '2024-02-21T16:30:00Z',
    status: 'returned',
    notes: '',
  },
  {
    id: 'co-003',
    equipmentId: 'eq-005',
    userId: '101',
    userName: 'Ahmed',
    checkoutDate: '2024-02-21T09:00:00Z',
    expectedReturnDate: '2024-02-23T17:00:00Z',
    actualReturnDate: undefined,
    status: 'active',
    notes: 'Using for circuit measurements',
  },
  {
    id: 'co-004',
    equipmentId: 'eq-007',
    userId: '103',
    userName: 'Ali',
    checkoutDate: '2024-02-21T14:20:00Z',
    expectedReturnDate: '2024-02-21T18:00:00Z',
    actualReturnDate: undefined,
    status: 'active',
    notes: 'Workshop session - soldering PCB boards',
  },
  {
    id: 'co-005',
    equipmentId: 'eq-010',
    userId: '104',
    userName: 'Fatima',
    checkoutDate: '2024-02-18T11:45:00Z',
    expectedReturnDate: '2024-02-21T17:00:00Z',
    actualReturnDate: '2024-02-20T15:20:00Z',
    status: 'returned',
    notes: 'Digital protocol debugging',
  },
  {
    id: 'co-006',
    equipmentId: 'eq-003',
    userId: '105',
    userName: 'Hassan',
    checkoutDate: '2024-02-20T13:30:00Z',
    expectedReturnDate: '2024-02-25T17:00:00Z',
    actualReturnDate: undefined,
    status: 'active',
    notes: 'Long-term project checkout',
  },
];

export const checkoutService = {
  // Get all equipment
  getEquipment(): Equipment[] {
    return [...equipment];
  },

  // Get single equipment by ID
  getEquipmentById(id: string): Equipment | undefined {
    return equipment.find((e) => e.id === id);
  },

  // Get equipment by category
  getEquipmentByCategory(category: Equipment['category']): Equipment[] {
    return equipment.filter((e) => e.category === category);
  },

  // Get available equipment only
  getAvailableEquipment(): Equipment[] {
    return equipment.filter((e) => e.status === 'available');
  },

  // Checkout equipment
  checkoutEquipment(
    equipmentId: string,
    userId: string,
    userName: string,
    expectedReturnDate: string,
    notes?: string
  ): Checkout {
    const eq = equipment.find((e) => e.id === equipmentId);
    if (!eq) throw new Error('Equipment not found');
    if (eq.status !== 'available') throw new Error('Equipment is not available');

    // Update equipment status
    eq.status = 'checked-out';
    eq.lastUsedBy = userName;
    eq.lastUsedDate = new Date().toISOString();
    eq.usageCount += 1;

    // Create checkout record
    const newCheckout: Checkout = {
      id: `co-${Date.now()}`,
      equipmentId,
      userId,
      userName,
      checkoutDate: new Date().toISOString(),
      expectedReturnDate,
      status: 'active',
      notes,
    };

    checkouts.unshift(newCheckout);
    return newCheckout;
  },

  // Check in equipment (return)
  checkInEquipment(checkoutId: string, notes?: string): Checkout {
    const checkout = checkouts.find((c) => c.id === checkoutId);
    if (!checkout) throw new Error('Checkout record not found');
    if (checkout.status === 'returned') throw new Error('Already returned');

    const eq = equipment.find((e) => e.id === checkout.equipmentId);
    if (eq) {
      eq.status = 'available';
    }

    checkout.actualReturnDate = new Date().toISOString();
    checkout.status = 'returned';
    if (notes) {
      checkout.notes = notes;
    }

    return checkout;
  },

  // Check in by QR code
  checkInByQRCode(qrCode: string, notes?: string): Checkout | null {
    const eq = equipment.find((e) => e.qrCode === qrCode);
    if (!eq) return null;

    const checkout = checkouts.find((c) => c.equipmentId === eq.id && c.status === 'active');
    if (!checkout) return null;

    return this.checkInEquipment(checkout.id, notes);
  },

  // Get all checkouts
  getCheckouts(): Checkout[] {
    return [...checkouts];
  },

  // Get active checkouts
  getActiveCheckouts(): Checkout[] {
    return checkouts.filter((c) => c.status === 'active');
  },

  // Get user's active checkouts
  getUserActiveCheckouts(userId: string): Checkout[] {
    return checkouts.filter((c) => c.userId === userId && c.status === 'active');
  },

  // Get user's checkout history
  getUserCheckoutHistory(userId: string): Checkout[] {
    return checkouts.filter((c) => c.userId === userId);
  },

  // Get checkout by ID
  getCheckoutById(id: string): Checkout | undefined {
    return checkouts.find((c) => c.id === id);
  },

  // Get checkout by QR code
  getCheckoutByQRCode(qrCode: string): Checkout | undefined {
    const eq = equipment.find((e) => e.qrCode === qrCode);
    if (!eq) return undefined;
    return checkouts.find((c) => c.equipmentId === eq.id && c.status === 'active');
  },

  // Get checkout statistics
  getCheckoutStats(): {
    totalCheckouts: number;
    activeCheckouts: number;
    returnedCheckouts: number;
    overdueCheckouts: number;
  } {
    const now = new Date();
    const active = checkouts.filter((c) => c.status === 'active').length;
    const returned = checkouts.filter((c) => c.status === 'returned').length;
    const overdue = checkouts.filter(
      (c) => c.status === 'active' && new Date(c.expectedReturnDate) < now
    ).length;

    return {
      totalCheckouts: checkouts.length,
      activeCheckouts: active,
      returnedCheckouts: returned,
      overdueCheckouts: overdue,
    };
  },

  // Get overdue checkouts
  getOverdueCheckouts(): Checkout[] {
    const now = new Date();
    return checkouts.filter(
      (c) => c.status === 'active' && new Date(c.expectedReturnDate) < now
    );
  },

  // Search equipment
  searchEquipment(query: string): Equipment[] {
    const lowerQuery = query.toLowerCase();
    return equipment.filter(
      (e) =>
        e.name.toLowerCase().includes(lowerQuery) ||
        e.description.toLowerCase().includes(lowerQuery) ||
        e.qrCode.toLowerCase().includes(lowerQuery) ||
        e.id.toLowerCase().includes(lowerQuery)
    );
  },
};

export default checkoutService;
