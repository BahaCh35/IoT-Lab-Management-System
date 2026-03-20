import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Alert } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory2';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import MonitorIcon from '@mui/icons-material/Monitor';
import LockIcon from '@mui/icons-material/Lock';
import { checkoutService } from '../services/checkoutService';
import { labService } from '../services/labService';
import { meetingRoomService } from '../services/meetingRoomService';

const GuestDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const allEquipment = checkoutService.getEquipment();
    const allLabs = labService.getLabs();
    const allRooms = meetingRoomService.getMeetingRooms();

    setStats({
      totalEquipment: allEquipment.length,
      availableEquipment: allEquipment.filter((e) => e.status === 'available').length,
      totalMeetingRooms: allRooms.length,
      availableMeetingRooms: allRooms.filter((r) => r.isActive).length,
      totalLabs: allLabs.length,
      availableLabs: allLabs.filter((l) => l.isActive).length,
    });
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <DashboardIcon sx={{ fontSize: 32, color: '#1a73e8' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Guest Dashboard
        </Typography>
      </Box>

      {/* Disclaimer */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <LockIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        <Typography variant="body2">
          You have read-only access to lab information. Some details are limited for privacy and security reasons.
        </Typography>
      </Alert>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        {stats && (
          <>
            <Card sx={{ backgroundColor: '#f0f4ff' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                      Total Equipment
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a73e8', mt: 0.5 }}>
                      {stats.totalEquipment}
                    </Typography>
                  </Box>
                  <Box sx={{ width: 40, height: 40, backgroundColor: '#1a73e8', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <InventoryIcon sx={{ color: 'white' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ backgroundColor: '#e8f5e9' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                      Available
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981', mt: 0.5 }}>
                      {stats.availableEquipment}
                    </Typography>
                  </Box>
                  <Box sx={{ width: 40, height: 40, backgroundColor: '#10b981', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <InventoryIcon sx={{ color: 'white' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ backgroundColor: '#e3f2fd' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                      Meeting Rooms
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b82f6', mt: 0.5 }}>
                      {stats.totalMeetingRooms}
                    </Typography>
                  </Box>
                  <Box sx={{ width: 40, height: 40, backgroundColor: '#3b82f6', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MeetingRoomIcon sx={{ color: 'white' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ backgroundColor: '#f3e5f5' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                      Labs
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#9333ea', mt: 0.5 }}>
                      {stats.totalLabs}
                    </Typography>
                  </Box>
                  <Box sx={{ width: 40, height: 40, backgroundColor: '#9333ea', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MonitorIcon sx={{ color: 'white' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </>
        )}
      </Box>

      {/* Information Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              📋 Available Resources
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Equipment:</strong> {stats?.availableEquipment} out of {stats?.totalEquipment} items available
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Meeting Rooms:</strong> {stats?.availableMeetingRooms} out of {stats?.totalMeetingRooms} rooms available
            </Typography>
            <Typography variant="body2">
              <strong>Labs:</strong> {stats?.availableLabs} out of {stats?.totalLabs} labs available
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              🔒 Privacy Notice
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              As a guest user, you have access to:
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, mb: 0.5 }}>
              ✓ Equipment catalog (limited information)
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
              ✓ Meeting room availability (anonymous schedule)
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
              ✓ Lab information and availability
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#ef4444' }}>
              ✗ Exact location details (QR codes, drawer numbers)
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: '#ef4444' }}>
              ✗ User information or check-out history
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default GuestDashboardPage;
