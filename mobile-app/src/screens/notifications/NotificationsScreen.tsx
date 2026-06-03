import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Button, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { notificationService } from '../../services/api/notificationService';
import { Notification } from '../../types';
import { LoadingView } from '../../components/LoadingView';
import { EmptyState } from '../../components/EmptyState';
import { ErrorView } from '../../components/ErrorView';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Colors, Spacing, Shadow } from '../../theme';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [snack, setSnack] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setSnack('All marked as read');
    } catch (err: any) {
      setSnack('Failed: ' + err.message);
    }
  };

  const deleteNotif = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err: any) {
      setSnack('Failed: ' + err.message);
    }
  };

  const clearAll = async () => {
    setConfirmClear(false);
    try {
      await notificationService.clearAll();
      setNotifications([]);
      setSnack('All notifications cleared');
    } catch (err: any) {
      setSnack('Failed: ' + err.message);
    }
  };

  const TYPE_ICON: Record<string, string> = {
    checkout: 'package-up',
    approval: 'check-decagram',
    maintenance: 'wrench',
    overdue: 'clock-alert',
    reservation: 'calendar-check',
    low_stock: 'alert',
  };

  if (loading) return <LoadingView message="Loading notifications…" />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  const unread = notifications.filter((n) => !n.read).length;

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.card, !item.read && styles.unreadCard, Shadow.sm]}
      onPress={() => !item.read && markRead(item.id)}
    >
      <View style={[styles.iconWrap, { backgroundColor: (item.read ? Colors.grey200 : Colors.primary + '20') }]}>
        <MaterialCommunityIcons
          name={(TYPE_ICON[item.type] ?? 'bell') as any}
          size={20}
          color={item.read ? Colors.textDisabled : Colors.primary}
        />
      </View>
      <View style={styles.notifContent}>
        <Text style={[styles.title, !item.read && { color: Colors.textPrimary }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.time}>{dayjs(item.createdAt).fromNow()}</Text>
      </View>
        {!item.read && <View style={styles.unreadDot} />}
      <TouchableOpacity onPress={() => deleteNotif(item.id)} style={styles.deleteBtn}>
        <MaterialCommunityIcons name="close" size={14} color={Colors.textDisabled} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      {notifications.length > 0 && (
        <View style={styles.toolbar}>
          <Text style={styles.unreadCount}>{unread} unread</Text>
          <Button compact onPress={markAllRead} textColor={Colors.primary}>Mark all read</Button>
          <Button compact onPress={() => setConfirmClear(true)} textColor={Colors.error}>Clear all</Button>
        </View>
      )}
      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        ListEmptyComponent={<EmptyState icon="bell-off" title="No notifications" />}
      />
      <ConfirmDialog
        visible={confirmClear}
        title="Clear All Notifications"
        message="This will permanently delete all notifications."
        confirmLabel="Clear All"
        destructive
        onConfirm={clearAll}
        onCancel={() => setConfirmClear(false)}
      />
      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>{snack}</Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  toolbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  unreadCount: { flex: 1, fontSize: 13, color: Colors.textSecondary },
  list: { padding: Spacing.lg, gap: 8, paddingBottom: 60 },
  card: { backgroundColor: Colors.surface, borderRadius: 12, padding: Spacing.md, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  unreadCard: { backgroundColor: '#EEF2FF', borderLeftWidth: 3, borderLeftColor: Colors.primary },
  iconWrap: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  notifContent: { flex: 1 },
  title: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  message: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },
  time: { fontSize: 11, color: Colors.textDisabled, marginTop: 2 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginTop: 2 },
  deleteBtn: { padding: 4 },
});
