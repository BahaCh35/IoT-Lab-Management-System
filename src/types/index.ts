// Types for Equipment
export interface Equipment {
  id: string;
  name: string;
  description: string;
  category: 'computer' | 'microcontroller' | 'sensor' | 'tool' | 'component' | 'other';
  status: 'available' | 'checked-out' | 'maintenance' | 'damaged';
  location: Location;
  qrCode: string;
  specifications: Record<string, string>;
  acquisitionDate: string;
  usageCount: number;
  lastUsedBy?: string;
  lastUsedDate?: string;
  imageUrl?: string;
}

// Location hierarchy
export interface Location {
  building: string;
  room: string;
  cabinet: string;
  drawer: string;
  shelf?: string;
}

// Checkout record
export interface Checkout {
  id: string;
  equipmentId: string;
  userId: string;
  userName: string;
  checkoutDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: 'active' | 'returned';
  notes?: string;
}

// Reservation
export interface Reservation {
  id: string;
  equipmentId: string;
  equipment: string;  // Equipment name for display
  userId: string;
  userName: string;
  startDate: string;   // 'YYYY-MM-DD'
  endDate: string;     // 'YYYY-MM-DD'
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approver?: User;     // Track who approved
  rejectionReason?: string;  // Track rejection reason
  notes?: string;
  createdDate: string;  // When was it requested
}

// User
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'lab-manager' | 'engineer' | 'technician' | 'guest';
  department?: string;
  avatar?: string;
  createdAt: string;
}

// Auth
export interface AuthContext {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
}

// Chatbot message
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[];
}

// Analytics
export interface EquipmentUsageStats {
  equipmentId: string;
  equipmentName: string;
  totalCheckouts: number;
  uniqueUsers: number;
  averageUsageDays: number;
  lastUsedDate: string;
  utilization: number; // 0-100%
}

export interface DashboardStats {
  totalEquipment: number;
  availableEquipment: number;
  checkedOutEquipment: number;
  maintenanceEquipment: number;
  totalUsers: number;
  activeCheckouts: number;
  upcomingReservations: number;
}

// Permission types
export type Permission =
  | 'APPROVE_EQUIPMENT'
  | 'APPROVE_PRODUCTS'
  | 'APPROVE_RESERVATIONS'
  | 'MANAGE_USERS'
  | 'MANAGE_ROOMS'
  | 'MANAGE_LABS'
  | 'VIEW_ANALYTICS'
  | 'MANAGE_STORAGE';

// User profile enhancements
export interface UserProfile extends User {
  department: string;
  phone?: string;
  joinDate: string;
  isActive: boolean;
  permissions: Permission[];
}

// Approval workflow types
export interface ApprovalRequest {
  id: string;
  type: 'equipment-purchase' | 'product-modification' | 'checkout-request' | 'reservation-request' | 'equipment-reservation' | 'meeting-room-booking' | 'lab-reservation' | 'storage-addition' | 'damage-report';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requester: User;
  description: string;
  details: Record<string, any>;
  requestedDate: string;
  reviewedBy?: User;
  reviewedDate?: string;
  rejectionReason?: string;
  priority: 'low' | 'medium' | 'high';
}

// Meeting rooms
export interface MeetingRoom {
  id: string;
  name: string;
  capacity: number;
  floor: number;
  location: string;
  amenities: string[];
  isActive: boolean;
}

// Meeting room reservations
export interface MeetingRoomReservation {
  id: string;
  roomId: string;
  user: User;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approver?: User;
}

// Lab types
export interface Lab {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  floor: number;
  isActive: boolean;
}

export interface LabReservation {
  id: string;
  labId: string;
  user: User;
  purpose: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approver?: User;
}

// Activity logging
export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, any>;
  timestamp: string;
}

// Maintenance Request/Task
export interface MaintenanceRequest {
  id: string;
  equipmentId: string;
  equipmentName: string;
  problemDescription: string;
  reportedBy: User;
  reportedDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'waiting-parts' | 'completed' | 'cannot-repair';
  assignedTo?: User;
  claimedDate?: string;
  completedDate?: string;
  notes: string;
  partsUsed: string[];
  timeSpent: number; // hours
  photos: string[]; // photo URLs
  location: Location;
}

// Parts Request
export interface PartsRequest {
  id: string;
  technicianId: string;
  technicianName: string;
  partName: string;
  quantity: number;
  reason: string;
  requestedDate: string;
  status: 'pending' | 'approved' | 'arrived' | 'rejected' | 'cancelled';
  approvedBy?: User;
}
