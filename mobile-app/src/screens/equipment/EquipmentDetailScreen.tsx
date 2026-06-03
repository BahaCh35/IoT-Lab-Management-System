import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, Divider, Menu, Snackbar } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { equipmentService } from '../../services/api/equipmentService';
import { Equipment } from '../../types';
import { StatusChip } from '../../components/StatusChip';
import { LoadingView } from '../../components/LoadingView';
import { ErrorView } from '../../components/ErrorView';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Colors, Spacing, Shadow } from '../../theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type RouteProps = RouteProp<RootStackParamList, 'EquipmentDetail'>;

export function EquipmentDetailScreen() {
  const { params } = useRoute<RouteProps>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [snack, setSnack] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await equipmentService.getEquipmentById(params.id);
      setEquipment(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    setConfirmDelete(false);
    try {
      await equipmentService.deleteEquipment(params.id);
      navigation.goBack();
    } catch (err: any) {
      setSnack('Delete failed: ' + err.message);
    }
  };

  if (loading) return <LoadingView />;
  if (error || !equipment) return <ErrorView message={error} onRetry={load} />;

  const specEntries = Object.entries(equipment.specifications ?? {});
  const totalUnits = equipment.quantity ?? 1;
  const availUnits = equipment.availableCount ?? totalUnits;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Header row */}
      <View style={[styles.headerCard, Shadow.sm]}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.name}>{equipment.name}</Text>
            <Text style={styles.category}>{equipment.category}</Text>
          </View>
          <View style={styles.headerActions}>
            <StatusChip status={equipment.status} />
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuBtn}>
                  <MaterialCommunityIcons name="dots-vertical" size={22} color={Colors.textSecondary} />
                </TouchableOpacity>
              }
            >
              <Menu.Item
                leadingIcon="pencil"
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate('EquipmentForm', { id: equipment.id });
                }}
                title="Edit"
              />
              <Menu.Item
                leadingIcon="delete"
                onPress={() => { setMenuVisible(false); setConfirmDelete(true); }}
                title="Delete"
                titleStyle={{ color: Colors.error }}
              />
            </Menu>
          </View>
        </View>

        {/* Unit count */}
        <View style={styles.unitRow}>
          <MaterialCommunityIcons name="package-variant-closed" size={14} color={Colors.textSecondary} />
          <Text style={styles.unitText}>
            {availUnits}/{totalUnits} unit{totalUnits !== 1 ? 's' : ''} available
          </Text>
        </View>

        {equipment.description ? (
          <Text style={styles.description}>{equipment.description}</Text>
        ) : null}
      </View>

      {/* Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.detailGrid}>
          {[
            { label: 'Building', value: equipment.location?.building },
            { label: 'Room', value: equipment.location?.room },
            { label: 'Cabinet', value: equipment.location?.cabinet },
            { label: 'Drawer', value: equipment.location?.drawer },
          ].map(({ label, value }) =>
            value ? (
              <View key={label} style={styles.detailItem}>
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={styles.detailValue}>{value}</Text>
              </View>
            ) : null,
          )}
        </View>
      </View>

      {/* Specifications */}
      {specEntries.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          {specEntries.map(([k, v]) => (
            <View key={k} style={styles.specRow}>
              <Text style={styles.specKey}>{k}</Text>
              <Text style={styles.specValue}>{v}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Usage</Text>
        <View style={styles.detailGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Total Checkouts</Text>
            <Text style={styles.detailValue}>{equipment.usageCount ?? 0}</Text>
          </View>
          {equipment.lastUsedBy && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Last Used By</Text>
              <Text style={styles.detailValue}>{equipment.lastUsedBy}</Text>
            </View>
          )}
          {equipment.acquisitionDate && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Acquired</Text>
              <Text style={styles.detailValue}>{equipment.acquisitionDate}</Text>
            </View>
          )}
        </View>
      </View>

      <ConfirmDialog
        visible={confirmDelete}
        title="Delete Equipment"
        message={`Are you sure you want to delete "${equipment.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={4000}>
        {snack}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: 12, paddingBottom: 40 },
  headerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    gap: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  headerLeft: { flex: 1 },
  name: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  category: { fontSize: 13, color: Colors.textSecondary, textTransform: 'capitalize', marginTop: 2 },
  headerActions: { flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuBtn: { padding: 4 },
  unitRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  unitText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  description: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  detailItem: { minWidth: '40%' },
  detailLabel: { fontSize: 11, color: Colors.textDisabled, textTransform: 'uppercase', fontWeight: '600' },
  detailValue: { fontSize: 14, color: Colors.textPrimary, fontWeight: '500', marginTop: 2 },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  specKey: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  specValue: { fontSize: 13, color: Colors.textPrimary, fontWeight: '500', flex: 1, textAlign: 'right' },
});
