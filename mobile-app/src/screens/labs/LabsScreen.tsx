import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Switch, RefreshControl } from 'react-native';
import { Text, FAB, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { labService } from '../../services/api/labService';
import { Lab } from '../../types';
import { LoadingView } from '../../components/LoadingView';
import { EmptyState } from '../../components/EmptyState';
import { ErrorView } from '../../components/ErrorView';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Colors, Spacing, Shadow } from '../../theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';

export function LabsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Lab | null>(null);
  const [snack, setSnack] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await labService.getLabs();
      setLabs(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setConfirmDelete(null);
    try {
      await labService.deleteLab(confirmDelete.id);
      setLabs((prev) => prev.filter((l) => l.id !== confirmDelete.id));
      setSnack('Lab deleted');
    } catch (err: any) {
      setSnack('Failed: ' + err.message);
    }
  };

  if (loading) return <LoadingView message="Loading labs…" />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  const renderItem = ({ item }: { item: Lab }) => (
    <View style={[styles.card, Shadow.sm]}>
      {/* Row: Name + meta */}
      <View style={styles.rowMain}>
        <View style={styles.infoCol}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>Floor {item.floor} · {item.capacity} people</Text>
          {/* Equipment chips */}
          {item.equipment?.length > 0 && (
            <View style={styles.chips}>
              {item.equipment.slice(0, 4).map((eq) => (
                <View key={eq} style={styles.chip}>
                  <Text style={styles.chipText}>{eq}</Text>
                </View>
              ))}
              {item.equipment.length > 4 && (
                <Text style={styles.moreChips}>+{item.equipment.length - 4}</Text>
              )}
            </View>
          )}
        </View>

        {/* Status + Actions */}
        <View style={styles.actionsCol}>
          <View style={styles.statusRow}>
            <Switch
              value={item.isActive}
              onValueChange={() => {}}
              trackColor={{ false: Colors.grey300, true: Colors.success + '60' }}
              thumbColor={item.isActive ? Colors.success : Colors.grey400}
              style={styles.switch}
            />
            <Text style={[styles.statusText, { color: item.isActive ? Colors.success : Colors.textDisabled }]}>
              {item.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
          <View style={styles.btnRow}>
            <TouchableOpacity onPress={() => navigation.navigate('LabForm', { id: item.id })} style={styles.editBtn}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setConfirmDelete(item)} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={labs}
        keyExtractor={(l) => l.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
        ListHeaderComponent={
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>Labs Management</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => navigation.navigate('LabForm', {})}
            >
              <Text style={styles.addBtnText}>+ Add Lab</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={<EmptyState icon="flask-empty" title="No labs configured" />}
      />
      <ConfirmDialog
        visible={!!confirmDelete}
        title="Delete Lab"
        message={`Delete "${confirmDelete?.name}"?`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>{snack}</Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.lg, gap: 10, paddingBottom: 40 },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  pageTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  addBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addBtnText: { fontSize: 13, fontWeight: '700', color: Colors.white },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
  },
  rowMain: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  infoCol: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  meta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  chip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: Colors.surface,
  },
  chipText: { fontSize: 11, color: Colors.textSecondary },
  moreChips: { fontSize: 11, color: Colors.textDisabled, alignSelf: 'center' },
  actionsCol: { alignItems: 'flex-end', gap: 8 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  switch: { transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] },
  statusText: { fontSize: 12, fontWeight: '600' },
  btnRow: { flexDirection: 'row', gap: 10 },
  editBtn: { paddingVertical: 4, paddingHorizontal: 2 },
  editBtnText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  deleteBtn: { paddingVertical: 4, paddingHorizontal: 2 },
  deleteBtnText: { fontSize: 13, color: Colors.error, fontWeight: '600' },
});
