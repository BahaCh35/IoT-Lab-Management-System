import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { approvalService } from '../../services/api/approvalService';
import { userService } from '../../services/api/userService';
import { labService, meetingRoomService } from '../../services/api/labService';
import { LoadingView } from '../../components/LoadingView';
import { ErrorView } from '../../components/ErrorView';
import { Colors, Spacing, Shadow } from '../../theme';

const W = Dimensions.get('window').width - Spacing.lg * 2;

const baseChartConfig = {
  backgroundGradientFrom: Colors.surface,
  backgroundGradientTo: Colors.surface,
  labelColor: (opacity = 1) => `rgba(51, 65, 85, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.7,
  color: (opacity = 1) => `rgba(67, 97, 238, ${opacity})`,
};

export function AnalyticsScreen() {
  const [approvalStats, setApprovalStats] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [labCount, setLabCount] = useState(0);
  const [roomCount, setRoomCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const [approval, user, labs, rooms] = await Promise.allSettled([
        approvalService.getApprovalStats(),
        userService.getUserStats(),
        labService.getLabs(),
        meetingRoomService.getRooms(),
      ]);
      if (approval.status === 'fulfilled') setApprovalStats(approval.value);
      if (user.status === 'fulfilled') setUserStats(user.value);
      if (labs.status === 'fulfilled') setLabCount(labs.value.length);
      if (rooms.status === 'fulfilled') setRoomCount(rooms.value.length);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingView message="Loading analytics…" />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  // Approval status pie
  const approvalStatusPie = [
    { name: 'Pending',  population: approvalStats?.pending  ?? 0, color: '#FCD34D', legendFontColor: Colors.textSecondary, legendFontSize: 12 },
    { name: 'Approved', population: approvalStats?.approved ?? 0, color: '#6EE7B7', legendFontColor: Colors.textSecondary, legendFontSize: 12 },
    { name: 'Rejected', population: approvalStats?.rejected ?? 0, color: '#FCA5A5', legendFontColor: Colors.textSecondary, legendFontSize: 12 },
  ].filter((d) => d.population > 0);

  // Approvals by type (optional — backend may include byType)
  const TYPE_META = [
    { label: 'Equipment', key: 'equipment-purchase',    color: '#93C5FD' },
    { label: 'Products',  key: 'product-modification',  color: '#A5B4FC' },
    { label: 'Checkout',  key: 'checkout-request',      color: '#F9A8D4' },
    { label: 'Reserv.',   key: 'reservation-request',   color: '#FCD34D' },
    { label: 'Meeting',   key: 'meeting-room-booking',  color: '#6EE7B7' },
    { label: 'Lab',       key: 'lab-reservation',       color: '#67E8F9' },
    { label: 'Storage',   key: 'storage-addition',      color: '#C4B5FD' },
  ];
  const byType = (approvalStats as any)?.byType ?? {};
  const typePieData = TYPE_META
    .filter((t) => (byType[t.key] ?? 0) > 0)
    .map((t) => ({
      name: t.label,
      population: byType[t.key] as number,
      color: t.color,
      legendFontColor: Colors.textSecondary,
      legendFontSize: 12,
    }));

  // Users by role bar chart
  const roleLabels = ['Admin', 'Engineer', 'Tech.'];
  const roleValues = [
    userStats?.admins      ?? 0,
    userStats?.engineers   ?? 0,
    userStats?.technicians ?? 0,
  ];

  // Users by department bar chart (top 5)
  const deptEntries = Object.entries(userStats?.byDepartment ?? {}).slice(0, 5) as [string, number][];
  const deptLabels = deptEntries.map(([k]) => k.slice(0, 6));
  const deptValues = deptEntries.map(([, v]) => v);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
    >
      {/* KPI cards — row 1 */}
      <View style={styles.kpiGrid}>
        <View style={[styles.kpiCard, { backgroundColor: '#F0F4FF' }]}>
          <Text style={styles.kpiLabel}>TOTAL APPROVALS</Text>
          <Text style={[styles.kpiValue, { color: Colors.primary }]}>{approvalStats?.total ?? 0}</Text>
          <Text style={styles.kpiSub}>{approvalStats?.pending ?? 0} pending</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: '#E8F5E9' }]}>
          <Text style={styles.kpiLabel}>TOTAL USERS</Text>
          <Text style={[styles.kpiValue, { color: Colors.success }]}>{userStats?.totalUsers ?? 0}</Text>
          <Text style={styles.kpiSub}>{userStats?.activeUsers ?? 0} active</Text>
        </View>
      </View>

      {/* KPI cards — row 2 */}
      <View style={styles.kpiGrid}>
        <View style={[styles.kpiCard, { backgroundColor: '#FFF3E0' }]}>
          <Text style={styles.kpiLabel}>MEETING ROOMS</Text>
          <Text style={[styles.kpiValue, { color: Colors.warning }]}>{roomCount}</Text>
          <Text style={styles.kpiSub}>available rooms</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: '#F3E5F5' }]}>
          <Text style={styles.kpiLabel}>LABS</Text>
          <Text style={[styles.kpiValue, { color: Colors.secondary }]}>{labCount}</Text>
          <Text style={styles.kpiSub}>total labs</Text>
        </View>
      </View>

      {/* Approval Status Pie */}
      {approvalStatusPie.length > 0 ? (
        <View style={[styles.chartCard, Shadow.sm]}>
          <Text style={styles.chartTitle}>Approval Status Distribution</Text>
          <PieChart
            data={approvalStatusPie}
            width={W}
            height={180}
            chartConfig={baseChartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="10"
            absolute
          />
        </View>
      ) : (
        <View style={[styles.chartCard, Shadow.sm, styles.emptyChart]}>
          <Text style={styles.chartTitle}>Approval Status Distribution</Text>
          <Text style={styles.emptyText}>No approval data yet</Text>
        </View>
      )}

      {/* Approvals by Type (only if backend returns byType) */}
      {typePieData.length > 0 && (
        <View style={[styles.chartCard, Shadow.sm]}>
          <Text style={styles.chartTitle}>Approvals by Type</Text>
          <PieChart
            data={typePieData}
            width={W}
            height={180}
            chartConfig={baseChartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="10"
            absolute
          />
        </View>
      )}

      {/* Users by Role */}
      {roleValues.some((v) => v > 0) ? (
        <View style={[styles.chartCard, Shadow.sm]}>
          <Text style={styles.chartTitle}>Users by Role</Text>
          <BarChart
            data={{ labels: roleLabels, datasets: [{ data: roleValues }] }}
            width={W - 16}
            height={180}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{ ...baseChartConfig, color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})` }}
            style={styles.chart}
            showValuesOnTopOfBars
          />
        </View>
      ) : (
        <View style={[styles.chartCard, Shadow.sm, styles.emptyChart]}>
          <Text style={styles.chartTitle}>Users by Role</Text>
          <Text style={styles.emptyText}>No user data yet</Text>
        </View>
      )}

      {/* Users by Department */}
      {deptValues.length > 0 && (
        <View style={[styles.chartCard, Shadow.sm]}>
          <Text style={styles.chartTitle}>Users by Department</Text>
          <BarChart
            data={{ labels: deptLabels, datasets: [{ data: deptValues.length > 0 ? deptValues : [0] }] }}
            width={W - 16}
            height={180}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{ ...baseChartConfig, color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})` }}
            style={styles.chart}
            showValuesOnTopOfBars
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: 12, paddingBottom: 40 },
  kpiGrid: { flexDirection: 'row', gap: 12 },
  kpiCard: { flex: 1, borderRadius: 12, padding: Spacing.lg },
  kpiLabel: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.5 },
  kpiValue: { fontSize: 28, fontWeight: '800', marginTop: 4 },
  kpiSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  chartCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: Spacing.lg },
  chartTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  chart: { borderRadius: 10, marginLeft: -8 },
  emptyChart: { alignItems: 'center', paddingVertical: Spacing.xl },
  emptyText: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
});
