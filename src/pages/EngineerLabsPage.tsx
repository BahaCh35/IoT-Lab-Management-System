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
import { Lab } from '../types';

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
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [form, setForm] = useState<BookingForm>(emptyForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [visibleLabs, setVisibleLabs] = useState<Lab[]>([]);

  useEffect(() => {
    const loadVisibleLabs = async () => {
      try {
        const allLabs = await labService.getLabs();
        setVisibleLabs(allLabs.filter((l) => l.isActive));
      } catch (error) {
        console.error('Error loading labs:', error);
        setVisibleLabs([]); // Fallback on error
      }
    };
    loadVisibleLabs();
  }, []);

  const getAvailabilityColor = (availability: string) =>
    availability === 'Available' ? '#10b981' : '#f59e0b';

  const openReserve = (lab: Lab) => {
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
    
    const userStr = sessionStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    if (!currentUser) return;

    approvalService.createApproval({
      type: 'lab-reservation',
      requester: currentUser,
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
                      {"General Lab"}
                    </Typography>
                  </Box>
                  <Chip icon={<PeopleIcon />} label={lab.capacity} size="small" variant="outlined" />
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={(lab.isActive !== false) ? "Available" : "Maintenance"}
                    size="small"
                    sx={{
                      backgroundColor: getAvailabilityColor(lab.isActive !== false ? "Available" : "Maintenance") + '20',
                      color: getAvailabilityColor(lab.isActive !== false ? "Available" : "Maintenance"),
                      fontWeight: 500,
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280', mb: 0.5, display: 'block' }}>
                    Location & Hours
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                    {"Campus Building"} — Floor {lab.floor}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                    {"08:00 AM - 05:00 PM"}
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
                  variant={lab.isActive !== false ? 'contained' : 'outlined'}
                  startIcon={<EventAvailableIcon />}
                  onClick={() => openReserve(lab)}
                  sx={{
                    textTransform: 'none',
                    backgroundColor: lab.isActive !== false ? '#1a73e8' : undefined,
                    '&:hover': lab.isActive !== false ? { backgroundColor: '#1557b0' } : {},
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
                          {"General Lab"}
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
                        label={(lab.isActive !== false) ? "Available" : "Maintenance"}
                        size="small"
                        sx={{
                          backgroundColor: getAvailabilityColor(lab.isActive !== false ? "Available" : "Maintenance") + '20',
                          color: getAvailabilityColor(lab.isActive !== false ? "Available" : "Maintenance"),
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        {"Standard Lab Safety Protocol Applies"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        {"08:00 AM - 05:00 PM"}
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
              {selectedLab && false && (
                <Alert severity="warning" sx={{ py: 0.5 }}>
                  <Typography variant="caption">
                    {"Standard Lab Safety Protocol Applies"}
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
