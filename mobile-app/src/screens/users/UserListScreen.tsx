import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, FAB, Chip, Snackbar, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { userService } from '../../services/api/userService';
import { UserProfile } from '../../types';
import { LoadingView } from '../../components/LoadingView';
import { EmptyState } from '../../components/EmptyState';
import { ErrorView } from '../../components/ErrorView';
import { SearchBar } from '../../components/SearchBar';
import { Colors, Spacing, Shadow } from '../../theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Role = UserProfile['role'] | 'all';
const ROLES: Role[] = ['all', 'engineer', 'admin', 'technician'];
const ROLE_COLORS: Record<string, string> = {
  admin: Colors.error,
  'lab-manager': Colors.secondary,
  engineer: Colors.primary,
  technician: Colors.warning,
  guest: Colors.grey500,
};

export function UserListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filtered, setFiltered] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState<Role>('all');
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await userService.getUsers();
      setUsers(data);
      applyFilters(data, query, role);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const applyFilters = (data: UserProfile[], q: string, r: Role) => {
    let result = data;
    if (r !== 'all') result = result.filter((u) => u.role === r);
    if (q.trim()) {
      const lower = q.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(lower) ||
          u.email.toLowerCase().includes(lower) ||
          u.department?.toLowerCase().includes(lower),
      );
    }
    setFiltered(result);
  };

  useEffect(() => { load(); }, [load]);
  useEffect(() => { applyFilters(users, query, role); }, [users, query, role]);

  if (loading) return <LoadingView message="Loading users…" />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const engineers = users.filter((u) => u.role === 'engineer').length;
  const admins = users.filter((u) => u.role === 'admin').length;
  const technicians = users.filter((u) => u.role === 'technician').length;

  const renderItem = ({ item }: { item: UserProfile }) => (
    <View style={[styles.card, Shadow.sm]}>
      <Avatar.Text
        size={42}
        label={item.name?.[0]?.toUpperCase() ?? '?'}
        style={{ backgroundColor: ROLE_COLORS[item.role] ?? Colors.grey400 }}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
        {item.department ? <Text style={styles.dept}>{item.department}</Text> : null}
      </View>
      <View style={styles.rightCol}>
        <View style={[styles.roleBadge, { backgroundColor: (ROLE_COLORS[item.role] ?? Colors.grey400) + '18', borderColor: (ROLE_COLORS[item.role] ?? Colors.grey400) + '40' }]}>
          <Text style={[styles.roleText, { color: ROLE_COLORS[item.role] ?? Colors.grey600 }]}>{item.role}</Text>
        </View>
        <Text style={[styles.statusText, { color: item.isActive ? Colors.success : Colors.error }]}>
          {item.isActive ? 'Active' : 'Inactive'}
        </Text>
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={() => navigation.navigate('UserDetail', { id: item.id })}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('UserDetail', { id: item.id })}>
            <Text style={[styles.deactivateBtnText, { color: item.isActive ? Colors.textSecondary : Colors.success }]}>
              {item.isActive ? 'Deactivate' : 'Activate'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      {/* Stat Row */}
      <View style={styles.statRow}>
        <View style={[styles.statItem, { borderTopColor: Colors.primary }]}>
          <Text style={styles.statLabel}>TOTAL</Text>
          <Text style={[styles.statValue, { color: Colors.primary }]}>{totalUsers}</Text>
        </View>
        <View style={[styles.statItem, { borderTopColor: Colors.success }]}>
          <Text style={styles.statLabel}>ACTIVE</Text>
          <Text style={[styles.statValue, { color: Colors.success }]}>{activeUsers}</Text>
        </View>
        <View style={[styles.statItem, { borderTopColor: Colors.error }]}>
          <Text style={styles.statLabel}>ADMINS</Text>
          <Text style={[styles.statValue, { color: Colors.error }]}>{admins}</Text>
        </View>
        <View style={[styles.statItem, { borderTopColor: Colors.info }]}>
          <Text style={styles.statLabel}>ENGINEERS</Text>
          <Text style={[styles.statValue, { color: Colors.info }]}>{engineers}</Text>
        </View>
        <View style={[styles.statItem, { borderTopColor: Colors.warning }]}>
          <Text style={styles.statLabel}>TECHS</Text>
          <Text style={[styles.statValue, { color: Colors.warning }]}>{technicians}</Text>
        </View>
      </View>

      <View style={styles.topBar}>
        <SearchBar placeholder="Search users…" onSearch={setQuery} />
      </View>
      <View style={styles.chipRow}>
        {ROLES.map((r) => (
          <Chip
            key={r}
            selected={role === r}
            onPress={() => setRole(r)}
            style={styles.chip}
            selectedColor={Colors.primary}
            compact
          >
            {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
          </Chip>
        ))}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(u) => u.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        ListEmptyComponent={<EmptyState icon="account-off" title="No users found" />}
        ListHeaderComponent={<Text style={styles.count}>{filtered.length} user{filtered.length !== 1 ? 's' : ''}</Text>}
      />
      <FAB
        icon="account-plus"
        style={styles.fab}
        onPress={() => navigation.navigate('UserForm', {})}
        color={Colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  statRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 3,
  },
  statLabel: { fontSize: 9, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.3 },
  statValue: { fontSize: 20, fontWeight: '700' },
  topBar: { padding: Spacing.lg, paddingBottom: Spacing.sm, backgroundColor: Colors.surface },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, paddingVertical: 6, gap: 8, backgroundColor: Colors.surface },
  chip: { backgroundColor: Colors.grey100 },
  list: { padding: Spacing.lg, gap: 10, paddingBottom: 100 },
  count: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  email: { fontSize: 11, color: Colors.textSecondary },
  dept: { fontSize: 11, color: Colors.textDisabled, marginTop: 1 },
  rightCol: { alignItems: 'flex-end', gap: 4 },
  roleBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  roleText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  statusText: { fontSize: 11, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 8 },
  editBtnText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  deactivateBtnText: { fontSize: 12, fontWeight: '600' },
  fab: { position: 'absolute', right: Spacing.xl, bottom: Spacing.xl, backgroundColor: Colors.primary },
});
