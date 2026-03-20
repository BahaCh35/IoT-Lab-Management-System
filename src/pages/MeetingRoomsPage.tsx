import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Paper, Switch } from '@mui/material';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { meetingRoomService } from '../services/meetingRoomService';
import { MeetingRoom } from '../types';

const amenitiesOptions = ['Projector', 'Whiteboard', 'Video Conference', 'Sound System', 'WiFi', 'Parking', 'Accessible', 'Kitchen Access'];

const MeetingRoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRoom, setEditingRoom] = useState<MeetingRoom | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    floor: '',
    location: '',
    amenities: [] as string[],
  });

  const reload = () => {
    setRooms(meetingRoomService.getMeetingRooms());
  };

  useEffect(() => { reload(); }, []);

  const handleAddClick = () => {
    setEditingRoom(null);
    setFormData({ name: '', capacity: '', floor: '', location: '', amenities: [] });
    setOpenDialog(true);
  };

  const handleEditClick = (room: MeetingRoom) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      capacity: room.capacity.toString(),
      floor: room.floor.toString(),
      location: room.location,
      amenities: room.amenities,
    });
    setOpenDialog(true);
  };

  const handleSave = () => {
    const newRoom = {
      name: formData.name,
      capacity: parseInt(formData.capacity),
      floor: parseInt(formData.floor),
      location: formData.location,
      amenities: formData.amenities,
    };

    if (editingRoom) {
      meetingRoomService.updateMeetingRoom(editingRoom.id, newRoom);
    } else {
      meetingRoomService.createMeetingRoom(newRoom);
    }

    reload();
    setOpenDialog(false);
  };

  const handleDelete = (id: string) => {
    meetingRoomService.deleteMeetingRoom(id);
    reload();
  };

  const handleToggleActive = (room: MeetingRoom) => {
    meetingRoomService.updateMeetingRoom(room.id, { isActive: !room.isActive });
    reload();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <MeetingRoomIcon sx={{ fontSize: 32, color: '#1a73e8' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Meeting Rooms
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
          Add Room
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper} sx={{ backgroundColor: '#f8fafc' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Room Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Capacity</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Floor</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amenities</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room.id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {room.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{room.capacity} people</TableCell>
                    <TableCell>Floor {room.floor}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {room.amenities.map((am) => (
                          <Chip key={am} label={am} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <Switch
                          checked={room.isActive}
                          onChange={() => handleToggleActive(room)}
                          size="small"
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#10b981' },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#10b981' },
                          }}
                        />
                        <Chip
                          label={room.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{
                            backgroundColor: room.isActive ? '#e8f5e9' : '#f3f4f6',
                            color: room.isActive ? '#10b981' : '#6b7280',
                            fontWeight: 500,
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Button size="small" startIcon={<EditIcon />} onClick={() => handleEditClick(room)} sx={{ mr: 0.5 }}>
                        Edit
                      </Button>
                      <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(room.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRoom ? 'Edit Meeting Room' : 'Add Meeting Room'}</DialogTitle>
        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Room Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} fullWidth />
          <TextField label="Capacity" type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} fullWidth />
          <TextField label="Floor" type="number" value={formData.floor} onChange={(e) => setFormData({ ...formData, floor: e.target.value })} fullWidth />
          <FormControl fullWidth>
            <InputLabel>Amenities</InputLabel>
            <Select
              multiple
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value })}
              label="Amenities"
            >
              {amenitiesOptions.map((am) => (
                <MenuItem key={am} value={am}>
                  {am}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MeetingRoomsPage;
