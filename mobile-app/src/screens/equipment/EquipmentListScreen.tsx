import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Text, FAB, Chip, Searchbar, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { equipmentService } from '../../services/api/equipmentService';
import { Equipment } from '../../types';
import { StatusChip } from '../../components/StatusChip';
import { LoadingView } from '../../components/LoadingView';
import { EmptyState } from '../../components/EmptyState';
import { ErrorView } from '../../components/ErrorView';
import { Colors, Spacing, Shadow } from '../../theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';

const CATEGORIES: Array<Equipment['category'] | 'all'> = [
  'all', 'computer', 'microcontroller', 'sensor', 'tool', 'component', 'other',
];

export function EquipmentListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filtered, setFiltered] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Equipment['category'] | 'all'>('all');
  const [snack, setSnack] = useState('');

  const loadEquipment = useCallback(async () => {
    try {
      setError('');
      const data = await equipmentService.getEquipment();
      setEquipment(data);
      applyFilters(data, query, category);
    } catch (err: any) {
      setError(err.message || 'Failed to load equipment');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const applyFilters = useCallback(
    (data: Equipment[], q: string, cat: string) => {
      let result = data;
      if (cat !== 'all') result = result.filter((e) => e.category === cat);
      if (q.trim()) {
        const lower = q.toLowerCase();
        result = result.filter(
          (e) =>
            e.name.toLowerCase().includes(lower) ||
            e.category.toLowerCase().includes(lower) ||
            e.location?.building?.toLowerCase().includes(lower),
        );
      }
      setFiltered(result);
    },
    [],
  );

  useEffect(() => { loadEquipment(); }, [loadEquipment]);

  useEffect(() => { applyFilters(equipment, query, category); }, [equipment, query, category, applyFilters]);

  const onRefresh = () => { setRefreshing(true); loadEquipment(); };

  if (loading) return <LoadingView message="Loading equipment…" />;
  if (error) return <ErrorView message={error} onRetry={loadEquipment} />;

  const statusBorderColor = (status: Equipment['status']) => {
    switch (status) {
      case 'available': return Colors.success;
      case 'checked-out': return Colors.warning;
      case 'maintenance': return Colors.info;
      case 'damaged': return Colors.error;
      default: return Colors.grey300;
    }
  };

  const total = equipment.length;
  const available = equipment.filter((e) => e.status === 'available').length;
  const inUse = equipment.filter((e) => e.status === 'checked-out').length;
  const maintenance = equipment.filter((e) => e.status === 'maintenance').length;
  const damaged = equipment.filter((e) => e.status === 'damaged').length;

  const renderItem = ({ item }: { item: Equipment }) => (
    <TouchableOpacity
      style={[styles.card, Shadow.sm, { borderLeftColor: statusBorderColor(item.status) }]}
      onPress={() => navigation.navigate('EquipmentDetail', { id: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          {!!item.description && (
            <Text style={styles.itemDesc} numberOfLines={1}>{item.description}</Text>
          )}
        </View>
        <StatusChip status={item.status} compact />
      </View>
      <View style={styles.chipsRow}>
        <View style={styles.categoryChip}>
          <Text style={styles.categoryChipText}>{item.category}</Text>
        </View>
        {item.quantity != null && (
          <View style={styles.unitChip}>
            <Text style={styles.unitChipText}>
              {item.availableCount ?? item.quantity}/{item.quantity}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.cardFooter}>
        <MaterialCommunityIcons name="map-marker-outline" size={13} color={Colors.textSecondary} />
        <Text style={styles.location}>
          {[item.location?.building, item.location?.room].filter(Boolean).join(' › ') || 'No location'}
        </Text>
        <Text style={styles.usageCount}>{item.usageCount ?? 0} uses</Text>
      </View>
    </TouchableOpacity>
  );

  const StatItem = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <View style={[styles.statItem, { borderTopColor: color }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.root}>
      {/* Stat Row */}
      <View style={styles.statRow}>
        <StatItem label="TOTAL" value={total} color={Colors.primary} />
        <StatItem label="AVAILABLE" value={available} color={Colors.success} />
        <StatItem label="IN USE" value={inUse} color={Colors.warning} />
        <StatItem label="MAINT." value={maintenance} color={Colors.info} />
        <StatItem label="DAMAGED" value={damaged} color={Colors.error} />
      </View>

      <View style={styles.topBar}>
        <Searchbar
          placeholder="Search equipment…"
          value={query}
          onChangeText={setQuery}
          style={styles.search}
          inputStyle={{ fontSize: 14 }}
        />
      </View>

      <View style={styles.chipRow}>
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            selected={category === cat}
            onPress={() => setCategory(cat as any)}
            style={styles.chip}
            selectedColor={Colors.primary}
            compact
          >
            {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Chip>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(e) => e.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <EmptyState
            icon="laptop-off"
            title="No equipment found"
            message="Try adjusting your search or filters."
          />
        }
        ListHeaderComponent={
          <Text style={styles.count}>{filtered.length} item{filtered.length !== 1 ? 's' : ''}</Text>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('EquipmentForm', {})}
        color={Colors.white}
      />

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>
        {snack}
      </Snackbar>
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
  statLabel: { fontSize: 9, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.4 },
  statValue: { fontSize: 20, fontWeight: '700' },
  topBar: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: 0, backgroundColor: Colors.surface },
  search: { backgroundColor: Colors.grey50, borderRadius: 10 },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 6,
    gap: 8,
    backgroundColor: Colors.surface,
  },
  chip: { backgroundColor: Colors.grey100 },
  list: { padding: Spacing.lg, gap: 10, paddingBottom: 100 },
  count: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    gap: 8,
    borderLeftWidth: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  cardInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  itemDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  chipsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  categoryChip: {
    backgroundColor: Colors.primary + '12',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryChipText: { fontSize: 11, color: Colors.primary, fontWeight: '600', textTransform: 'capitalize' },
  unitChip: {
    backgroundColor: Colors.grey100,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  unitChipText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  location: { fontSize: 12, color: Colors.textSecondary, flex: 1 },
  usageCount: { fontSize: 11, color: Colors.textDisabled },
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    bottom: Spacing.xl,
    backgroundColor: Colors.primary,
  },
});
