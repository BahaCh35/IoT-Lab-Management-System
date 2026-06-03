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
  quantity?: number;
  availableCount?: number;
  maintenanceCount?: number;
  damagedCount?: number;
  lastUsedBy?: string;
  lastUsedDate?: string;
  imageUrl?: string;
}

export interface Location {
  building: string;
  room: string;
  cabinet: string;
  drawer: string;
  shelf?: string;
}

export interface Checkout {
  id: string;
  equipmentId: string;
  equipmentName?: string;
  userId: string;
  userName: string;
  checkoutDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: 'active' | 'returned';
  notes?: string;
}

export interface Reservation {
  id: string;
  equipmentId: string;
  equipment: string;
  userId: string;
  userName: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approver?: User;
  rejectionReason?: string;
  notes?: string;
  createdDate: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'lab-manager' | 'engineer' | 'technician' | 'guest';
  department?: string;
  avatar?: string;
  createdAt: string;
}

export interface UserProfile extends User {
  department: string;
  phone?: string;
  joinDate: string;
  isActive: boolean;
  permissions: Permission[];
}

export type Permission =
  | 'APPROVE_EQUIPMENT'
  | 'APPROVE_PRODUCTS'
  | 'APPROVE_RESERVATIONS'
  | 'MANAGE_USERS'
  | 'MANAGE_ROOMS'
  | 'MANAGE_LABS'
  | 'VIEW_ANALYTICS'
  | 'MANAGE_STORAGE';

export interface ApprovalRequest {
  id: string;
  type:
    | 'equipment-purchase'
    | 'product-modification'
    | 'checkout-request'
    | 'reservation-request'
    | 'equipment-reservation'
    | 'meeting-room-booking'
    | 'lab-reservation'
    | 'storage-addition'
    | 'damage-report';
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

export interface MeetingRoom {
  id: string;
  name: string;
  capacity: number;
  floor: number;
  location: string;
  amenities: string[];
  isActive: boolean;
}

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

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, any>;
  timestamp: string;
}

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
  timeSpent: number;
  photos: string[];
  location: Location;
}

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

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'approval' | 'maintenance' | 'checkout' | 'reservation' | 'system' | 'alert';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface StorageCabinet {
  id: string;
  name: string;
  location: string;
  description?: string;
  drawersCount?: number;
  itemsCount?: number;
  createdAt?: string;
}

export interface StorageDrawer {
  id: string;
  cabinetId: string;
  name: string;
  label?: string;
  position: number;
  itemsCount?: number;
}

export interface StorageItem {
  id: string;
  drawerId: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity?: number;
  unit?: string;
  description?: string;
  equipmentId?: string;
  isLowStock?: boolean;
}

export interface ComponentInventory {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  location?: string;
}

export interface DashboardStats {
  totalEquipment: number;
  availableEquipment: number;
  checkedOutEquipment: number;
  maintenanceEquipment: number;
  totalUsers: number;
  activeCheckouts: number;
  upcomingReservations: number;
  pendingApprovals?: number;
  lowStockItems?: number;
}

export interface EquipmentUsageStats {
  equipmentId: string;
  equipmentName: string;
  totalCheckouts: number;
  uniqueUsers: number;
  averageUsageDays: number;
  lastUsedDate: string;
  utilization: number;
}
