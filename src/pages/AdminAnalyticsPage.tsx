import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { approvalService } from '../services/approvalService';
import { meetingRoomService } from '../services/meetingRoomService';
import { labService } from '../services/labService';
import { userService } from '../services/userService';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip as ChartTooltip, Legend as ChartLegend } from 'chart.js';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, ChartTooltip, ChartLegend);

// Custom plugin: draw percentage labels directly on each doughnut/pie slice
const percentageLabelPlugin = {
  id: 'percentageLabels',
  afterDatasetsDraw(chart: any) {
    const { ctx } = chart;
    chart.data.datasets.forEach((_: any, datasetIndex: number) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      const data = chart.data.datasets[datasetIndex].data as number[];
      const total = data.reduce((sum: number, v: number) => sum + (v || 0), 0);
      if (total === 0) return;
      meta.data.forEach((arc: any, index: number) => {
        const value = data[index] || 0;
        if (value === 0) return;
        const pct = ((value / total) * 100).toFixed(1) + '%';
        const center = arc.getCenterPoint();
        ctx.save();
        ctx.font = 'bold 13px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pct, center.x, center.y);
        ctx.restore();
      });
    });
  },
};

const AdminAnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const approvalStats = await approvalService.getApprovalStats();
        const meetingStats = await meetingRoomService.getMeetingRoomStats();
        const labStats = await labService.getLabStats();
        const userStats = await userService.getUserStats();

        setStats({
          approvals: approvalStats,
          meetings: meetingStats,
          labs: labStats,
          users: userStats,
        });
      } catch (error) {
        console.error('Error loading analytics stats:', error);
      }
    };
    loadStats();
  }, []);

  if (!stats) {
    return <Typography>Loading...</Typography>;
  }

  const allTypes = [
    { label: 'Equipment',    key: 'equipment-purchase',    color: '#93c5fd' },
    { label: 'Products',     key: 'product-modification',  color: '#a5b4fc' },
    { label: 'Checkout',     key: 'checkout-request',      color: '#f9a8d4' },
    { label: 'Reservation',  key: 'reservation-request',   color: '#fcd34d' },
    { label: 'Meeting',      key: 'meeting-room-booking',  color: '#6ee7b7' },
    { label: 'Lab',          key: 'lab-reservation',       color: '#67e8f9' },
    { label: 'Storage',      key: 'storage-addition',      color: '#c4b5fd' },
  ];
  const activeTypes = allTypes.filter((t) => (stats.approvals.byType[t.key] ?? 0) > 0);
  const approvalByTypeData = {
    labels: activeTypes.length > 0 ? activeTypes.map((t) => t.label) : ['No Data'],
    datasets: [
      {
        data: activeTypes.length > 0 ? activeTypes.map((t) => stats.approvals.byType[t.key] ?? 0) : [1],
        backgroundColor: activeTypes.length > 0 ? activeTypes.map((t) => t.color) : ['#e5e7eb'],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const approvalStatusData = {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [
      {
        data: [stats.approvals.pending, stats.approvals.approved, stats.approvals.rejected],
        backgroundColor: ['#fcd34d', '#6ee7b7', '#ff6060'],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const usersByRoleData = {
    labels: ['Admin', 'Technician', 'Engineer'],
    datasets: [
      {
        label: 'Users by Role',
        data: [stats.users.admins, stats.users.technicians, stats.users.engineers],
        backgroundColor: ['#fca5a5', '#c4b5fd', '#93c5fd'],
        borderColor:     ['#fca5a5', '#c4b5fd', '#93c5fd'],
      },
    ],
  };

  const usersByDepartmentData = {
    labels: Object.keys(stats.users.byDepartment),
    datasets: [
      {
        label: 'Users by Department',
        data: Object.values(stats.users.byDepartment),
        backgroundColor: ['#6ee7b7', '#fde68a', '#a5b4fc', '#fca5a5'],
        borderColor:     ['#6ee7b7', '#fde68a', '#a5b4fc', '#fca5a5'],
      },
    ],
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <AnalyticsIcon sx={{ fontSize: 32, color: '#1a73e8' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Admin Analytics
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <Card sx={{ backgroundColor: '#f0f4ff' }}>
          <CardContent>
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
              TOTAL APPROVALS
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a73e8', mt: 1 }}>
              {stats.approvals.total}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b7280', mt: 1, display: 'block' }}>
              {stats.approvals.pending} pending
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: '#e8f5e9' }}>
          <CardContent>
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
              TOTAL USERS
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981', mt: 1 }}>
              {stats.users.totalUsers}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b7280', mt: 1, display: 'block' }}>
              {stats.users.activeUsers} active
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: '#fff3e0' }}>
          <CardContent>
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
              MEETING ROOMS
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b', mt: 1 }}>
              {stats.meetings.totalRooms}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b7280', mt: 1, display: 'block' }}>
              {stats.meetings.pendingReservations} pending reservations
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: '#f3e5f5' }}>
          <CardContent>
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
              LABS
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#7c3aed', mt: 1 }}>
              {stats.labs.totalLabs}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b7280', mt: 1, display: 'block' }}>
              {stats.labs.pendingReservations} pending reservations
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Charts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Approval Status Distribution
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Doughnut
                data={approvalStatusData}
                plugins={[percentageLabelPlugin]}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => {
                          const data = ctx.dataset.data as number[];
                          const total = data.reduce((a, b) => a + (b || 0), 0);
                          const value = ctx.parsed;
                          const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                          return ` ${ctx.label}: ${value} (${pct}%)`;
                        },
                      },
                    },
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Approvals by Type
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Doughnut
                data={approvalByTypeData}
                plugins={[percentageLabelPlugin]}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => {
                          const data = ctx.dataset.data as number[];
                          const total = data.reduce((a, b) => a + (b || 0), 0);
                          const value = ctx.parsed;
                          const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                          return ` ${ctx.label}: ${value} (${pct}%)`;
                        },
                      },
                    },
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Users by Role */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Users by Role
          </Typography>
          <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bar
              data={usersByRoleData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y' as const,
                plugins: { legend: { display: false } },
                scales: { x: { ticks: { stepSize: 1 }, beginAtZero: true } },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Users by Department */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Users by Department
          </Typography>
          <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bar
              data={usersByDepartmentData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y' as const,
                plugins: { legend: { display: false } },
                scales: { x: { ticks: { stepSize: 1 }, beginAtZero: true } },
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminAnalyticsPage;
