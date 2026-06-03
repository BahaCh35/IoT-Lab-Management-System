import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, Divider, Menu, Snackbar, Avatar, Switch } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { userService } from '../../services/api/userService';
import { UserProfile, ActivityLog } from '../../types';
import { LoadingView } from '../../components/LoadingView';
import { ErrorView } from '../../components/ErrorView';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Colors, Spacing, Shadow } from '../../theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

type RouteProps = RouteProp<RootStackParamList, 'UserDetail'>;

export function UserDetailScreen() {
  const { params } = useRoute<RouteProps>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState(false);
  const [snack, setSnack] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const [userData, activityData] = await Promise.all([
        userService.getUserById(params.id),
        userService.getUserActivity(params.id),
      ]);
      setUser(userData);
      setActivity(activityData.slice(0, 20));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async () => {
    setConfirmToggle(false);
    try {
      const updated = user?.isActive
        ? await userService.deactivateUser(params.id)
        : await userService.activateUser(params.id);
      setUser(updated);
      setSnack(`User ${updated.isActive ? 'activated' : 'deactivated'}`);
    } catch (err: any) {
      setSnack('Failed: ' + err.message);
    }
  };

  if (loading) return <LoadingView />;
  if (error || !user) return <ErrorView message={error} onRetry={load} />;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Profile card */}
      <View style={[styles.card, Shadow.sm]}>
        <View style={styles.profileRow}>
          <Avatar.Text
            size={60}
            label={user.name?.[0]?.toUpperCase() ?? '?'}
            style={{ backgroundColor: Colors.primary }}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user.role}</Text>
            </View>
          </View>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity onPress={() => setMenuVisible(true)}>
                <MaterialCommunityIcons name="dots-vertical" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            }
          >
            <Menu.Item
              leadingIcon="pencil"
              onPress={() => { setMenuVisible(false); navigation.navigate('UserForm', { id: user.id }); }}
              title="Edit"
            />
            <Menu.Item
              leadingIcon={user.isActive ? 'account-off' : 'account-check'}
              onPress={() => { setMenuVisible(false); setConfirmToggle(true); }}
              title={user.isActive ? 'Deactivate' : 'Activate'}
            />
          </Menu>
        </View>

        <Divider style={{ marginVertical: 8 }} />

        <View style={styles.detailGrid}>
          {[
            { label: 'Department', value: user.department },
            { label: 'Phone', value: user.phone },
            { label: 'Joined', value: user.createdAt ? dayjs(user.createdAt).format('MMM D, YYYY') : undefined },
            { label: 'Status', value: user.isActive ? 'Active' : 'Inactive' },
          ].map(({ label, value }) =>
            value ? (
              <View key={label} style={styles.detailItem}>
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={[styles.detailValue, label === 'Status' && { color: user.isActive ? Colors.success : Colors.error }]}>
                  {value}
                </Text>
              </View>
            ) : null,
          )}
        </View>
      </View>

      {/* Recent activity */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {activity.length === 0 ? (
          <Text style={styles.noActivity}>No activity recorded</Text>
        ) : (
          activity.map((log) => (
            <View key={log.id} style={styles.activityRow}>
              <View style={styles.activityDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.activityAction}>{log.action}</Text>
                <Text style={styles.activityTime}>{dayjs(log.timestamp).fromNow()}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <ConfirmDialog
        visible={confirmToggle}
        title={user.isActive ? 'Deactivate User' : 'Activate User'}
        message={`Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} ${user.name}?`}
        confirmLabel={user.isActive ? 'Deactivate' : 'Activate'}
        destructive={user.isActive}
        onConfirm={toggleActive}
        onCancel={() => setConfirmToggle(false)}
      />

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>{snack}</Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: 12, paddingBottom: 40 },
  card: { backgroundColor: Colors.surface, borderRadius: 12, padding: Spacing.lg, gap: 10 },
  profileRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  profileInfo: { flex: 1 },
  name: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  email: { fontSize: 13, color: Colors.textSecondary },
  roleBadge: {
    marginTop: 4,
    backgroundColor: Colors.primary + '20',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  roleText: { fontSize: 10, fontWeight: '700', color: Colors.primaryDark, textTransform: 'uppercase' },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  detailItem: { minWidth: '40%' },
  detailLabel: { fontSize: 11, color: Colors.textDisabled, textTransform: 'uppercase', fontWeight: '600' },
  detailValue: { fontSize: 14, color: Colors.textPrimary, fontWeight: '500', marginTop: 2 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6 },
  noActivity: { fontSize: 13, color: Colors.textDisabled, textAlign: 'center', padding: 16 },
  activityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 4 },
  activityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginTop: 4 },
  activityAction: { fontSize: 13, color: Colors.textPrimary },
  activityTime: { fontSize: 11, color: Colors.textDisabled },
});
