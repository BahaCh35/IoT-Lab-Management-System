import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Chip, Button, Snackbar, Modal, Portal, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { maintenanceService } from '../../services/api/maintenanceService';
import { MaintenanceRequest } from '../../types';
import { StatusChip } from '../../components/StatusChip';
import { LoadingView } from '../../components/LoadingView';
import { EmptyState } from '../../components/EmptyState';
import { ErrorView } from '../../components/ErrorView';
import { Colors, Spacing, Shadow } from '../../theme';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

type Filter = 'all' | 'pending' | 'in-progress' | 'completed';

export function MaintenanceScreen() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [filtered, setFiltered] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('pending');
  const [snack, setSnack] = useState('');
  const [statusModal, setStatusModal] = useState<{ item: MaintenanceRequest; status: MaintenanceRequest['status'] } | null>(null);
  const [notes, setNotes] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await maintenanceService.getRequests();
      setRequests(data);
      applyFilter(data, filter);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const applyFilter = (data: MaintenanceRequest[], f: Filter) => {
    setFiltered(f === 'all' ? data : data.filter((r) => r.status === f));
  };

  useEffect(() => { load(); }, [load]);
  useEffect(() => { applyFilter(requests, filter); }, [requests, filter]);

  const updateStatus = async () => {
    if (!statusModal) return;
    try {
      await maintenanceService.updateStatus(statusModal.item.id, statusModal.status, notes);
      setStatusModal(null);
      setNotes('');
      setSnack('Status updated');
      load();
    } catch (err: any) {
      setSnack('Failed: ' + err.message);
    }
  };

  if (loading) return <LoadingView message="Loading maintenance…" />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  const PRIORITY_COLORS: Record<string, string> = {
    high: Colors.error,
    medium: Colors.warning,
    low: Colors.success,
  };

  const renderItem = ({ item }: { item: MaintenanceRequest }) => (
    <View style={[styles.card, Shadow.sm]}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLORS[item.priority] }]}>
            <Text style={styles.priorityText}>{item.priority}</Text>
          </View>
          <Text style={styles.eqName} numberOfLines={1}>{item.equipmentName}</Text>
        </View>
        <StatusChip status={item.status} compact />
      </View>
      <Text style={styles.problem} numberOfLines={2}>{item.problemDescription}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>By {item.reportedBy?.name}</Text>
        <Text style={styles.meta}>{dayjs(item.reportedDate).fromNow()}</Text>
      </View>
      {item.status === 'pending' && (
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={() => setStatusModal({ item, status: 'in-progress' })}
            compact
            buttonColor={Colors.primary}
            style={styles.actionBtn}
          >
            Start
          </Button>
          <Button
            mode="outlined"
            onPress={() => setStatusModal({ item, status: 'completed' })}
            compact
            style={styles.actionBtn}
          >
            Mark Done
          </Button>
        </View>
      )}
      {item.status === 'in-progress' && (
        <Button
          mode="contained"
          onPress={() => setStatusModal({ item, status: 'completed' })}
          compact
          buttonColor={Colors.success}
          style={styles.actionBtn}
        >
          Mark Completed
        </Button>
      )}
    </View>
  );

  return (
    <View style={styles.root}>
      <View style={styles.chipRow}>
        {(['all', 'pending', 'in-progress', 'completed'] as Filter[]).map((f) => (
          <Chip
            key={f}
            selected={filter === f}
            onPress={() => setFilter(f)}
            style={styles.chip}
            selectedColor={Colors.primary}
            compact
          >
            {f === 'all' ? 'All' : f.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </Chip>
        ))}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        ListEmptyComponent={<EmptyState icon="wrench-clock" title="No maintenance requests" />}
        ListHeaderComponent={<Text style={styles.count}>{filtered.length} request{filtered.length !== 1 ? 's' : ''}</Text>}
      />
      <Portal>
        <Modal visible={!!statusModal} onDismiss={() => setStatusModal(null)} contentContainerStyle={styles.modal}>
          <Text style={styles.modalTitle}>Update Status</Text>
          <Text style={styles.modalSub}>→ {statusModal?.status}</Text>
          <TextInput label="Notes (optional)" value={notes} onChangeText={setNotes} mode="outlined" multiline style={{ marginTop: 12 }} />
          <View style={styles.modalActions}>
            <Button onPress={() => setStatusModal(null)}>Cancel</Button>
            <Button mode="contained" onPress={updateStatus} buttonColor={Colors.primary}>Update</Button>
          </View>
        </Modal>
      </Portal>
      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>{snack}</Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, paddingVertical: 6, gap: 8, backgroundColor: Colors.surface },
  chip: { backgroundColor: Colors.grey100 },
  list: { padding: Spacing.lg, gap: 10, paddingBottom: 60, paddingTop: 0 },
  count: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  card: { backgroundColor: Colors.surface, borderRadius: 12, padding: Spacing.lg, gap: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  priorityBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  priorityText: { fontSize: 9, fontWeight: '800', color: Colors.white, textTransform: 'uppercase' },
  eqName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  problem: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  meta: { fontSize: 11, color: Colors.textDisabled },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, borderRadius: 8 },
  modal: { backgroundColor: Colors.surface, margin: 24, borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  modalSub: { fontSize: 13, color: Colors.textSecondary },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 16 },
});
