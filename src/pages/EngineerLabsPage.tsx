import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import MonitorIcon from '@mui/icons-material/Monitor';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { labService } from '../services/labService';
import { approvalService } from '../services/approvalService';

const mockLabs = [
  {
    id: 'lab-001',
    name: 'IoT Lab',
    type: 'Internet of Things',
    capacity: 15,
    floor: 2,
    location: 'Building A',
    equipment: ['Arduino Board', 'Raspberry Pi', 'Sensors', 'Wireless Modules'],
    availability: 'Available',
    safetyRequirements: 'No special requirements',
    operatingHours: '8:00 AM - 6:00 PM',
  },
  {
    id: 'lab-002',
    name: 'Electronics Lab',
    type: 'Electronics & Circuits',
    capacity: 20,
    floor: 3,
    location: 'Building A',
    equipment: ['Oscilloscope', 'Power Supply', 'Function Generator', 'Multimeter'],
    availability: 'Booked',
    safetyRequirements: 'Electrical Safety Training Required',
    operatingHours: '7:00 AM - 7:00 PM',
  },
  {
    id: 'lab-003',
    name: 'Robotics Lab',
    type: 'Robotics & Automation',
    capacity: 12,
    floor: 4,
    location: 'Building B',
    equipment: ['Robot Arms', 'Motion Controllers', 'Vision Systems', 'PLC Units'],
    availability: 'Available',
    safetyRequirements: 'Safety Training & PPE Required',
    operatingHours: '8:00 AM - 5:00 PM',
  },
  {
    id: 'lab-004',
    name: 'Materials Lab',
    type: 'Materials Science',
    capacity: 8,
    floor: 1,
    location: 'Building B',
    equipment: ['Microscopes', 'Testing Equipment', 'Analysis Tools', 'Sample Storage'],
    availability: 'Available',
    safetyRequirements: 'Chemical Handling Training Required',
    operatingHours: '9:00 AM - 5:00 PM',
  },
];

const TIME_SLOTS = [
  '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
];

const DURATIONS = ['1 hour', '2 hours', '3 hours', '4 hours', 'Half Day', 'Full Day'];

const getAvailableSlots = (date: string): string[] => {
  const today = new Date().toISOString().split('T')[0];
  if (date !== today) return TIME_SLOTS;
  const now = new Date();
  const minMinutes = now.getHours() * 60 + now.getMinutes() + 10;
  return TIME_SLOTS.filter((slot) => {
    const match = slot.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return true;
    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const meridiem = match[3].toUpperCase();
    if (meridiem === 'PM' && h !== 12) h += 12;
    if (meridiem === 'AM' && h === 12) h = 0;
    return h * 60 + m > minMinutes;
  });
};

interface BookingForm {
  date: string;
  startTime: string;
  duration: string;
  purpose: string;
  participants: string;
}

const emptyForm = (): BookingForm => ({
  date: '',
  startTime: '',
  duration: '2 hours',
  purpose: '',
  participants: '',
});

const EngineerLabsPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLab, setSelectedLab] = useState<(typeof mockLabs)[0] | null>(null);
  const [form, setForm] = useState<BookingForm>(emptyForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [visibleLabs, setVisibleLabs] = useState<(typeof mockLabs)>([]);

  useEffect(() => {
    const loadVisibleLabs = async () => {
      try {
        const allLabs = await labService.getLabs();
        const activeLabNames = new Set(allLabs.filter((l) => l.isActive).map((l) => l.name));
        const visible = mockLabs.filter((m) => {
          const inAdmin = allLabs.some((a) => a.name === m.name);
          return !inAdmin || activeLabNames.has(m.name);
        });
        setVisibleLabs(visible);
      } catch (error) {
        console.error('Error loading labs:', error);
        setVisibleLabs(mockLabs); // Fallback to showing all mock labs
      }
    };
    loadVisibleLabs();
  }, []);

  const getAvailabilityColor = (availability: string) =>
    availability === 'Available' ? '#10b981' : '#f59e0b';

  const openReserve = (lab: (typeof mockLabs)[0]) => {
    setSelectedLab(lab);
    setForm(emptyForm());
    setFormErrors({});
    setSuccessMsg('');
    setDialogOpen(true);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.date)           errors.date      = 'Date is required';
    if (!form.startTime)      errors.startTime = 'Start time is required';
    if (!form.purpose.trim()) errors.purpose   = 'Purpose / project description is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    approvalService.createApproval({
      type: 'lab-reservation',
      requester: { id: 'current-engineer', name: 'My Profile', email: 'engineer@novation.com', role: 'engineer', createdAt: new Date().toISOString() },
      description: `Lab reservation: ${selectedLab?.name} on ${form.date} at ${form.startTime} for ${form.duration}`,
      details: { labName: selectedLab?.name, date: form.date, startTime: form.startTime, duration: form.duration, purpose: form.purpose, participants: form.participants },
      priority: 'medium',
    });
    setSuccessMsg(`Reservation request for "${selectedLab?.name}" submitted! Awaiting admin approval.`);
    setForm(emptyForm());
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <MonitorIcon sx={{ fontSize: 32, color: '#1a73e8' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Labs Management
        </Typography>
      </Box>

      {/* Lab Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        {visibleLabs.map((lab) => {
          return (
            <Card
              key={lab.id}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: '0 8px 20px rgba(0,0,0,0.10)' },
              }}
            >
              <CardContent sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {lab.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      {lab.type}
                    </Typography>
                  </Box>
                  <Chip icon={<PeopleIcon />} label={lab.capacity} size="small" variant="outlined" />
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={lab.availability}
                    size="small"
                    sx={{
                      backgroundColor: getAvailabilityColor(lab.availability) + '20',
                      color: getAvailabilityColor(lab.availability),
                      fontWeight: 500,
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280', mb: 0.5, display: 'block' }}>
                    Location & Hours
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                    {lab.location} — Floor {lab.floor}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                    {lab.operatingHours}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280', mb: 0.5, display: 'block' }}>
                    Equipment Available
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#374151' }}>
                    {lab.equipment.join(', ')}
                  </Typography>
                </Box>
              </CardContent>

              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button
                  fullWidth
                  variant={lab.availability === 'Available' ? 'contained' : 'outlined'}
                  startIcon={<EventAvailableIcon />}
                  onClick={() => openReserve(lab)}
                  sx={{
                    textTransform: 'none',
                    backgroundColor: lab.availability === 'Available' ? '#1a73e8' : undefined,
                    '&:hover': lab.availability === 'Available' ? { backgroundColor: '#1557b0' } : {},
                  }}
                >
                  Reserve Lab
                </Button>
              </CardActions>
            </Card>
          );
        })}
      </Box>

      {/* Full Details Table */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Laboratory Details ({visibleLabs.length})
          </Typography>
          <TableContainer
            component={Paper}
            sx={{ backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 2 }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Lab Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Capacity</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Availability</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Safety Requirements</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Operating Hours</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleLabs.map((lab) => (
                  <TableRow key={lab.id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {lab.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                          {lab.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PeopleIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                        {lab.capacity}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={lab.availability}
                        size="small"
                        sx={{
                          backgroundColor: getAvailabilityColor(lab.availability) + '20',
                          color: getAvailabilityColor(lab.availability),
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        {lab.safetyRequirements}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        {lab.operatingHours}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => openReserve(lab)}
                        sx={{ textTransform: 'none' }}
                      >
                        Reserve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Safety Notice */}
      <Alert severity="warning" icon={<WarningIcon />}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Safety Notice for Lab Usage
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Lab usage is restricted to authorized personnel only. Reservations are subject to admin approval.
          Ensure you meet all safety training requirements before submitting a request.
        </Typography>
      </Alert>

      {/* Reservation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          Reserve — {selectedLab?.name}
        </DialogTitle>
        <DialogContent dividers>
          {successMsg ? (
            <Box sx={{ backgroundColor: '#e8f5e9', borderRadius: 2, p: 2 }}>
              <Typography sx={{ color: '#2e7d32', fontWeight: 500 }}>{successMsg}</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0.5 }}>
              {selectedLab && !selectedLab.safetyRequirements.includes('No special') && (
                <Alert severity="warning" sx={{ py: 0.5 }}>
                  <Typography variant="caption">
                    {selectedLab.safetyRequirements}
                  </Typography>
                </Alert>
              )}

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  label="Date"
                  type="date"
                  fullWidth
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                  error={!!formErrors.date}
                  helperText={formErrors.date}
                />
                <FormControl fullWidth error={!!formErrors.startTime}>
                  <InputLabel>Start Time</InputLabel>
                  <Select
                    value={form.startTime}
                    label="Start Time"
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  >
                    {getAvailableSlots(form.date).map((t) => (
                      <MenuItem key={t} value={t}>{t}</MenuItem>
                    ))}
                  </Select>
                  {formErrors.startTime && (
                    <Typography variant="caption" sx={{ color: '#d32f2f', mt: 0.5, ml: 1.5 }}>
                      {formErrors.startTime}
                    </Typography>
                  )}
                </FormControl>
              </Box>

              <FormControl fullWidth>
                <InputLabel>Duration</InputLabel>
                <Select
                  value={form.duration}
                  label="Duration"
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                >
                  {DURATIONS.map((d) => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Project / Purpose Description"
                fullWidth
                multiline
                rows={3}
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                placeholder="e.g. IoT sensor calibration, circuit testing..."
                error={!!formErrors.purpose}
                helperText={formErrors.purpose}
              />

              <TextField
                label="Number of Participants"
                type="number"
                fullWidth
                value={form.participants}
                onChange={(e) => setForm({ ...form, participants: e.target.value })}
                inputProps={{ min: 1, max: selectedLab?.capacity }}
                helperText={`Max capacity: ${selectedLab?.capacity} people`}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none' }}>
            {successMsg ? 'Close' : 'Cancel'}
          </Button>
          {!successMsg && (
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{
                backgroundColor: '#1a73e8',
                '&:hover': { backgroundColor: '#1557b0' },
                textTransform: 'none',
              }}
            >
              Submit Request
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EngineerLabsPage;
