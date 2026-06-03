import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Text, Chip, Button, Snackbar, Modal, Portal, TextInput } from 'react-native-paper';
import { reservationService } from '../../services/api/reservationService';
import { Reservation } from '../../types';
import { StatusChip } from '../../components/StatusChip';
import { LoadingView } from '../../components/LoadingView';
import { EmptyState } from '../../components/EmptyState';
import { ErrorView } from '../../components/ErrorView';
import { Colors, Spacing, Shadow } from '../../theme';
import dayjs from 'dayjs';

type TabType = 'equipment' | 'lab' | 'room';
const TABS: { key: TabType; label: string }[] = [
  { key: 'equipment', label: 'Equipment' },
  { key: 'lab', label: 'Labs' },
  { key: 'room', label: 'Rooms' },
];

export function ReservationsScreen() {
  const [tab, setTab] = useState<TabType>('equipment');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [snack, setSnack] = useState('');
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      let data: any[] = [];
      if (tab === 'equipment') data = await reservationService.getEquipmentReservations();
      else if (tab === 'lab') data = await reservationService.getLabReservations();
      else data = await reservationService.getMeetingRoomReservations();
      setItems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tab]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  const approve = async (id: string) => {
    try {
      if (tab === 'equipment') await reservationService.approveEquipmentReservation(id);
      else if (tab === 'lab') await reservationService.approveLabReservation(id);
      else await reservationService.approveMeetingRoomReservation(id);
      setSnack('Approved');
      load();
    } catch (err: any) { setSnack('Failed: ' + err.message); }
  };

  const reject = async () => {
    if (!rejectModal) return;
    try {
      if (tab === 'equipment') await reservationService.rejectEquipmentReservation(rejectModal, rejectReason);
      else if (tab === 'lab') await reservationService.rejectLabReservation(rejectModal, rejectReason);
      else await reservationService.rejectMeetingRoomReservation(rejectModal, rejectReason);
      setRejectModal(null);
      setRejectReason('');
      setSnack('Rejected');
      load();
    } catch (err: any) { setSnack('Failed: ' + err.message); }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.card, Shadow.sm]}>
      <View style={styles.cardHeader}>
        <Text style={styles.title} numberOfLines={1}>
          {item.equipment || item.purpose || item.title || 'Reservation'}
        </Text>
        <StatusChip status={item.status} compact />
      </View>
      <Text style={styles.meta}>
        By {item.userName || item.user?.name || 'Unknown'} ·{' '}
        {dayjs(item.startDate || item.date).format('MMM D, YYYY')}
      </Text>
      {item.status === 'pending' && (
        <View style={styles.actions}>
          <Button mode="contained" onPress={() => approve(item.id)} compact buttonColor={Colors.success} style={styles.actionBtn}>Approve</Button>
          <Button mode="outlined" onPress={() => setRejectModal(item.id)} compact textColor={Colors.error} style={styles.actionBtn}>Reject</Button>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.root}>
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Chip
            key={t.key}
            selected={tab === t.key}
            onPress={() => setTab(t.key)}
            style={styles.chip}
            selectedColor={Colors.primary}
          >
            {t.label}
          </Chip>
        ))}
      </View>

      {loading ? (
        <LoadingView />
      ) : error ? (
        <ErrorView message={error} onRetry={load} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          ListEmptyComponent={<EmptyState icon="calendar-blank" title="No reservations" />}
        />
      )}

      <Portal>
        <Modal visible={!!rejectModal} onDismiss={() => setRejectModal(null)} contentContainerStyle={styles.modal}>
          <Text style={styles.modalTitle}>Reject Reservation</Text>
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
  tabs: { flexDirection: 'row', gap: 8, padding: Spacing.lg, backgroundColor: Colors.surface },
  chip: { backgroundColor: Colors.grey100 },
  list: { padding: Spacing.lg, gap: 10, paddingBottom: 60 },
  card: { backgroundColor: Colors.surface, borderRadius: 12, padding: Spacing.lg, gap: 6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, flex: 1, marginRight: 8 },
  meta: { fontSize: 12, color: Colors.textSecondary },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, borderRadius: 8 },
  modal: { backgroundColor: Colors.surface, margin: 24, borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 16 },
});
