import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Text, Searchbar, Snackbar } from 'react-native-paper';
import { approvalService } from '../../services/api/approvalService';
import { ActivityLog } from '../../types';
import { LoadingView } from '../../components/LoadingView';
import { EmptyState } from '../../components/EmptyState';
import { ErrorView } from '../../components/ErrorView';
import { Colors, Spacing, Shadow } from '../../theme';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const ACTION_BADGE: Record<string, { bg: string; text: string }> = {
  checkout:   { bg: Colors.warning  + '20', text: Colors.warningDark },
  checkin:    { bg: Colors.success  + '20', text: Colors.successDark },
  approve:    { bg: Colors.success  + '20', text: Colors.successDark },
  reject:     { bg: Colors.error    + '20', text: Colors.errorDark },
  create:     { bg: Colors.info     + '20', text: Colors.infoDark },
  update:     { bg: Colors.primary  + '20', text: Colors.primaryDark },
  delete:     { bg: Colors.error    + '20', text: Colors.errorDark },
  login:      { bg: Colors.grey200,         text: Colors.grey600 },
  logout:     { bg: Colors.grey200,         text: Colors.grey600 },
  approval:   { bg: Colors.primary  + '20', text: Colors.primaryDark },
  LOGIN:      { bg: Colors.grey200,         text: Colors.grey600 },
};

export function ActivityLogScreen() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filtered, setFiltered] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [snack, setSnack] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await approvalService.getActivityLog(200);
      setLogs(data);
      setFiltered(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(logs);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(logs.filter((l) =>
      l.action?.toLowerCase().includes(q) ||
      l.entityType?.toLowerCase().includes(q) ||
      l.userId?.toLowerCase().includes(q)
    ));
  }, [search, logs]);

  if (loading) return <LoadingView message="Loading activity log…" />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  const total = logs.length;
  const approved = logs.filter((l) => l.action === 'approve' || l.action === 'approved').length;
  const rejected = logs.filter((l) => l.action === 'reject' || l.action === 'rejected').length;
  const created  = logs.filter((l) => l.action === 'create'  || l.action === 'created').length;

  const getBadge = (action: string) =>
    ACTION_BADGE[action] ?? ACTION_BADGE[action.toLowerCase()] ?? { bg: Colors.grey200, text: Colors.grey600 };

  const renderItem = ({ item }: { item: ActivityLog }) => {
    const badge = getBadge(item.action);
    return (
      <View style={[styles.row, Shadow.sm]}>
        <Text style={styles.timestamp}>
          {dayjs(item.timestamp).format('MM/DD HH:mm')}
        </Text>
        <View style={[styles.typeBadge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.typeText, { color: badge.text }]}>
            {item.action.toUpperCase()}
          </Text>
        </View>
        <View style={styles.logInfo}>
          <Text style={styles.userId} numberOfLines={1}>User {item.userId ?? 'System'}</Text>
          {item.entityType ? (
            <Text style={styles.resource} numberOfLines={1}>
              {item.entityType} — {item.entityId}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      {/* Stat Row */}
      <View style={styles.statRow}>
        <View style={[styles.statItem, { borderTopColor: Colors.primary }]}>
          <Text style={styles.statLabel}>TOTAL ACTIONS</Text>
          <Text style={[styles.statValue, { color: Colors.primary }]}>{total}</Text>
        </View>
        <View style={[styles.statItem, { borderTopColor: Colors.success }]}>
          <Text style={styles.statLabel}>APPROVED</Text>
          <Text style={[styles.statValue, { color: Colors.success }]}>{approved}</Text>
        </View>
        <View style={[styles.statItem, { borderTopColor: Colors.error }]}>
          <Text style={styles.statLabel}>REJECTED</Text>
          <Text style={[styles.statValue, { color: Colors.error }]}>{rejected}</Text>
        </View>
        <View style={[styles.statItem, { borderTopColor: Colors.info }]}>
          <Text style={styles.statLabel}>CREATED</Text>
          <Text style={[styles.statValue, { color: Colors.info }]}>{created}</Text>
        </View>
      </View>

      <Searchbar
        placeholder="Search logs…"
        value={search}
        onChangeText={setSearch}
        style={styles.searchBar}
      />
      <FlatList
        data={filtered}
        keyExtractor={(l) => l.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        ListEmptyComponent={<EmptyState icon="history" title="No activity logs" />}
        ListHeaderComponent={<Text style={styles.count}>{filtered.length} entries</Text>}
      />
      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>{snack}</Snackbar>
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
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderTopWidth: 3 },
  statLabel: { fontSize: 9, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.3, textAlign: 'center' },
  statValue: { fontSize: 20, fontWeight: '700' },
  searchBar: { margin: Spacing.lg, marginBottom: Spacing.sm, borderRadius: 10 },
  list: { paddingHorizontal: Spacing.lg, gap: 8, paddingBottom: 60, paddingTop: 0 },
  count: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  row: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timestamp: { fontSize: 10, color: Colors.textDisabled, width: 62, flexShrink: 0 },
  typeBadge: {
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
    minWidth: 54,
    alignItems: 'center',
    flexShrink: 0,
  },
  typeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  logInfo: { flex: 1, minWidth: 0 },
  userId: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary },
  resource: { fontSize: 11, color: Colors.textSecondary },
});
