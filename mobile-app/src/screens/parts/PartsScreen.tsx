import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Text, Chip, Button, Snackbar, Modal, Portal, TextInput } from 'react-native-paper';
import { partsService } from '../../services/api/maintenanceService';
import { PartsRequest } from '../../types';
import { StatusChip } from '../../components/StatusChip';
import { LoadingView } from '../../components/LoadingView';
import { EmptyState } from '../../components/EmptyState';
import { ErrorView } from '../../components/ErrorView';
import { Colors, Spacing, Shadow } from '../../theme';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export function PartsScreen() {
  const [requests, setRequests] = useState<PartsRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'arrived'>('pending');
  const [snack, setSnack] = useState('');
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const filtered = filter === 'all' ? requests : requests.filter((r) => r.status === filter);

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await partsService.getRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = async (id: string) => {
    try {
      await partsService.approveRequest(id);
      setSnack('Approved');
      load();
    } catch (err: any) { setSnack('Failed: ' + err.message); }
  };

  const reject = async () => {
    if (!rejectModal) return;
    try {
      await partsService.rejectRequest(rejectModal, rejectReason);
      setRejectModal(null);
      setRejectReason('');
      setSnack('Rejected');
      load();
    } catch (err: any) { setSnack('Failed: ' + err.message); }
  };

  const markArrived = async (id: string) => {
    try {
      await partsService.markArrived(id);
      setSnack('Marked as arrived');
      load();
    } catch (err: any) { setSnack('Failed: ' + err.message); }
  };

  if (loading) return <LoadingView message="Loading parts requests…" />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  const FILTERS = ['all', 'pending', 'approved', 'rejected', 'arrived'] as const;

  const renderItem = ({ item }: { item: PartsRequest }) => (
    <View style={[styles.card, Shadow.sm]}>
      <View style={styles.cardHeader}>
        <Text style={styles.partName} numberOfLines={1}>{item.partName}</Text>
        <StatusChip status={item.status} compact />
      </View>
      <Text style={styles.description} numberOfLines={2}>{item.reason}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>Qty: {item.quantity} · By: {item.technicianName}</Text>
        <Text style={styles.meta}>{dayjs(item.requestedDate).fromNow()}</Text>
      </View>
      {item.status === 'pending' && (
        <View style={styles.actions}>
          <Button mode="contained" onPress={() => approve(item.id)} compact buttonColor={Colors.success} style={styles.actionBtn}>Approve</Button>
          <Button mode="outlined" onPress={() => setRejectModal(item.id)} compact textColor={Colors.error} style={styles.actionBtn}>Reject</Button>
        </View>
      )}
      {item.status === 'approved' && (
        <Button mode="contained" onPress={() => markArrived(item.id)} compact buttonColor={Colors.info} style={styles.actionBtn}>Mark Arrived</Button>
      )}
    </View>
  );

  return (
    <View style={styles.root}>
      <View style={styles.chipRow}>
        {(FILTERS as unknown as string[]).map((f) => (
          <Chip
            key={f}
            selected={filter === f}
            onPress={() => setFilter(f as any)}
            style={styles.chip}
            selectedColor={Colors.primary}
            compact
          >
            {(f as string).charAt(0).toUpperCase() + (f as string).slice(1)}
          </Chip>
        ))}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        ListEmptyComponent={<EmptyState icon="cog-outline" title="No parts requests" />}
        ListHeaderComponent={<Text style={styles.count}>{filtered.length} request{filtered.length !== 1 ? 's' : ''}</Text>}
      />
      <Portal>
        <Modal visible={!!rejectModal} onDismiss={() => setRejectModal(null)} contentContainerStyle={styles.modal}>
          <Text style={styles.modalTitle}>Reject Request</Text>
          <TextInput label="Reason" value={rejectReason} onChangeText={setRejectReason} mode="outlined" multiline style={{ marginTop: 12 }} />
          <View style={styles.modalActions}>
            <Button onPress={() => setRejectModal(null)}>Cancel</Button>
            <Button mode="contained" onPress={reject} buttonColor={Colors.error}>Reject</Button>
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
  partName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, flex: 1, marginRight: 8 },
  description: { fontSize: 13, color: Colors.textSecondary },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  meta: { fontSize: 11, color: Colors.textDisabled },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, borderRadius: 8 },
  modal: { backgroundColor: Colors.surface, margin: 24, borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 16 },
});
