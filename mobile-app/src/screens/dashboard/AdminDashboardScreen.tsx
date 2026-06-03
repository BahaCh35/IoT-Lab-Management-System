import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Text, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { approvalService } from '../../services/api/approvalService';
import { checkoutService } from '../../services/api/checkoutService';
import { storageService } from '../../services/api/storageService';
import { maintenanceService } from '../../services/api/maintenanceService';
import { KpiCard } from '../../components/KpiCard';
import { LoadingView } from '../../components/LoadingView';
import { Colors, Spacing } from '../../theme';
import type { DrawerParamList } from '../../navigation/AdminDrawerNavigator';
import { useFCM } from '../../hooks/useFCM';

interface DashboardData {
  pendingApprovals: number;
  activeCheckouts: number;
  overdueCheckouts: number;
  pendingParts: number;
  maintenancePending: number;
  lowStockItems: number;
}

export function AdminDashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snack, setSnack] = useState('');

  useFCM((title, body) => setSnack(`${title}: ${body}`));

  const loadData = useCallback(async () => {
    try {
      const [approvalStats, activeCheckouts, overdueCheckouts, lowStock, maintenanceStats] =
        await Promise.allSettled([
          approvalService.getApprovalStats(),
          checkoutService.getActiveCheckouts(),
          checkoutService.getOverdueCheckouts(),
          storageService.getLowStockItems(),
          maintenanceService.getStats(),
        ]);

      setData({
        pendingApprovals:
          approvalStats.status === 'fulfilled' ? approvalStats.value.pending : 0,
        activeCheckouts:
          activeCheckouts.status === 'fulfilled' ? activeCheckouts.value.length : 0,
        overdueCheckouts:
          overdueCheckouts.status === 'fulfilled' ? overdueCheckouts.value.length : 0,
        pendingParts: 0,
        maintenancePending:
          maintenanceStats.status === 'fulfilled'
            ? maintenanceStats.value.pending ?? 0
            : 0,
        lowStockItems:
          lowStock.status === 'fulfilled' ? lowStock.value.length : 0,
      });
    } catch (err) {
      console.error('Dashboard load error', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) return <LoadingView message="Loading dashboard…" />;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.headerCard}>
        <View style={styles.headerLeft}>
          <Image source={require('../../../assets/logo.png')} style={styles.logoImg} resizeMode="contain" />
          <Text style={styles.greeting}>{greeting()}, {user?.name ?? 'Admin'}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.bellBtn}>
          <MaterialCommunityIcons name="bell-outline" size={22} color={Colors.primary} />
          {(data?.pendingApprovals ?? 0) > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{data!.pendingApprovals}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* KPI Stats */}
      <View style={styles.kpiGrid}>
        <KpiCard label="Pending Approvals" value={data?.pendingApprovals ?? 0} icon="check-decagram" color={Colors.warning} />
        <KpiCard label="Active Checkouts" value={data?.activeCheckouts ?? 0} icon="package-variant" color={Colors.primary} />
      </View>
      <View style={styles.kpiGrid}>
        <KpiCard label="Overdue" value={data?.overdueCheckouts ?? 0} icon="clock-alert" color={Colors.error} />
        <KpiCard label="Maintenance" value={data?.maintenancePending ?? 0} icon="wrench" color={Colors.info} />
      </View>
      <View style={styles.kpiGrid}>
        <KpiCard label="Low Stock" value={data?.lowStockItems ?? 0} icon="alert" color={Colors.warning} />
        <KpiCard label="Parts Requests" value={data?.pendingParts ?? 0} icon="cog" color={Colors.success} />
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsRow}>
        {[
          { label: 'Approvals', icon: 'check-decagram', screen: 'Approvals', color: Colors.warning },
          { label: 'Equipment', icon: 'laptop', screen: 'Equipment', color: Colors.primary },
          { label: 'Users', icon: 'account-group', screen: 'Users', color: Colors.secondary },
          { label: 'Reservations', icon: 'calendar-check', screen: 'Reservations', color: Colors.success },
        ].map((a) => (
          <TouchableOpacity
            key={a.screen}
            style={[styles.actionBtn, { backgroundColor: a.color + '12', borderColor: a.color + '30' }]}
            onPress={() => navigation.navigate(a.screen as keyof DrawerParamList)}
          >
            <View style={[styles.actionIcon, { backgroundColor: a.color }]}>
              <MaterialCommunityIcons name={a.icon as any} size={20} color={Colors.white} />
            </View>
            <Text style={[styles.actionLabel, { color: a.color }]}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Snackbar
        visible={!!snack}
        onDismiss={() => setSnack('')}
        duration={5000}
        style={{ backgroundColor: Colors.textPrimary }}
      >
        {snack}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 32 },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoImg: { width: 120, height: 36 },
  greeting: { fontSize: 12, color: Colors.textSecondary },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 9, fontWeight: '800', color: Colors.white },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: Spacing.xl,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flex: 1,
    minWidth: 72,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: { fontSize: 11, fontWeight: '700' },
  kpiGrid: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: Spacing.xl,
    marginBottom: 10,
  },
});
