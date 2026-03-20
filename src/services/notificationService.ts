export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon?: string;
  actionUrl?: string;
  entityId?: string;
}

// Helper function to get user-specific storage key
const getUserNotificationKey = (): string => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return `nova_notifications_${userData.id || userData.email || 'default'}`;
    } catch {
      return 'nova_notifications_default';
    }
  }
  return 'nova_notifications_default';
};

// Helper function to load user notifications from localStorage
const loadUserNotifications = (): Notification[] => {
  const key = getUserNotificationKey();
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return getDefaultNotifications();
    }
  }
  return getDefaultNotifications();
};

// Helper function to save notifications to localStorage
const saveUserNotifications = (notifs: Notification[]): void => {
  const key = getUserNotificationKey();
  localStorage.setItem(key, JSON.stringify(notifs));
};

// Default initial notifications for new users
const getDefaultNotifications = (): Notification[] => {
  return [
    {
      id: 'notif-001',
      type: 'success',
      title: '✅ Task Completed',
      message: 'Your Arduino Uno maintenance task has been completed successfully',
      timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
      read: false,
      icon: '✅',
      actionUrl: '/technician/history',
      entityId: 'eq-res-1',
    },
    {
      id: 'notif-002',
      type: 'warning',
      title: '⚠️ Equipment Maintenance Due',
      message: 'Power Supply Unit needs scheduled maintenance within 3 days',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      read: false,
      icon: '⚠️',
      actionUrl: '/technician/equipment',
      entityId: 'eq-004',
    },
    {
      id: 'notif-003',
      type: 'info',
      title: '📦 Parts Arrived',
      message: 'Your requested parts (Resistor 1K Ohm x10) have arrived and are ready for pickup',
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      read: false,
      icon: '📦',
      actionUrl: '/technician/parts',
      entityId: 'part-req-1',
    },
  ];
};

export const notificationService = {
  getNotifications(): Notification[] {
    return [...loadUserNotifications()];
  },

  getUnreadCount(): number {
    return loadUserNotifications().filter((n) => !n.read).length;
  },

  getUnreadNotifications(): Notification[] {
    return loadUserNotifications().filter((n) => !n.read);
  },

  markAsRead(notificationId: string): void {
    const notifications = loadUserNotifications();
    const notif = notifications.find((n) => n.id === notificationId);
    if (notif) {
      notif.read = true;
      saveUserNotifications(notifications);
    }
  },

  markAllAsRead(): void {
    const notifications = loadUserNotifications();
    notifications.forEach((n) => {
      n.read = true;
    });
    saveUserNotifications(notifications);
  },

  deleteNotification(notificationId: string): void {
    const notifications = loadUserNotifications();
    const filtered = notifications.filter((n) => n.id !== notificationId);
    saveUserNotifications(filtered);
  },

  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
    const notifications = loadUserNotifications();
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    notifications.unshift(newNotification);
    saveUserNotifications(notifications);
    return newNotification;
  },

  getRecentNotifications(count: number = 5): Notification[] {
    return loadUserNotifications().slice(0, count);
  },

  getNotificationsByType(type: Notification['type']): Notification[] {
    return loadUserNotifications().filter((n) => n.type === type);
  },

  clearAll(): void {
    saveUserNotifications([]);
  },
};

export default notificationService;
