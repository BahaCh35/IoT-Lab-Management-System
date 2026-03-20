import React, { useState } from 'react';
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
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PeopleIcon from '@mui/icons-material/People';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { approvalService } from '../services/approvalService';

interface RoomBooking {
  start: string;
  end: string;
}

interface MeetingRoom {
  id: string;
  name: string;
  capacity: number;
  floor: number;
  location: string;
  amenities: string[];
  bookedToday: RoomBooking[];
}

const mockMeetingRooms: MeetingRoom[] = [
  {
    id: 'mr-001',
    name: 'Conference A',
    capacity: 12,
    floor: 2,
    location: 'Building A',
    amenities: ['Projector', 'Whiteboard', 'Conference Phone'],
    bookedToday: [],
  },
  {
    id: 'mr-002',
    name: 'Conference B',
    capacity: 8,
    floor: 2,
    location: 'Building A',
    amenities: ['TV Monitor', 'Whiteboard'],
    bookedToday: [{ start: '2:00 PM', end: '3:30 PM' }],
  },
  {
    id: 'mr-003',
    name: 'Small Meeting Room',
    capacity: 4,
    floor: 1,
    location: 'Building A',
    amenities: ['Whiteboard', 'AC'],
    bookedToday: [],
  },
  {
    id: 'mr-004',
    name: 'Collaboration Space',
    capacity: 20,
    floor: 3,
    location: 'Building B',
    amenities: ['Multiple Monitors', 'Projector', 'Whiteboard', 'Dial-in Phone'],
    bookedToday: [],
  },
  {
    id: 'mr-005',
    name: 'Training Room',
    capacity: 30,
    floor: 1,
    location: 'Building B',
    amenities: ['Projector', 'Whiteboard', 'Tiered Seating'],
    bookedToday: [{ start: '1:00 PM', end: '4:00 PM' }],
  },
  {
    id: 'mr-006',
    name: 'Executive Boardroom',
    capacity: 16,
    floor: 4,
    location: 'Building A',
    amenities: ['Projector', 'Video Conference', 'Leather Seating'],
    bookedToday: [],
  },
];

const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
  '4:00 PM', '5:00 PM',
];

const DURATIONS = ['30 min', '1 hour', '1.5 hours', '2 hours', '3 hours', '4 hours'];

const timeToMinutes = (timeStr: string): number => {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'PM' && h !== 12) h += 12;
  if (meridiem === 'AM' && h === 12) h = 0;
  return h * 60 + m;
};

const getAvailableSlots = (date: string, bookedToday: RoomBooking[]): string[] => {
  const today = new Date().toISOString().split('T')[0];
  if (date !== today) return TIME_SLOTS;

  const now = new Date();
  const minMinutes = now.getHours() * 60 + now.getMinutes() + 10;

  return TIME_SLOTS.filter((slot) => {
    const slotMin = timeToMinutes(slot);

    // Exclude past or imminent slots
    if (slotMin <= minMinutes) return false;

    // Exclude slots that fall within any booked range
    for (const booking of bookedToday) {
      const bookStart = timeToMinutes(booking.start);
      const bookEnd = timeToMinutes(booking.end);
      if (slotMin >= bookStart && slotMin < bookEnd) return false;
    }

    return true;
  });
};

const formatAvailabilityLabel = (bookedToday: RoomBooking[]): string => {
  if (bookedToday.length === 0) return 'Available';
  const ranges = bookedToday.map((b) => {
    const startParts = b.start.match(/(\d+:\d+)\s*(AM|PM)/i);
    const endParts = b.end.match(/(\d+:\d+)\s*(AM|PM)/i);
    if (startParts && endParts) {
      return `${startParts[1]}–${endParts[1]} ${endParts[2].toUpperCase()}`;
    }
    return `${b.start}–${b.end}`;
  });
  return `Booked today · ${ranges.join(', ')}`;
};

interface BookingForm {
  date: string;
  startTime: string;
  duration: string;
  purpose: string;
  attendees: string;
}

const emptyForm = (): BookingForm => ({
  date: '',
  startTime: '',
  duration: '1 hour',
  purpose: '',
  attendees: '',
});

const EngineerMeetingRoomsPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<MeetingRoom | null>(null);
  const [form, setForm] = useState<BookingForm>(emptyForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');

  const getAvailabilityColor = (bookedToday: RoomBooking[]) =>
    bookedToday.length === 0 ? '#10b981' : '#f59e0b';

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'Projector':         return '🎥';
      case 'Whiteboard':        return '✏️';
      case 'Conference Phone':  return '☎️';
      case 'TV Monitor':        return '📺';
      case 'AC':                return '❄️';
      case 'Multiple Monitors': return '🖥️';
      case 'Dial-in Phone':     return '☎️';
      case 'Tiered Seating':    return '💺';
      case 'Video Conference':  return '🎬';
      case 'Leather Seating':   return '🪑';
      default:                  return '📍';
    }
  };

  const openReserve = (room: MeetingRoom) => {
    setSelectedRoom(room);
    setForm(emptyForm());
    setFormErrors({});
    setSuccessMsg('');
    setDialogOpen(true);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.date)           errors.date      = 'Date is required';
    if (!form.startTime)      errors.startTime = 'Start time is required';
    if (!form.purpose.trim()) errors.purpose   = 'Purpose is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    approvalService.createApproval({
      type: 'meeting-room-booking',
      requester: { id: 'current-engineer', name: 'My Profile', email: 'engineer@novation.com', role: 'engineer', createdAt: new Date().toISOString() },
      description: `Meeting room booking: ${selectedRoom?.name} on ${form.date} at ${form.startTime} for ${form.duration}`,
      details: { roomName: selectedRoom?.name, date: form.date, startTime: form.startTime, duration: form.duration, purpose: form.purpose, attendees: form.attendees },
      requestedDate: form.date,
    });
    setSuccessMsg(`Reservation request for "${selectedRoom?.name}" submitted! Awaiting admin approval.`);
    setForm(emptyForm());
  };

  const availableSlots = getAvailableSlots(form.date, selectedRoom?.bookedToday ?? []);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <MeetingRoomIcon sx={{ fontSize: 32, color: '#1a73e8' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Meeting Rooms
        </Typography>
      </Box>

      {/* Room Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        {mockMeetingRooms.map((room) => {
          const availLabel = formatAvailabilityLabel(room.bookedToday);
          const availColor = getAvailabilityColor(room.bookedToday);
          const isAvailable = room.bookedToday.length === 0;
          return (
            <Card
              key={room.id}
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
                      {room.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      {room.location} — Floor {room.floor}
                    </Typography>
                  </Box>
                  <Chip icon={<PeopleIcon />} label={room.capacity} size="small" variant="outlined" />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={availLabel}
                    size="small"
                    sx={{
                      backgroundColor: availColor + '20',
                      color: availColor,
                      fontWeight: 500,
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280', mb: 1, display: 'block' }}>
                    Amenities
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {room.amenities.map((amenity, idx) => (
                      <Chip
                        key={idx}
                        label={`${getAmenityIcon(amenity)} ${amenity}`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              </CardContent>

              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button
                  fullWidth
                  variant={isAvailable ? 'contained' : 'outlined'}
                  startIcon={<EventAvailableIcon />}
                  onClick={() => openReserve(room)}
                  sx={{
                    textTransform: 'none',
                    backgroundColor: isAvailable ? '#1a73e8' : undefined,
                    '&:hover': isAvailable ? { backgroundColor: '#1557b0' } : {},
                  }}
                >
                  Reserve
                </Button>
              </CardActions>
            </Card>
          );
        })}
      </Box>

      {/* Full Details Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            All Meeting Rooms ({mockMeetingRooms.length})
          </Typography>
          <TableContainer component={Paper} sx={{ backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Room Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Capacity</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status Today</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amenities</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockMeetingRooms.map((room) => {
                  const availLabel = formatAvailabilityLabel(room.bookedToday);
                  const availColor = getAvailabilityColor(room.bookedToday);
                  return (
                    <TableRow key={room.id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {room.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PeopleIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                          {room.capacity}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {room.location} — Floor {room.floor}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={availLabel}
                          size="small"
                          sx={{
                            backgroundColor: availColor + '20',
                            color: availColor,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                          {room.amenities.join(', ')}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => openReserve(room)}
                          sx={{ textTransform: 'none' }}
                        >
                          Reserve
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="caption" sx={{ display: 'block', mt: 2, color: '#6b7280' }}>
            ℹ️ Availability shown is for today. Reservations are subject to admin approval.
          </Typography>
        </CardContent>
      </Card>

      {/* Reservation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          Reserve — {selectedRoom?.name}
        </DialogTitle>
        <DialogContent dividers>
          {successMsg ? (
            <Box sx={{ backgroundColor: '#e8f5e9', borderRadius: 2, p: 2 }}>
              <Typography sx={{ color: '#2e7d32', fontWeight: 500 }}>{successMsg}</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0.5 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  label="Date"
                  type="date"
                  fullWidth
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value, startTime: '' })}
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
                    disabled={!form.date}
                  >
                    {availableSlots.length === 0 ? (
                      <MenuItem disabled value="">
                        No slots available
                      </MenuItem>
                    ) : (
                      availableSlots.map((t) => (
                        <MenuItem key={t} value={t}>{t}</MenuItem>
                      ))
                    )}
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
                label="Purpose / Agenda"
                fullWidth
                multiline
                rows={3}
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                placeholder="e.g. Project planning meeting, team sync..."
                error={!!formErrors.purpose}
                helperText={formErrors.purpose}
              />

              <TextField
                label="Expected Attendees"
                type="number"
                fullWidth
                value={form.attendees}
                onChange={(e) => setForm({ ...form, attendees: e.target.value })}
                inputProps={{ min: 1, max: selectedRoom?.capacity }}
                helperText={`Max capacity: ${selectedRoom?.capacity}`}
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

export default EngineerMeetingRoomsPage;
