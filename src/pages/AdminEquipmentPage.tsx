import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
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
  CircularProgress,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InventoryIcon from '@mui/icons-material/Inventory2';
import { Equipment } from '../types';
import { equipmentService } from '../services/equipmentService';

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

interface EquipmentFormData {
  name: string;
  description: string;
  category: Equipment['category'];
  status: Equipment['status'];
  quantity: number;
  maintenanceCount: number;
  damagedCount: number;
  building: string;
  room: string;
  cabinet: string;
  drawer: string;
  shelf: string;
}

const emptyForm = (): EquipmentFormData => ({
  name: '',
  description: '',
  category: 'microcontroller',
  status: 'available',
  quantity: 1,
  maintenanceCount: 0,
  damagedCount: 0,
  building: '',
  room: '',
  cabinet: '',
  drawer: '',
  shelf: '',
});

const AdminEquipmentPage: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Delete confirm state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Load equipment data
  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await equipmentService.getEquipment();
      setEquipment(data);
    } catch (error) {
      console.error('Error loading equipment:', error);
      setError('Failed to load equipment data');
    } finally {
      setLoading(false);
    }
  };

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Helper function to format location
  const formatLocation = (equipment: Equipment): string => {
    const { location } = equipment;
    if (!location) return 'No location set';

    const parts = [];
    if (location.building) parts.push(location.building);
    if (location.room) parts.push(`Room ${location.room}`);
    if (location.cabinet) parts.push(`Cabinet ${location.cabinet}`);
    if (location.drawer) parts.push(`Drawer ${location.drawer}`);
    if (location.shelf) parts.push(`Shelf ${location.shelf}`);

    return parts.length > 0 ? parts.join(', ') : 'No location set';
  };

  /* ── Add / Edit dialog ── */
  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormErrors({});
    setDialogOpen(true);
  };

  const openEdit = (item: Equipment) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description || '',
      category: item.category,
      status: item.status,
      quantity: item.quantity ?? 1,
      maintenanceCount: item.maintenanceCount ?? 0,
      damagedCount: item.damagedCount ?? 0,
      building: item.location?.building || '',
      room: item.location?.room || '',
      cabinet: item.location?.cabinet || '',
      drawer: item.location?.drawer || '',
      shelf: item.location?.shelf || '',
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.category) errors.category = 'Category is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      setError(null);

      const equipmentData = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        category: form.category,
        status: form.status,
        quantity: form.quantity,
        maintenance_count: form.maintenanceCount,
        damaged_count: form.damagedCount,
        building: form.building.trim() || undefined,
        room: form.room.trim() || undefined,
        cabinet: form.cabinet.trim() || undefined,
        drawer: form.drawer.trim() || undefined,
        shelf: form.shelf.trim() || undefined,
      };

      if (editingId) {
        const updated = await equipmentService.updateEquipment(editingId, equipmentData);
        if (updated) {
          setEquipment(prev => prev.map(e => e.id === editingId ? updated : e));
        } else {
          throw new Error('Failed to update equipment');
        }
      } else {
        const created = await equipmentService.createEquipment(equipmentData);
        if (created) {
          setEquipment(prev => [...prev, created]);
        } else {
          throw new Error('Failed to create equipment');
        }
      }

      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving equipment:', error);
      setError('Failed to save equipment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const openDelete = (id: string) => {
    setDeleteId(id);
    setDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      setError(null);

      const success = await equipmentService.deleteEquipment(deleteId);
      if (success) {
        setEquipment(prev => prev.filter(e => e.id !== deleteId));
      } else {
        throw new Error('Failed to delete equipment');
      }
    } catch (error) {
      console.error('Error deleting equipment:', error);
      setError('Failed to delete equipment. Please try again.');
    } finally {
      setDeleteConfirm(false);
      setDeleteId(null);
      setDeleting(false);
    }
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

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
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
            {searchQuery || categoryFilter !== 'All' || statusFilter !== 'All' ? (
              <Button
                size="small"
                variant="outlined"
                onClick={() => { setSearchQuery(''); setCategoryFilter('All'); setStatusFilter('All'); }}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
              Clear
            </Button>) : null}
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

                  {item.description && (
                    <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mb: 1 }}>
                      {item.description}
                    </Typography>
                  )}

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
                      {formatLocation(item)}
                    </Typography>
                  </Box>

                  <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>
                    {item.availableCount ?? item.quantity ?? 1}/{item.quantity ?? 1} Available
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          {filteredEquipment.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
                No equipment found
              </Typography>
              <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                {equipment.length === 0
                  ? 'No equipment has been added yet.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </Typography>
            </Box>
          )}
        </>
      )}

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
              disabled={saving}
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of the equipment..."
              disabled={saving}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
              <TextField
                label="Total Quantity"
                type="number"
                fullWidth
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                inputProps={{ min: 1 }}
                disabled={saving}
              />
              <TextField
                label="In Maintenance"
                type="number"
                fullWidth
                value={form.maintenanceCount}
                onChange={(e) => setForm({ ...form, maintenanceCount: Math.max(0, parseInt(e.target.value) || 0) })}
                inputProps={{ min: 0 }}
                disabled={saving}
              />
              <TextField
                label="Damaged"
                type="number"
                fullWidth
                value={form.damagedCount}
                onChange={(e) => setForm({ ...form, damagedCount: Math.max(0, parseInt(e.target.value) || 0) })}
                inputProps={{ min: 0 }}
                disabled={saving}
              />
            </Box>

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={form.category}
                label="Category"
                onChange={(e) => setForm({ ...form, category: e.target.value as Equipment['category'] })}
                disabled={saving}
                error={!!formErrors.category}
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.category && (
                <Typography variant="caption" sx={{ color: '#ef4444', ml: 2, mt: 0.5 }}>
                  {formErrors.category}
                </Typography>
              )}
            </FormControl>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1, mb: -1, color: '#374151' }}>
              Location Details
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Building"
                fullWidth
                value={form.building}
                onChange={(e) => setForm({ ...form, building: e.target.value })}
                placeholder="e.g. Engineering Block"
                disabled={saving}
              />
              <TextField
                label="Room"
                fullWidth
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                placeholder="e.g. 102"
                disabled={saving}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
              <TextField
                label="Cabinet"
                fullWidth
                value={form.cabinet}
                onChange={(e) => setForm({ ...form, cabinet: e.target.value })}
                placeholder="e.g. A"
                disabled={saving}
              />
              <TextField
                label="Drawer"
                fullWidth
                value={form.drawer}
                onChange={(e) => setForm({ ...form, drawer: e.target.value })}
                placeholder="e.g. 3"
                disabled={saving}
              />
              <TextField
                label="Shelf"
                fullWidth
                value={form.shelf}
                onChange={(e) => setForm({ ...form, shelf: e.target.value })}
                placeholder="e.g. Top"
                disabled={saving}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none' }} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{ backgroundColor: '#1a73e8', '&:hover': { backgroundColor: '#1557b0' }, textTransform: 'none' }}
            startIcon={saving ? <CircularProgress size={16} /> : null}
          >
            {saving ? 'Saving...' : (editingId ? 'Save Changes' : 'Add Equipment')}
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
          <Button onClick={() => setDeleteConfirm(false)} sx={{ textTransform: 'none' }} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDelete}
            disabled={deleting}
            sx={{ backgroundColor: '#ef4444', '&:hover': { backgroundColor: '#dc2626' }, textTransform: 'none' }}
            startIcon={deleting ? <CircularProgress size={16} /> : null}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminEquipmentPage;
