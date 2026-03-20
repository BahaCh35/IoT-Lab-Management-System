// Equipment categories
export const EQUIPMENT_CATEGORIES = {
  computer: 'Computer',
  microcontroller: 'Microcontroller',
  sensor: 'Sensor',
  tool: 'Tool',
  component: 'Component',
  other: 'Other',
};

// Equipment status
export const EQUIPMENT_STATUS = {
  available: { label: 'Available', color: '#10b981' },
  'checked-out': { label: 'Checked Out', color: '#3b82f6' },
  maintenance: { label: 'Maintenance', color: '#f59e0b' },
  damaged: { label: 'Damaged', color: '#ef4444' },
};

// User roles
export const USER_ROLES = {
  admin: 'Administrator',
  'lab-manager': 'Lab Manager',
  engineer: 'Engineer',
  technician: 'Technician',
  guest: 'Guest',
};

// Checkout status
export const CHECKOUT_STATUS = {
  active: 'Active',
  returned: 'Returned',
};

// Reservation status
export const RESERVATION_STATUS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
};

// Routes
export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  equipment: '/equipment',
  equipment_detail: '/equipment/:id',
  checkout: '/checkout',
  reservations: '/reservations',
  analytics: '/analytics',
  profile: '/profile',
  settings: '/settings',
};

// Navigation menu items
export const NAVIGATION_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { label: 'Equipment', path: '/equipment', icon: 'inventory_2' },
  { label: 'Check-out/in', path: '/checkout', icon: 'qr_code' },
  { label: 'Reservations', path: '/reservations', icon: 'event' },
  { label: 'Analytics', path: '/analytics', icon: 'analytics' },
];

// Default pagination
export const ITEMS_PER_PAGE = 10;
export const PAGINATION_OPTIONS = [5, 10, 25, 50];

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<'admin' | 'engineer', string[]> = {
  admin: [
    'APPROVE_EQUIPMENT',
    'APPROVE_PRODUCTS',
    'APPROVE_RESERVATIONS',
    'MANAGE_USERS',
    'MANAGE_ROOMS',
    'MANAGE_LABS',
    'VIEW_ANALYTICS',
    'MANAGE_STORAGE'
  ],
  engineer: []
};

// Approval request types
export const APPROVAL_TYPES = [
  'equipment-purchase',
  'product-modification',
  'checkout-request',
  'reservation-request',
  'meeting-room-booking',
  'lab-reservation',
  'storage-addition'
];

// Approval priorities
export const APPROVAL_PRIORITIES = {
  low: { label: 'Low', color: '#3b82f6' },
  medium: { label: 'Medium', color: '#f59e0b' },
  high: { label: 'High', color: '#ef4444' }
};

// Meeting room amenities
export const MEETING_ROOM_AMENITIES = [
  'Projector',
  'Whiteboard',
  'Video Conference',
  'Sound System',
  'WiFi',
  'Parking',
  'Accessible',
  'Kitchen Access'
];
