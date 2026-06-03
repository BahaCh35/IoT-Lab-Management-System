import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, FAB, Snackbar } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { storageService } from '../../services/api/storageService';
import { StorageCabinet, StorageDrawer } from '../../types';
import { LoadingView } from '../../components/LoadingView';
import { EmptyState } from '../../components/EmptyState';
import { ErrorView } from '../../components/ErrorView';
import { Colors, Spacing, Shadow } from '../../theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type RouteProps = RouteProp<RootStackParamList, 'CabinetDetail'>;

export function CabinetDetailScreen() {
  const { params } = useRoute<RouteProps>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [cabinet, setCabinet] = useState<StorageCabinet | null>(null);
  const [drawers, setDrawers] = useState<StorageDrawer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const [cab, drwrs] = await Promise.all([
        storageService.getCabinetById(params.id),
        storageService.getDrawersByCabinet(params.id),
      ]);
      setCabinet(cab);
      setDrawers(drwrs.sort((a, b) => a.position - b.position));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingView />;
  if (error || !cabinet) return <ErrorView message={error} onRetry={load} />;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>{cabinet.name}</Text>
        <Text style={styles.subtitle}>{cabinet.location}</Text>
      </View>
      <FlatList
        data={drawers}
        keyExtractor={(d) => d.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, Shadow.sm]}
            onPress={() => navigation.navigate('DrawerDetail', { id: item.id, cabinetId: params.id })}
          >
            <View style={styles.drawerIcon}>
              <MaterialCommunityIcons name="tray" size={22} color={Colors.info} />
            </View>
            <View style={styles.drawerInfo}>
              <Text style={styles.drawerName}>{item.name}</Text>
              {item.label && <Text style={styles.drawerLabel}>{item.label}</Text>}
            </View>
            <Text style={styles.itemsCount}>{item.itemsCount ?? 0} items</Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.grey300} />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="tray-remove" title="No drawers in this cabinet" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.surface, padding: Spacing.xl, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  list: { padding: Spacing.lg, gap: 8, paddingBottom: 80 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  drawerIcon: {
    width: 40, height: 40, borderRadius: 8,
    backgroundColor: Colors.info + '18',
    justifyContent: 'center', alignItems: 'center',
  },
  drawerInfo: { flex: 1 },
  drawerName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  drawerLabel: { fontSize: 11, color: Colors.textSecondary },
  itemsCount: { fontSize: 12, color: Colors.textSecondary },
});
