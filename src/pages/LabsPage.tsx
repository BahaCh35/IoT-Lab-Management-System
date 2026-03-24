import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Paper, Switch } from '@mui/material';
import MonitorIcon from '@mui/icons-material/Monitor';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { labService } from '../services/labService';
import { Lab } from '../types';

const LabsPage: React.FC = () => {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLab, setEditingLab] = useState<Lab | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    floor: '',
    equipment: '',
  });

  const reload = async () => {
    try {
      const labsData = await labService.getLabs();
      setLabs(labsData);
    } catch (error) {
      console.error('Error loading labs:', error);
    }
  };

  useEffect(() => { reload(); }, []);

  const handleAddClick = () => {
    setEditingLab(null);
    setFormData({ name: '', capacity: '', floor: '', equipment: '' });
    setOpenDialog(true);
  };

  const handleEditClick = (lab: Lab) => {
    setEditingLab(lab);
    setFormData({
      name: lab.name,
      capacity: lab.capacity.toString(),
      floor: lab.floor.toString(),
      equipment: lab.equipment.join(', '),
    });
    setOpenDialog(true);
  };

  const handleToggleActive = (lab: Lab) => {
    labService.updateLab(lab.id, { isActive: !lab.isActive });
    reload();
  };

  const handleSave = () => {
    const equipmentArray = formData.equipment
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e);

    const newLab = {
      name: formData.name,
      capacity: parseInt(formData.capacity),
      floor: parseInt(formData.floor),
      equipment: equipmentArray,
    };

    if (editingLab) {
      labService.updateLab(editingLab.id, newLab);
    } else {
      labService.createLab(newLab);
    }

    reload();
    setOpenDialog(false);
  };

  const handleDelete = (id: string) => {
    labService.deleteLab(id);
    reload();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <MonitorIcon sx={{ fontSize: 32, color: '#1a73e8' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Labs Management
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
          Add Lab
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper} sx={{ backgroundColor: '#f8fafc' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Lab Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Capacity</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Floor</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Equipment</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {labs.map((lab) => (
                  <TableRow key={lab.id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {lab.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{lab.capacity} people</TableCell>
                    <TableCell>Floor {lab.floor}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {lab.equipment.map((eq) => (
                          <Chip key={eq} label={eq} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <Switch
                          checked={lab.isActive}
                          onChange={() => handleToggleActive(lab)}
                          size="small"
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#10b981' },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#10b981' },
                          }}
                        />
                        <Chip
                          label={lab.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{
                            backgroundColor: lab.isActive ? '#e8f5e9' : '#f3f4f6',
                            color: lab.isActive ? '#10b981' : '#6b7280',
                            fontWeight: 500,
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Button size="small" startIcon={<EditIcon />} onClick={() => handleEditClick(lab)} sx={{ mr: 0.5 }}>
                        Edit
                      </Button>
                      <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(lab.id)}>
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
        <DialogTitle>{editingLab ? 'Edit Lab' : 'Add Lab'}</DialogTitle>
        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Lab Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} fullWidth />
          <TextField label="Capacity" type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} fullWidth />
          <TextField label="Floor" type="number" value={formData.floor} onChange={(e) => setFormData({ ...formData, floor: e.target.value })} fullWidth />
          <TextField label="Equipment (comma-separated)" value={formData.equipment} onChange={(e) => setFormData({ ...formData, equipment: e.target.value })} fullWidth multiline rows={3} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LabsPage;
