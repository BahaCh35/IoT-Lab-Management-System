import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Button, TextInput, Chip, Snackbar, Modal, Portal } from 'react-native-paper';
import { approvalService } from '../../services/api/approvalService';
import { ApprovalRequest } from '../../types';
import { StatusChip } from '../../components/StatusChip';
import { LoadingView } from '../../components/LoadingView';
import { EmptyState } from '../../components/EmptyState';
import { ErrorView } from '../../components/ErrorView';
import { Colors, Spacing, Shadow } from '../../theme';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

type Filter = 'all' | 'pending' | 'approved' | 'rejected';
const FILTERS: Filter[] = ['all', 'pending', 'approved', 'rejected'];

export function ApprovalsScreen() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [filtered, setFiltered] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('pending');
  const [snack, setSnack] = useState('');
  const [rejectModal, setRejectModal] = useState<{ id: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await approvalService.getApprovals();
      setApprovals(data);
      applyFilter(data, filter);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const applyFilter = (data: ApprovalRequest[], f: Filter) => {
    setFiltered(f === 'all' ? data : data.filter((a) => a.status === f));
  };

  useEffect(() => { load(); }, [load]);
  useEffect(() => { applyFilter(approvals, filter); }, [approvals, filter]);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      await approvalService.approveRequest(id);
      setSnack('Request approved');
      load();
    } catch (err: any) {
      setSnack('Failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(true);
    try {
      await approvalService.rejectRequest(rejectModal.id, rejectReason);
      setRejectModal(null);
      setRejectReason('');
      setSnack('Request rejected');
      load();
    } catch (err: any) {
      setSnack('Failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingView message="Loading approvals…" />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  const PRIORITY_COLORS: Record<string, string> = {
    high: Colors.error,
    medium: Colors.warning,
    low: Colors.success,
  };

  const renderItem = ({ item }: { item: ApprovalRequest }) => (
    <View style={[styles.card, Shadow.sm]}>
      <View style={styles.cardHeader}>
        <View style={styles.typeRow}>
          <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[item.priority] ?? Colors.grey400 }]} />
          <Text style={styles.type}>{item.type.replace(/-/g, ' ')}</Text>
        </View>
        <StatusChip status={item.status} compact />
      </View>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>By {item.requester?.name ?? 'Unknown'}</Text>
        <Text style={styles.meta}>{dayjs(item.requestedDate).fromNow()}</Text>
      </View>

      {item.status === 'pending' && (
        <View style={styles.actionRow}>
          <Button
            mode="contained"
            onPress={() => handleApprove(item.id)}
            loading={actionLoading}
            style={styles.approveBtn}
            buttonColor={Colors.success}
            compact
          >
            Approve
          </Button>
          <Button
            mode="outlined"
            onPress={() => setRejectModal({ id: item.id, name: item.description })}
            textColor={Colors.error}
            style={styles.rejectBtn}
            compact
          >
            Reject
          </Button>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.root}>
      <View style={styles.chipRow}>
        {FILTERS.map((f) => (
          <Chip
            key={f}
            selected={filter === f}
            onPress={() => setFilter(f)}
            style={styles.chip}
            selectedColor={Colors.primary}
            compact
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Chip>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(a) => a.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        ListEmptyComponent={<EmptyState icon="check-all" title="No approvals" message="Nothing matches the current filter." />}
        ListHeaderComponent={<Text style={styles.count}>{filtered.length} request{filtered.length !== 1 ? 's' : ''}</Text>}
      />

      <Portal>
        <Modal
          visible={!!rejectModal}
          onDismiss={() => setRejectModal(null)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Reject Request</Text>
          <Text style={styles.modalDesc} numberOfLines={2}>{rejectModal?.name}</Text>
          <TextInput
            label="Rejection reason"
            value={rejectReason}
            onChangeText={setRejectReason}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={{ marginTop: 12 }}
          />
          <View style={styles.modalActions}>
            <Button mode="outlined" onPress={() => setRejectModal(null)}>Cancel</Button>
            <Button
              mode="contained"
              onPress={handleReject}
              loading={actionLoading}
              buttonColor={Colors.error}
            >
              Reject
            </Button>
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
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  type: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, textTransform: 'capitalize' },
  description: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  meta: { fontSize: 11, color: Colors.textDisabled },
  actionRow: { flexDirection: 'row', gap: 8 },
  approveBtn: { flex: 1, borderRadius: 8 },
  rejectBtn: { flex: 1, borderRadius: 8 },
  modal: { backgroundColor: Colors.surface, margin: 24, borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  modalDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 16 },
});
