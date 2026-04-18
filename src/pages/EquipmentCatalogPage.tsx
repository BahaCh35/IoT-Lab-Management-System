import React, { useState, useEffect } from 'react';
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
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { checkoutStore } from '../services/checkoutStore';
import { approvalService } from '../services/approvalService';
import { equipmentService } from '../services/equipmentService';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HistoryIcon from '@mui/icons-material/History';
import InventoryIcon from '@mui/icons-material/Inventory2';
import WarningIcon from '@mui/icons-material/Warning';
import BuildIcon from '@mui/icons-material/Build';

const CATEGORIES = ['All', 'microcontroller', 'tool', 'component', 'sensor', 'computer'];

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

type ItemActionState = 'none' | 'reserved' | 'checked-out';

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  status: string;
  location: string;
  specifications: Record<string, string>;
  totalUnits: number;
  availableUnits: number;
  lastUsedBy?: string;
  lastUsedDate?: string;
  rating: number;
}

// Shared compact button style matching the original storage design
const actionBtnSx = {
  textTransform: 'none',
  fontSize: 13,
  py: 0.6,
  flex: 1,
};

interface CheckoutDialogProps {
  open: boolean;
  equipment?: EquipmentItem;
  onClose: () => void;
  onConfirm: (qty: number, returnDate: string) => void;
}

const CheckoutDialog: React.FC<CheckoutDialogProps> = ({ open, equipment, onClose, onConfirm }) => {
  const [qty, setQty] = useState(1);
  const [returnDate, setReturnDate] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const max = equipment?.availableUnits ?? 1;

  const handleClose = () => { onClose(); setQty(1); setReturnDate(''); };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Check Out Equipment</DialogTitle>
      <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" sx={{ color: '#374151' }}>
          Item: <strong>{equipment?.name}</strong>
        </Typography>
        <TextField
          label="Quantity"
          type="number"
          fullWidth
          value={qty}
          onChange={(e) => setQty(Math.min(max, Math.max(1, Number(e.target.value))))}
          inputProps={{ min: 1, max }}
          helperText={`Max available: ${max}`}
        />
        <TextField
          label="Return By"
          type="date"
          fullWidth
          value={returnDate}
          onChange={(e) => setReturnDate(e.target.value)}
          inputProps={{ min: today }}
          InputLabelProps={{ shrink: true }}
          helperText="Select a return date"
        />
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!returnDate}
          onClick={() => { onConfirm(qty, returnDate); setQty(1); setReturnDate(''); }}
          sx={{ backgroundColor: '#1a73e8', '&:hover': { backgroundColor: '#1557b0' } }}
        >
          Check Out
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface ReserveDialogProps {
  open: boolean;
  equipment?: EquipmentItem;
  onClose: () => void;
  onConfirm: (date: string, qty: number) => void;
}

const ReserveDialog: React.FC<ReserveDialogProps> = ({ open, equipment, onClose, onConfirm }) => {
  const [reserveDate, setReserveDate] = useState('');
  const [qty, setQty] = useState(1);
  const today = new Date().toISOString().split('T')[0];
  const max = equipment?.availableUnits ?? 1;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Reserve Equipment</DialogTitle>
      <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" sx={{ color: '#374151' }}>
          Item: <strong>{equipment?.name}</strong>
        </Typography>
        <TextField
          label="Quantity"
          type="number"
          fullWidth
          value={qty}
          onChange={(e) => setQty(Math.min(max, Math.max(1, Number(e.target.value))))}
          inputProps={{ min: 1, max }}
          helperText={`Max available: ${max}`}
        />
        <TextField
          label="Reservation Date"
          type="date"
          fullWidth
          value={reserveDate}
          onChange={(e) => setReserveDate(e.target.value)}
          inputProps={{ min: today }}
          InputLabelProps={{ shrink: true }}
        />
        <Typography variant="caption" sx={{ color: '#6b7280' }}>
          Your reservation will be sent to the admin for approval.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={() => { onClose(); setReserveDate(''); setQty(1); }}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!reserveDate}
          onClick={() => { onConfirm(reserveDate, qty); setReserveDate(''); setQty(1); }}
          sx={{ backgroundColor: '#7c3aed', '&:hover': { backgroundColor: '#6a1b9a' } }}
        >
          Submit Reserve
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface EquipmentDetailsDialogProps {
  open: boolean;
  equipment?: EquipmentItem;
  onClose: () => void;
  itemState: ItemActionState;
  onCheckout: (equipment: EquipmentItem) => void;
  onReserve: (equipment: EquipmentItem) => void;
  onReturn: (id: string) => void;
}

const EquipmentDetailsDialog: React.FC<EquipmentDetailsDialogProps> = ({
  open,
  equipment,
  onClose,
  itemState,
  onCheckout,
  onReserve,
  onReturn,
}) => {
  const canAct = equipment?.status === 'available' && (equipment?.availableUnits ?? 0) > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Equipment Details</DialogTitle>
      <DialogContent dividers>
        {equipment && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {equipment.name}
              </Typography>
              <Chip
                label={STATUS_LABELS[equipment.status]}
                size="small"
                sx={{ backgroundColor: STATUS_COLORS[equipment.status], color: 'white' }}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Location</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon sx={{ fontSize: 20, color: '#6b7280' }} />
                <Typography variant="body2">{equipment.location}</Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Availability</Typography>
              <Typography variant="body2">
                {equipment.availableUnits} / {equipment.totalUnits} units available
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Specifications</Typography>
              <Box sx={{ backgroundColor: '#f9fafb', p: 1.5, borderRadius: 1 }}>
                {Object.entries(equipment.specifications).map(([key, value]) => (
                  <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>{key}:</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 500 }}>{value}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {equipment.lastUsedBy && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Last Used</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HistoryIcon sx={{ fontSize: 18, color: '#6b7280' }} />
                  <Typography variant="caption">
                    {equipment.lastUsedBy} on {equipment.lastUsedDate}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ gap: 1, px: 2, pb: 2 }}>
        <Button onClick={onClose} sx={{ mr: 'auto' }}>Close</Button>
        {canAct && itemState === 'none' && (
          <>
            <Button
              variant="contained"
              onClick={() => { onCheckout(equipment!); onClose(); }}
              sx={{ backgroundColor: '#1a73e8', '&:hover': { backgroundColor: '#1557b0' } }}
            >
              Check Out
            </Button>
            <Button
              variant="outlined"
              onClick={() => { onReserve(equipment!); onClose(); }}
              sx={{ borderColor: '#7c3aed', color: '#7c3aed', '&:hover': { borderColor: '#6a1b9a', backgroundColor: '#f3e5f5' } }}
            >
              Reserve
            </Button>
          </>
        )}
        {canAct && itemState === 'reserved' && (
          <Button
            variant="contained"
            onClick={() => { onCheckout(equipment!); onClose(); }}
            sx={{ backgroundColor: '#1a73e8', '&:hover': { backgroundColor: '#1557b0' } }}
          >
            Check Out
          </Button>
        )}
        {itemState === 'checked-out' && (
          <Button
            variant="outlined"
            color="success"
            onClick={() => { onReturn(equipment!.id); onClose(); }}
          >
            Return
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

const EquipmentCatalogPage: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [reserveDialogOpen, setReserveDialogOpen] = useState(false);
  const [actionTarget, setActionTarget] = useState<EquipmentItem | undefined>();
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  const fetchEquipment = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await equipmentService.getEquipment();
      const mappedData: EquipmentItem[] = data.map((item) => {
        const loc = item.location;
        const locationString = loc
            ? `${loc.building}, Room ${loc.room}${loc.cabinet ? `, Cabinet ${loc.cabinet}` : ''}${loc.drawer ? `, Drawer ${loc.drawer}` : ''}`
            : 'Unknown';

        return {
          id: String(item.id),
          name: item.name,
          category: item.category,
          status: item.status,
          location: locationString,
          specifications: item.specifications || {},
          totalUnits: 1, // Fallback defaults until backend supports multi-unit
          availableUnits: item.status === 'available' ? 1 : 0,
          lastUsedBy: item.lastUsedBy,
          lastUsedDate: item.lastUsedDate,
          rating: 5, // Fallback default
        };
      });
      setEquipmentList(mappedData);

      // Initialise per-card state from store so returning to this page shows correct buttons
      const stored = checkoutStore.getItems();
      const initialStates: Record<string, ItemActionState> = {};
      mappedData.forEach((e) => {
        if (stored.some((s) => s.equipmentId === e.id)) initialStates[e.id] = 'checked-out';
      });
      setItemStates(initialStates);

    } catch (err: any) {
      console.error('Failed to fetch equipment:', err);
      setError('Failed to load equipment catalog. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const [itemStates, setItemStates] = useState<Record<string, ItemActionState>>({});

  const setItemState = (id: string, state: ItemActionState) =>
    setItemStates((prev) => ({ ...prev, [id]: state }));

  const filteredEquipment = equipmentList.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleEquipmentClick = (equipment: EquipmentItem) => {
    setSelectedEquipment(equipment);
    setDialogOpen(true);
  };

  const openCheckout = (equipment: EquipmentItem) => {
    setActionTarget(equipment);
    setCheckoutDialogOpen(true);
  };

  const openReserve = (equipment: EquipmentItem) => {
    setActionTarget(equipment);
    setReserveDialogOpen(true);
  };

  const handleCheckoutConfirm = async (qty: number, returnDate: string) => {
    if (!actionTarget) return;
    try {
      // API Checkout interaction (assuming structure for demonstration if valid endpoint, using mock checkoutStore otherwise for consistency)
      // await checkoutService.checkoutEquipment(...)
      checkoutStore.addItem(actionTarget.id, actionTarget.name, qty, returnDate);
      setItemState(actionTarget.id, 'checked-out');
      const label = new Date(returnDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      setSnackMsg(`Checked out ${qty}× ${actionTarget.name} — return by ${label}`);
      setSnackOpen(true);
      setCheckoutDialogOpen(false);
    } catch (err) {
      setSnackMsg('Failed to check out equipment.');
      setSnackOpen(true);
    }
  };

  const handleReserveConfirm = async (date: string, qty: number) => {
    if (!actionTarget) return;
    try {
      await approvalService.createApproval({
        type: 'equipment-reservation',
        requester: { id: 'current-engineer', name: 'My Profile', email: 'engineer@novation.com', role: 'engineer', createdAt: new Date().toISOString() },
        description: `Equipment reservation: ${qty}× ${actionTarget.name} on ${date}`,
        details: { equipmentId: actionTarget.id, equipmentName: actionTarget.name, quantity: qty, reservationDate: date },
        priority: 'medium',
      });
      setItemState(actionTarget.id, 'reserved');
      setSnackMsg(`Reservation submitted: ${qty}× ${actionTarget.name} on ${date} — pending admin approval.`);
      setSnackOpen(true);
      setReserveDialogOpen(false);
    } catch (err) {
      setSnackMsg('Failed to reserve equipment.');
      setSnackOpen(true);
    }
  };

  const handleReturn = (id: string) => {
    checkoutStore.removeByEquipmentId(id);
    setItemState(id, 'none');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <InventoryIcon sx={{ fontSize: 32, color: '#1a73e8' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Equipment Catalog
        </Typography>
      </Box>

      {/* Stats */}
      {(() => {
        const totalUnits = equipmentList.reduce((s: number, e: EquipmentItem) => s + e.totalUnits, 0);
        const availableUnits = equipmentList.reduce((s: number, e: EquipmentItem) => s + e.availableUnits, 0);
        const checkedOut = equipmentList.filter((e: EquipmentItem) => e.status === 'checked-out').length;
        const inMaintenance = equipmentList.filter((e: EquipmentItem) => e.status === 'maintenance').length;
        const stats = [
          { label: 'Total Equipment', value: totalUnits, icon: <InventoryIcon sx={{ fontSize: 26 }} />, bg: '#e8f0fe', color: '#1a73e8' },
          { label: 'Available Units', value: availableUnits, icon: <CheckCircleIcon sx={{ fontSize: 26 }} />, bg: '#e8f5e9', color: '#10b981' },
          { label: 'Checked Out', value: checkedOut, icon: <BuildIcon sx={{ fontSize: 26 }} />, bg: '#dbeafe', color: '#3b82f6' },
          { label: 'In Maintenance', value: inMaintenance, icon: <WarningIcon sx={{ fontSize: 26 }} />, bg: '#fef3c7', color: '#f59e0b' },
        ];
        return (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
            {stats.map((s) => (
              <Card key={s.label} sx={{ border: `1px solid ${s.color}22` }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: '14px !important' }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 2, backgroundColor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                    {s.icon}
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, display: 'block' }}>{s.label}</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: s.color, lineHeight: 1.2 }}>{s.value}</Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        );
      })()}

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
          <Select value={selectedCategory} label="Category" onChange={(e) => setSelectedCategory(e.target.value)}>
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select value={selectedStatus} label="Status" onChange={(e) => setSelectedStatus(e.target.value)}>
            <MenuItem value="All">All Statuses</MenuItem>
            <MenuItem value="available">Available</MenuItem>
            <MenuItem value="checked-out">Checked Out</MenuItem>
            <MenuItem value="maintenance">In Maintenance</MenuItem>
            <MenuItem value="damaged">Damaged</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Equipment Grid */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
          {filteredEquipment.map((equipment: EquipmentItem) => {
            const canAct = equipment.status === 'available' && equipment.availableUnits > 0;
            const state = itemStates[equipment.id] || 'none';
            return (
              <Card
                key={equipment.id}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.12)' },
                }}
                onClick={() => handleEquipmentClick(equipment)}
              >
              <Box sx={{ height: 4, backgroundColor: STATUS_COLORS[equipment.status] }} />

              <CardContent sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>{equipment.name}</Typography>
                  {equipment.status === 'available'
                    ? <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />
                    : <ErrorIcon sx={{ color: STATUS_COLORS[equipment.status], fontSize: 20 }} />}
                </Box>

                <Chip
                  label={STATUS_LABELS[equipment.status]}
                  size="small"
                  sx={{ backgroundColor: STATUS_COLORS[equipment.status], color: 'white', mb: 2 }}
                />

                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <LocationOnIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>{equipment.location}</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    {equipment.availableUnits}/{equipment.totalUnits} Available
                  </Typography>
                </Box>
              </CardContent>

              {/* Action buttons — same compact stacked style as storage */}
              <CardActions sx={{ pt: 0, px: 1.5, pb: 1.5 }} onClick={(e) => e.stopPropagation()}>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5, width: '100%' }}>
                  {canAct && state === 'none' && (
                    <>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={(e) => { e.stopPropagation(); openCheckout(equipment); }}
                        sx={{ ...actionBtnSx, backgroundColor: '#1a73e8', '&:hover': { backgroundColor: '#1557b0' } }}
                      >
                        Check Out
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => { e.stopPropagation(); openReserve(equipment); }}
                        sx={{ ...actionBtnSx, borderColor: '#7c3aed', color: '#7c3aed', '&:hover': { borderColor: '#6a1b9a', backgroundColor: '#f3e5f5' } }}
                      >
                        Reserve
                      </Button>
                    </>
                  )}

                  {canAct && state === 'reserved' && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={(e) => { e.stopPropagation(); openCheckout(equipment); }}
                      sx={{ ...actionBtnSx, backgroundColor: '#1a73e8', '&:hover': { backgroundColor: '#1557b0' } }}
                    >
                      Check Out
                    </Button>
                  )}

                  {state === 'checked-out' && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      onClick={(e) => { e.stopPropagation(); handleReturn(equipment.id); }}
                      sx={actionBtnSx}
                    >
                      Return
                    </Button>
                  )}

                  {!canAct && state === 'none' && (
                    <Button size="small" variant="outlined" disabled sx={actionBtnSx}>
                      Unavailable
                    </Button>
                  )}
                </Box>
              </CardActions>
            </Card>
          );
        })}
        </Box>
      )}

      {/* Equipment Details Dialog */}
      <EquipmentDetailsDialog
        open={dialogOpen}
        equipment={selectedEquipment}
        onClose={() => setDialogOpen(false)}
        itemState={selectedEquipment ? (itemStates[selectedEquipment.id] || 'none') : 'none'}
        onCheckout={openCheckout}
        onReserve={openReserve}
        onReturn={handleReturn}
      />

      {/* Checkout Dialog */}
      <CheckoutDialog
        open={checkoutDialogOpen}
        equipment={actionTarget}
        onClose={() => setCheckoutDialogOpen(false)}
        onConfirm={handleCheckoutConfirm}
      />

      {/* Reserve Dialog */}
      <ReserveDialog
        open={reserveDialogOpen}
        equipment={actionTarget}
        onClose={() => setReserveDialogOpen(false)}
        onConfirm={handleReserveConfirm}
      />

      {/* Checkout Notification */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackOpen(false)} severity="success" sx={{ width: '100%' }}>
          {snackMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EquipmentCatalogPage;
