import { UserProfile, ActivityLog } from '../types';

let users: UserProfile[] = [
  {
    id: '101',
    name: 'Ahmed',
    email: 'engineer@novation.com',
    role: 'engineer',
    department: 'Engineering',
    phone: '+971501234567',
    joinDate: '2023-06-15',
    isActive: true,
    permissions: [],
    createdAt: '2023-06-15',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=engineer@novation.com',
  },
  {
    id: '102',
    name: 'Asma',
    email: 'engineer1@novation.com',
    role: 'engineer',
    department: 'Engineering',
    phone: '+971502234567',
    joinDate: '2023-07-20',
    isActive: true,
    permissions: [],
    createdAt: '2023-07-20',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=engineer1@novation.com',
  },
  {
    id: '103',
    name: 'Ali',
    email: 'engineer2@novation.com',
    role: 'engineer',
    department: 'Engineering',
    phone: '+971503234567',
    joinDate: '2023-08-10',
    isActive: true,
    permissions: [],
    createdAt: '2023-08-10',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=engineer2@novation.com',
  },
  {
    id: '104',
    name: 'Nada',
    email: 'engineer3@novation.com',
    role: 'engineer',
    department: 'Research',
    phone: '+971504234567',
    joinDate: '2023-09-05',
    isActive: true,
    permissions: [],
    createdAt: '2023-09-05',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=engineer3@novation.com',
  },
  {
    id: '105',
    name: 'Yomna',
    email: 'engineer4@novation.com',
    role: 'engineer',
    department: 'Research',
    phone: '+971505234567',
    joinDate: '2023-10-12',
    isActive: true,
    permissions: [],
    createdAt: '2023-10-12',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=engineer4@novation.com',
  },
  {
    id: '1',
    name: 'Ahmed (Admin)',
    email: 'admin@novation.com',
    role: 'admin',
    department: 'Administration',
    phone: '+971509876543',
    joinDate: '2023-01-01',
    isActive: true,
    permissions: ['APPROVE_EQUIPMENT', 'APPROVE_PRODUCTS', 'APPROVE_RESERVATIONS', 'MANAGE_USERS', 'MANAGE_ROOMS', 'MANAGE_LABS', 'VIEW_ANALYTICS', 'MANAGE_STORAGE'],
    createdAt: '2023-01-01',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin@novation.com',
  },
];

let userActivityLog: ActivityLog[] = [
  {
    id: '1',
    userId: '101',
    action: 'checkout',
    entityType: 'equipment',
    entityId: 'eq-001',
    details: { itemName: 'Arduino Uno', date: '2024-02-20' },
    timestamp: '2024-02-20T09:30:00Z',
  },
  {
    id: '2',
    userId: '102',
    action: 'checkin',
    entityType: 'equipment',
    entityId: 'eq-002',
    details: { itemName: 'Raspberry Pi', date: '2024-02-20' },
    timestamp: '2024-02-20T14:45:00Z',
  },
  {
    id: '3',
    userId: '103',
    action: 'reserve',
    entityType: 'lab',
    entityId: 'lab-1',
    details: { labName: 'IoT Lab', date: '2024-02-22' },
    timestamp: '2024-02-20T10:15:00Z',
  },
];

export const userService = {
  getUsers() {
    return [...users];
  },

  getUserById(id: string) {
    return users.find((u) => u.id === id);
  },

  getUserByEmail(email: string) {
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  createUser(data: Partial<UserProfile>) {
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: data.name || 'New User',
      email: data.email || 'user@novation.com',
      role: data.role || 'engineer',
      department: data.department || 'Engineering',
      phone: data.phone || '',
      joinDate: new Date().toISOString().split('T')[0],
      isActive: true,
      permissions: data.permissions || [],
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    return newUser;
  },

  updateUser(id: string, data: Partial<UserProfile>) {
    const user = users.find((u) => u.id === id);
    if (user) {
      Object.assign(user, data);
    }
    return user;
  },

  activateUser(id: string) {
    const user = users.find((u) => u.id === id);
    if (user) {
      user.isActive = true;
    }
    return user;
  },

  deactivateUser(id: string) {
    const user = users.find((u) => u.id === id);
    if (user) {
      user.isActive = false;
    }
    return user;
  },

  deleteUser(id: string) {
    users = users.filter((u) => u.id !== id);
  },

  getUserActivity(userId: string) {
    return userActivityLog.filter((a) => a.userId === userId);
  },

  getUserStats() {
    return {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.isActive).length,
      inactiveUsers: users.filter((u) => !u.isActive).length,
      engineers: users.filter((u) => u.role === 'engineer').length,
      admins: users.filter((u) => u.role === 'admin').length,
      byDepartment: {
        Engineering: users.filter((u) => u.department === 'Engineering').length,
        Research: users.filter((u) => u.department === 'Research').length,
        Administration: users.filter((u) => u.department === 'Administration').length,
      },
    };
  },
};
