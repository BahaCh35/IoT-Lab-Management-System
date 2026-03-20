import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  TextField,
  Button,
  Chip,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InventoryIcon from '@mui/icons-material/Inventory2';

const STATUS_COLORS: Record<string, string> = {
  available: '#10b981',
  'checked-out': '#3b82f6',
  maintenance: '#f59e0b',
  damaged: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  available: 'Available',
  'checked-out': 'Checked Out',
  maintenance: 'In Maintenance',
  damaged: 'Damaged',
};

const CATEGORIES = ['microcontroller', 'tool', 'component', 'sensor', 'computer', 'other'];
const CATEGORY_FILTER = ['All', ...CATEGORIES];
const STATUSES = ['available', 'checked-out', 'maintenance', 'damaged'];

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  status: string;
  location: string;
  totalUnits: number;
  availableUnits: number;
}

const initialEquipment: EquipmentItem[] = [
  { id: '1', name: 'Arduino Uno',       category: 'microcontroller', status: 'available',   location: 'Room 102, Cabinet A, Drawer 3', totalUnits: 5,  availableUnits: 3 },
  { id: '2', name: 'Raspberry Pi 4',    category: 'microcontroller', status: 'checked-out', location: 'Room 102, Cabinet B, Drawer 1', totalUnits: 3,  availableUnits: 1 },
  { id: '3', name: 'Oscilloscope',      category: 'tool',            status: 'available',   location: 'Lab Bench 3',                  totalUnits: 2,  availableUnits: 2 },
  { id: '4', name: 'Digital Multimeter',category: 'tool',            status: 'available',   location: 'Tool Cabinet A, Drawer 2',     totalUnits: 8,  availableUnits: 6 },
  { id: '5', name: 'Resistor Pack',     category: 'component',       status: 'available',   location: 'Storage Room, Shelf C',        totalUnits: 50, availableUnits: 45 },
  { id: '6', name: 'Soldering Iron Set',category: 'tool',            status: 'maintenance', location: 'Repair Workshop',              totalUnits: 1,  availableUnits: 0 },
];

const emptyForm = (): Omit<EquipmentItem, 'id'> => ({
  name: '',
  category: 'microcontroller',
  status: 'available',
  location: '',
  totalUnits: 1,
  availableUnits: 1,
});

const AdminEquipmentPage: React.FC = () => {
  const [equipment, setEquipment] = useState<EquipmentItem[]>(initialEquipment);
  const [searchQuery, setSearchQuery]     = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter,  setStatusFilter]  = useState('All');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Delete confirm state
  const [deleteId,      setDeleteId]      = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesStatus   = statusFilter   === 'All' || item.status   === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  /* ── Add / Edit dialog ── */
  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormErrors({});
    setDialogOpen(true);
  };

  const openEdit = (item: EquipmentItem) => {
    setEditingId(item.id);
    setForm({ name: item.name, category: item.category, status: item.status, location: item.location, totalUnits: item.totalUnits, availableUnits: item.availableUnits });
    setFormErrors({});
    setDialogOpen(true);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.name.trim())     errors.name     = 'Name is required';
    if (!form.location.trim()) errors.location = 'Location is required';
    if (form.totalUnits < 1)   errors.totalUnits = 'Must be at least 1';
    if (form.availableUnits < 0 || form.availableUnits > form.totalUnits)
      errors.availableUnits = 'Must be between 0 and total units';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editingId) {
      setEquipment((prev) => prev.map((e) => (e.id === editingId ? { ...e, ...form } : e)));
    } else {
      const newId = Date.now().toString();
      setEquipment((prev) => [...prev, { id: newId, ...form }]);
    }
    setDialogOpen(false);
  };

  /* ── Delete ── */
  const openDelete = (id: string) => {
    setDeleteId(id);
    setDeleteConfirm(true);
  };

  const handleDelete = () => {
    if (deleteId) setEquipment((prev) => prev.filter((e) => e.id !== deleteId));
    setDeleteConfirm(false);
    setDeleteId(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <InventoryIcon sx={{ fontSize: 32, color: '#1a73e8' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Equipment Catalog
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAdd}
          sx={{ backgroundColor: '#1a73e8', '&:hover': { backgroundColor: '#1557b0' }, textTransform: 'none', borderRadius: 2 }}
        >
          Add Equipment
        </Button>
      </Box>

      {/* Stats row */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Total',       value: equipment.length,                                                               color: '#1a73e8', bg: '#f0f4ff' },
          { label: 'Available',   value: equipment.filter((e) => e.status === 'available').length,                       color: '#10b981', bg: '#e8f5e9' },
          { label: 'In Use',      value: equipment.filter((e) => e.status === 'checked-out').length,                     color: '#3b82f6', bg: '#e3f2fd' },
          { label: 'Maintenance', value: equipment.filter((e) => e.status === 'maintenance').length,                     color: '#f59e0b', bg: '#fff3e0' },
          { label: 'Damaged',     value: equipment.filter((e) => e.status === 'damaged').length,                         color: '#ef4444', bg: '#fee2e2' },
        ].map((s) => (
          <Card key={s.label} sx={{ backgroundColor: s.bg, minWidth: 150, flex: 1 }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>
                {s.label}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: s.color, mt: 1 }}>
                {s.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search equipment..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: '#6b7280' }} /> }}
          sx={{ minWidth: 240, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Category</InputLabel>
          <Select value={categoryFilter} label="Category" onChange={(e) => setCategoryFilter(e.target.value)}>
            {CATEGORY_FILTER.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="All">All Statuses</MenuItem>
            <MenuItem value="available">Available</MenuItem>
            <MenuItem value="checked-out">Checked Out</MenuItem>
            <MenuItem value="maintenance">In Maintenance</MenuItem>
            <MenuItem value="damaged">Damaged</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Equipment Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
        {filteredEquipment.map((item) => (
          <Card
            key={item.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: 220,
              transition: 'box-shadow 0.2s',
              '&:hover': { boxShadow: '0 8px 20px rgba(0,0,0,0.10)' },
            }}
          >
            {/* Status bar */}
            <Box sx={{ height: 4, backgroundColor: STATUS_COLORS[item.status] }} />

            <CardContent sx={{ flex: 1, p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, flex: 1, fontSize: 15 }}>
                  {item.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.3, ml: 0.5 }}>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openEdit(item)} sx={{ color: '#1a73e8' }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => openDelete(item.id)} sx={{ color: '#ef4444' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Chip
                label={STATUS_LABELS[item.status]}
                size="small"
                sx={{ backgroundColor: STATUS_COLORS[item.status], color: 'white', mb: 1.5 }}
              />

              <Chip
                label={item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                size="small"
                variant="outlined"
                sx={{ mb: 1.5, ml: 0.5, fontSize: 11 }}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <LocationOnIcon sx={{ fontSize: 15, color: '#6b7280' }} />
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  {item.location}
                </Typography>
              </Box>

              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                {item.availableUnits} / {item.totalUnits} units available
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingId ? 'Edit Equipment' : 'Add Equipment'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0.5 }}>
            <TextField
              label="Equipment Name"
              fullWidth
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={!!formErrors.name}
              helperText={formErrors.name}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={form.category} label="Category" onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={form.status} label="Status" onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map((s) => (
                    <MenuItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TextField
              label="Location"
              fullWidth
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              error={!!formErrors.location}
              helperText={formErrors.location}
              placeholder="e.g. Room 102, Cabinet A, Drawer 3"
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Total Units"
                type="number"
                fullWidth
                value={form.totalUnits}
                onChange={(e) => setForm({ ...form, totalUnits: Number(e.target.value) })}
                inputProps={{ min: 1 }}
                error={!!formErrors.totalUnits}
                helperText={formErrors.totalUnits}
              />
              <TextField
                label="Available Units"
                type="number"
                fullWidth
                value={form.availableUnits}
                onChange={(e) => setForm({ ...form, availableUnits: Number(e.target.value) })}
                inputProps={{ min: 0 }}
                error={!!formErrors.availableUnits}
                helperText={formErrors.availableUnits}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{ backgroundColor: '#1a73e8', '&:hover': { backgroundColor: '#1557b0' }, textTransform: 'none' }}
          >
            {editingId ? 'Save Changes' : 'Add Equipment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteConfirm} onClose={() => setDeleteConfirm(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Delete Equipment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{' '}
            <strong>{equipment.find((e) => e.id === deleteId)?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirm(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleDelete}
            sx={{ backgroundColor: '#ef4444', '&:hover': { backgroundColor: '#dc2626' }, textTransform: 'none' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminEquipmentPage;
