import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import DeleteIcon from '@mui/icons-material/Delete';
import { equipmentReservationService } from '../services/equipmentReservationService';
import { meetingRoomService } from '../services/meetingRoomService';
import { labService } from '../services/labService';
import { Reservation, MeetingRoomReservation, LabReservation } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reservation-tabpanel-${index}`}
      aria-labelledby={`reservation-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ReservationsPage: React.FC = () => {
  // Get user from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const [tabValue, setTabValue] = useState(0);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'equipment' | 'meeting' | 'lab'>('equipment');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewingData, setReviewingData] = useState<any>(null);
  const [reviewingType, setReviewingType] = useState<'equipment' | 'meeting' | 'lab'>('equipment');

  // Equipment state
  const [equipmentReservations, setEquipmentReservations] = useState<Reservation[]>([]);
  const [equipmentList, setEquipmentList] = useState(['Arduino Uno', 'Oscilloscope', 'Raspberry Pi 4', 'Digital Multimeter', 'Soldering Iron']);
  const [equipmentFormData, setEquipmentFormData] = useState({
    equipment: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    notes: '',
  });

  // Meeting room state
  const [meetingRoomReservations, setMeetingRoomReservations] = useState<MeetingRoomReservation[]>([]);
  const [meetingRooms, setMeetingRooms] = useState<any[]>([]);
  const [meetingFormData, setMeetingFormData] = useState({
    roomId: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
  });

  // Lab state
  const [labReservations, setLabReservations] = useState<LabReservation[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [labFormData, setLabFormData] = useState({
    labId: '',
    purpose: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '12:00',
  });

  useEffect(() => {
    loadAllReservations();
  }, []);

  const loadAllReservations = async () => {
    try {
      // Load equipment reservations for current user
      const allEquipment = await equipmentReservationService.getReservations();
      const userEquipment = allEquipment.filter((r) => r.userId === user?.id);
      setEquipmentReservations(userEquipment);

      // Load meeting room reservations for current user
      const allMeetingRooms = await meetingRoomService.getMeetingRooms();
      setMeetingRooms(allMeetingRooms);
      const allMeetingRes = await meetingRoomService.getMeetingRoomReservations();
      const userMeetingRes = allMeetingRes.filter((r) => r.user.id === user?.id);
      setMeetingRoomReservations(userMeetingRes);

      // Load lab reservations for current user
      const allLabs = await labService.getLabs();
      setLabs(allLabs.filter((l) => l.isActive));
      const allLabRes = await labService.getLabReservations();
      const userLabRes = allLabRes.filter((r) => r.user.id === user?.id);
      setLabReservations(userLabRes);
    } catch (error) {
      console.error('Error loading reservations:', error);
    }
  };

  const getFilteredReservations = (reservations: any[]) => {
    if (filterStatus === 'all') return reservations;
    return reservations.filter((r) => r.status === filterStatus);
  };

  // Get today's date in YYYY-MM-DD format for min date validation
  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const getMinTime = () => {
    const d = new Date(Date.now() + 10 * 60 * 1000);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const handleReviewReservation = (reservation: any, type: 'equipment' | 'meeting' | 'lab') => {
    setReviewingData(reservation);
    setReviewingType(type);
    setReviewDialogOpen(true);
  };

  const handleCreateEquipmentReservation = async () => {
    if (!equipmentFormData.equipment || !equipmentFormData.startDate || !equipmentFormData.endDate) return;

    try {
      const newReservation = await equipmentReservationService.createReservation({
        equipmentId: `eq-${equipmentFormData.equipment}`,
        equipmentName: equipmentFormData.equipment,
        userId: user?.id || '',
        userName: user?.name || 'Anonymous',
        startDate: equipmentFormData.startDate,
        endDate: equipmentFormData.endDate,
        notes: equipmentFormData.notes,
      });

      setEquipmentReservations([...equipmentReservations, newReservation]);
      setEquipmentFormData({
        equipment: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        notes: '',
      });
      setDialogOpen(false);
    } catch (error) {
      console.error('Error creating equipment reservation:', error);
    }
  };

  const handleCreateMeetingRoomReservation = () => {
    if (!meetingFormData.roomId || !meetingFormData.title || !meetingFormData.date || !meetingFormData.startTime || !meetingFormData.endTime) {
      return;
    }

    const newReservation: MeetingRoomReservation = {
      id: `res-${Date.now()}`,
      roomId: meetingFormData.roomId,
      user: user!,
      title: meetingFormData.title,
      date: meetingFormData.date,
      startTime: meetingFormData.startTime,
      endTime: meetingFormData.endTime,
      status: 'pending',
    };

    meetingRoomService.getMeetingRoomReservations(); // Trigger service update
    setMeetingRoomReservations([...meetingRoomReservations, newReservation]);
    setMeetingFormData({
      roomId: '',
      title: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
    });
    setDialogOpen(false);
  };

  const handleCreateLabReservation = () => {
    if (!labFormData.labId || !labFormData.purpose || !labFormData.date || !labFormData.startTime || !labFormData.endTime) {
      return;
    }

    const newReservation: LabReservation = {
      id: `lab-res-${Date.now()}`,
      labId: labFormData.labId,
      user: user!,
      purpose: labFormData.purpose,
      date: labFormData.date,
      startTime: labFormData.startTime,
      endTime: labFormData.endTime,
      status: 'pending',
    };

    labService.getLabReservations(); // Trigger service update
    setLabReservations([...labReservations, newReservation]);
    setLabFormData({
      labId: '',
      purpose: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '12:00',
    });
    setDialogOpen(false);
  };

  const handleCancelReservation = async (id: string, type: 'equipment' | 'meeting' | 'lab') => {
    try {
      if (type === 'equipment') {
        await equipmentReservationService.cancelReservation(id);
        setEquipmentReservations(equipmentReservations.filter((r) => r.id !== id));
      } else if (type === 'meeting') {
        setMeetingRoomReservations(meetingRoomReservations.filter((r) => r.id !== id));
      } else if (type === 'lab') {
        setLabReservations(labReservations.filter((r) => r.id !== id));
      }
    } catch (error) {
      console.error('Error canceling reservation:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#fef3c7';
      case 'approved':
        return '#dcfce7';
      case 'rejected':
        return '#fee2e2';
      case 'cancelled':
        return '#f3f4f6';
      default:
        return '#f3f4f6';
    }
  };

  const stats = {
    equipment: {
      total: equipmentReservations.length,
      pending: equipmentReservations.filter((r) => r.status === 'pending').length,
      approved: equipmentReservations.filter((r) => r.status === 'approved').length,
      rejected: equipmentReservations.filter((r) => r.status === 'rejected').length,
    },
    meeting: {
      total: meetingRoomReservations.length,
      pending: meetingRoomReservations.filter((r) => r.status === 'pending').length,
      approved: meetingRoomReservations.filter((r) => r.status === 'approved').length,
      rejected: meetingRoomReservations.filter((r) => r.status === 'rejected').length,
    },
    lab: {
      total: labReservations.length,
      pending: labReservations.filter((r) => r.status === 'pending').length,
      approved: labReservations.filter((r) => r.status === 'approved').length,
      rejected: labReservations.filter((r) => r.status === 'rejected').length,
    },
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <EventIcon sx={{ fontSize: 32, color: '#1a73e8' }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            My Reservations
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
        <Card sx={{ backgroundColor: '#f0f4ff' }}>
          <CardContent>
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
              Total Requests
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a73e8', mt: 1 }}>
              {stats.equipment.total + stats.meeting.total + stats.lab.total}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: '#fff3e0' }}>
          <CardContent>
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
              Pending
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#f59e0b', mt: 1 }}>
              {stats.equipment.pending + stats.meeting.pending + stats.lab.pending}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: '#e8f5e9' }}>
          <CardContent>
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
              Approved
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#10b981', mt: 1 }}>
              {stats.equipment.approved + stats.meeting.approved + stats.lab.approved}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: '#ffebee' }}>
          <CardContent>
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
              Rejected
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#ef4444', mt: 1 }}>
              {stats.equipment.rejected + stats.meeting.rejected + stats.lab.rejected}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} aria-label="reservation types">
            <Tab label="Equipment" id="reservation-tab-0" aria-controls="reservation-tabpanel-0" />
            <Tab label="Meeting Rooms" id="reservation-tab-1" aria-controls="reservation-tabpanel-1" />
            <Tab label="Labs" id="reservation-tab-2" aria-controls="reservation-tabpanel-2" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Equipment Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  size="small"
                  variant={filterStatus === 'all' ? 'contained' : 'outlined'}
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </Button>
                <Button
                  size="small"
                  variant={filterStatus === 'pending' ? 'contained' : 'outlined'}
                  onClick={() => setFilterStatus('pending')}
                >
                  Pending
                </Button>
                <Button
                  size="small"
                  variant={filterStatus === 'approved' ? 'contained' : 'outlined'}
                  onClick={() => setFilterStatus('approved')}
                >
                  Approved
                </Button>
                <Button
                  size="small"
                  variant={filterStatus === 'rejected' ? 'contained' : 'outlined'}
                  onClick={() => setFilterStatus('rejected')}
                >
                  Rejected
                </Button>
              </Box>
              <Button
                variant="contained"
                startIcon={<EventIcon />}
                onClick={() => {
                  setDialogType('equipment');
                  setDialogOpen(true);
                }}
              >
                Request Equipment
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ backgroundColor: '#f8fafc' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Equipment</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date Range</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Approver</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredReservations(equipmentReservations).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3, color: '#6b7280' }}>
                        No equipment reservations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    getFilteredReservations(equipmentReservations).map((res) => (
                      <TableRow key={res.id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {res.equipment}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {res.startDate} to {res.endDate}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={res.status.charAt(0).toUpperCase() + res.status.slice(1)} size="small" color={getStatusColor(res.status) as any} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{res.approver?.name || '-'}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Button size="small" startIcon={<EventIcon />} onClick={() => handleReviewReservation(res, 'equipment')} sx={{ mr: 0.5 }}>
                            Review
                          </Button>
                          {res.status === 'pending' && (
                            <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleCancelReservation(res.id, 'equipment')}>
                              Cancel
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Meeting Rooms Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  size="small"
                  variant={filterStatus === 'all' ? 'contained' : 'outlined'}
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </Button>
                <Button
                  size="small"
                  variant={filterStatus === 'pending' ? 'contained' : 'outlined'}
                  onClick={() => setFilterStatus('pending')}
                >
                  Pending
                </Button>
                <Button
                  size="small"
                  variant={filterStatus === 'approved' ? 'contained' : 'outlined'}
                  onClick={() => setFilterStatus('approved')}
                >
                  Approved
                </Button>
                <Button
                  size="small"
                  variant={filterStatus === 'rejected' ? 'contained' : 'outlined'}
                  onClick={() => setFilterStatus('rejected')}
                >
                  Rejected
                </Button>
              </Box>
              <Button
                variant="contained"
                startIcon={<EventIcon />}
                onClick={() => {
                  setDialogType('meeting');
                  setDialogOpen(true);
                }}
              >
                Request Meeting Room
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ backgroundColor: '#f8fafc' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Room Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Purpose</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Approver</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredReservations(meetingRoomReservations).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3, color: '#6b7280' }}>
                        No meeting room reservations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    getFilteredReservations(meetingRoomReservations).map((res) => (
                      <TableRow key={res.id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {meetingRooms.find((r) => r.id === res.roomId)?.name || 'Unknown Room'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {res.date} {res.startTime}-{res.endTime}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{res.title}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={res.status.charAt(0).toUpperCase() + res.status.slice(1)} size="small" color={getStatusColor(res.status) as any} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{res.approver?.name || '-'}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Button size="small" startIcon={<EventIcon />} onClick={() => handleReviewReservation(res, 'meeting')} sx={{ mr: 0.5 }}>
                            Review
                          </Button>
                          {res.status === 'pending' && (
                            <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleCancelReservation(res.id, 'meeting')}>
                              Cancel
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Labs Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  size="small"
                  variant={filterStatus === 'all' ? 'contained' : 'outlined'}
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </Button>
                <Button
                  size="small"
                  variant={filterStatus === 'pending' ? 'contained' : 'outlined'}
                  onClick={() => setFilterStatus('pending')}
                >
                  Pending
                </Button>
                <Button
                  size="small"
                  variant={filterStatus === 'approved' ? 'contained' : 'outlined'}
                  onClick={() => setFilterStatus('approved')}
                >
                  Approved
                </Button>
                <Button
                  size="small"
                  variant={filterStatus === 'rejected' ? 'contained' : 'outlined'}
                  onClick={() => setFilterStatus('rejected')}
                >
                  Rejected
                </Button>
              </Box>
              <Button
                variant="contained"
                startIcon={<EventIcon />}
                onClick={() => {
                  setDialogType('lab');
                  setDialogOpen(true);
                }}
              >
                Request Lab
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ backgroundColor: '#f8fafc' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Lab Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Purpose</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Approver</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredReservations(labReservations).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3, color: '#6b7280' }}>
                        No lab reservations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    getFilteredReservations(labReservations).map((res) => (
                      <TableRow key={res.id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {labs.find((l) => l.id === res.labId)?.name || 'Unknown Lab'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {res.date} {res.startTime}-{res.endTime}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{res.purpose}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={res.status.charAt(0).toUpperCase() + res.status.slice(1)} size="small" color={getStatusColor(res.status) as any} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{res.approver?.name || '-'}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Button size="small" startIcon={<EventIcon />} onClick={() => handleReviewReservation(res, 'lab')} sx={{ mr: 0.5 }}>
                            Review
                          </Button>
                          {res.status === 'pending' && (
                            <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleCancelReservation(res.id, 'lab')}>
                              Cancel
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </CardContent>
      </Card>

      {/* Reservation Dialogs */}
      {/* Equipment Dialog */}
      <Dialog open={dialogOpen && dialogType === 'equipment'} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Equipment Reservation</DialogTitle>
        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Equipment</InputLabel>
            <Select value={equipmentFormData.equipment} onChange={(e) => setEquipmentFormData({ ...equipmentFormData, equipment: e.target.value })} label="Equipment">
              {equipmentList.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Start Date"
            type="date"
            value={equipmentFormData.startDate}
            onChange={(e) => setEquipmentFormData({ ...equipmentFormData, startDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            inputProps={{ min: getTodayDate() }}
          />

          <TextField
            label="End Date"
            type="date"
            value={equipmentFormData.endDate}
            onChange={(e) => setEquipmentFormData({ ...equipmentFormData, endDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            inputProps={{ min: equipmentFormData.startDate }}
          />

          <TextField
            label="Notes"
            placeholder="Any special requirements..."
            multiline
            rows={2}
            value={equipmentFormData.notes}
            onChange={(e) => setEquipmentFormData({ ...equipmentFormData, notes: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateEquipmentReservation} variant="contained">
            Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Meeting Room Dialog */}
      <Dialog open={dialogOpen && dialogType === 'meeting'} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Meeting Room</DialogTitle>
        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Meeting Room</InputLabel>
            <Select value={meetingFormData.roomId} onChange={(e) => setMeetingFormData({ ...meetingFormData, roomId: e.target.value })} label="Meeting Room">
              {meetingRooms.map((room) => (
                <MenuItem key={room.id} value={room.id}>
                  {room.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Title/Purpose"
            value={meetingFormData.title}
            onChange={(e) => setMeetingFormData({ ...meetingFormData, title: e.target.value })}
            fullWidth
          />

          <TextField
            label="Date"
            type="date"
            value={meetingFormData.date}
            onChange={(e) => setMeetingFormData({ ...meetingFormData, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            inputProps={{ min: getTodayDate() }}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Start Time"
              type="time"
              value={meetingFormData.startTime}
              onChange={(e) => setMeetingFormData({ ...meetingFormData, startTime: e.target.value })}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: meetingFormData.date === getTodayDate() ? getMinTime() : undefined }}
            />
            <TextField
              label="End Time"
              type="time"
              value={meetingFormData.endTime}
              onChange={(e) => setMeetingFormData({ ...meetingFormData, endTime: e.target.value })}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: meetingFormData.date === getTodayDate() ? getMinTime() : undefined }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateMeetingRoomReservation} variant="contained">
            Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lab Dialog */}
      <Dialog open={dialogOpen && dialogType === 'lab'} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Lab Reservation</DialogTitle>
        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Lab</InputLabel>
            <Select value={labFormData.labId} onChange={(e) => setLabFormData({ ...labFormData, labId: e.target.value })} label="Lab">
              {labs.map((lab) => (
                <MenuItem key={lab.id} value={lab.id}>
                  {lab.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Purpose"
            value={labFormData.purpose}
            onChange={(e) => setLabFormData({ ...labFormData, purpose: e.target.value })}
            fullWidth
            placeholder="What will you be working on?"
          />

          <TextField
            label="Date"
            type="date"
            value={labFormData.date}
            onChange={(e) => setLabFormData({ ...labFormData, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            inputProps={{ min: getTodayDate() }}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Start Time"
              type="time"
              value={labFormData.startTime}
              onChange={(e) => setLabFormData({ ...labFormData, startTime: e.target.value })}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: labFormData.date === getTodayDate() ? getMinTime() : undefined }}
            />
            <TextField
              label="End Time"
              type="time"
              value={labFormData.endTime}
              onChange={(e) => setLabFormData({ ...labFormData, endTime: e.target.value })}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: labFormData.date === getTodayDate() ? getMinTime() : undefined }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateLabReservation} variant="contained">
            Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review Details Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reservation Details</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {reviewingData && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {reviewingType === 'equipment' && (
                <>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                      EQUIPMENT
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                      {reviewingData.equipment}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                      DATE RANGE
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {reviewingData.startDate} to {reviewingData.endDate}
                    </Typography>
                  </Box>
                  {reviewingData.notes && (
                    <Box>
                      <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                        NOTES
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {reviewingData.notes}
                      </Typography>
                    </Box>
                  )}
                </>
              )}

              {reviewingType === 'meeting' && (
                <>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                      MEETING ROOM
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                      {meetingRooms.find((r) => r.id === reviewingData.roomId)?.name || 'Unknown Room'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                      PURPOSE
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {reviewingData.title}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                      DATE & TIME
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {reviewingData.date} from {reviewingData.startTime} to {reviewingData.endTime}
                    </Typography>
                  </Box>
                </>
              )}

              {reviewingType === 'lab' && (
                <>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                      LAB
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                      {labs.find((l) => l.id === reviewingData.labId)?.name || 'Unknown Lab'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                      PURPOSE
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {reviewingData.purpose}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                      DATE & TIME
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {reviewingData.date} from {reviewingData.startTime} to {reviewingData.endTime}
                    </Typography>
                  </Box>
                </>
              )}

              <Box sx={{ borderTop: '1px solid #e5e7eb', pt: 2 }}>
                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                  STATUS
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={reviewingData.status.charAt(0).toUpperCase() + reviewingData.status.slice(1)}
                    color={getStatusColor(reviewingData.status) as any}
                  />
                </Box>
              </Box>

              {reviewingData.approver && (
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                    APPROVED BY
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {reviewingData.approver.name}
                  </Typography>
                </Box>
              )}

              {reviewingData.rejectionReason && (
                <Box sx={{ backgroundColor: '#fee2e2', p: 2, borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ color: '#7f1d1d', fontWeight: 600 }}>
                    REJECTION REASON
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7f1d1d', mt: 0.5 }}>
                    {reviewingData.rejectionReason}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReservationsPage;
