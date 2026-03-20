import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Paper,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory2';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Equipment, Checkout } from '../types';
import { checkoutService } from '../services/checkoutService';

const EngineerCheckoutPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [activeCheckouts, setActiveCheckouts] = useState<Checkout[]>([]);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [checkoutNotes, setCheckoutNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Mock current user
  const currentUser = {
    id: '101',
    name: 'Ahmed',
    email: 'engineer@novation.com',
    role: 'engineer' as const,
    createdAt: '2024-01-01',
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allEquipment = checkoutService.getEquipment();
    setEquipment(allEquipment);

    const myActiveCheckouts = checkoutService.getUserActiveCheckouts(currentUser.id);
    setActiveCheckouts(myActiveCheckouts);
  };

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const isAvailable = item.status === 'available';
    return matchesSearch && matchesCategory && isAvailable;
  });

  const handleOpenCheckoutDialog = (eq: Equipment) => {
    setSelectedEquipment(eq);
    setExpectedReturnDate('');
    setCheckoutNotes('');
    setCheckoutDialogOpen(true);
  };

  const handleCloseCheckoutDialog = () => {
    setCheckoutDialogOpen(false);
    setSelectedEquipment(null);
    setExpectedReturnDate('');
    setCheckoutNotes('');
  };

  const handleConfirmCheckout = () => {
    if (!selectedEquipment || !expectedReturnDate) {
      setErrorMessage('Please select a return date');
      return;
    }

    try {
      const returnDate = new Date(expectedReturnDate);
      if (returnDate <= new Date()) {
        setErrorMessage('Return date must be in the future');
        return;
      }

      checkoutService.checkoutEquipment(
        selectedEquipment.id,
        currentUser.id,
        currentUser.name,
        new Date(expectedReturnDate).toISOString(),
        checkoutNotes || undefined
      );

      setSuccessMessage(`✅ ${selectedEquipment.name} checked out successfully!`);
      loadData();
      handleCloseCheckoutDialog();

      // Clear message after 4 seconds
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to checkout equipment');
    }
  };

  const handleReturnEquipment = (checkoutId: string) => {
    try {
      checkoutService.checkInEquipment(checkoutId);
      setSuccessMessage('✅ Equipment returned successfully!');
      loadData();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to return equipment');
    }
  };

  const getStatusColor = (status: Equipment['status']): string => {
    switch (status) {
      case 'available':
        return '#10b981';
      case 'checked-out':
        return '#f59e0b';
      case 'maintenance':
        return '#ef4444';
      case 'damaged':
        return '#7f1d1d';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: Equipment['status']): string => {
    switch (status) {
      case 'available':
        return 'Available ✅';
      case 'checked-out':
        return 'Checked Out 📤';
      case 'maintenance':
        return 'Maintenance 🔧';
      case 'damaged':
        return 'Damaged ❌';
      default:
        return status;
    }
  };

  const getCategoryLabel = (category: Equipment['category']): string => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const stats = checkoutService.getCheckoutStats();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <ShoppingCartIcon sx={{ fontSize: 32, color: '#1a73e8' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Checkout Equipment
        </Typography>
      </Box>

      {/* Messages */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      {/* Quick Stats */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        <Card sx={{ backgroundColor: '#e8f5e9' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                  Available Equipment
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981', mt: 0.5 }}>
                  {equipment.filter((e) => e.status === 'available').length}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: '#fff3e0' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                  My Active Checkouts
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b', mt: 0.5 }}>
                  {activeCheckouts.length}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: '#e3f2fd' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                  Total Equipment
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b82f6', mt: 0.5 }}>
                  {equipment.length}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: '#f3e5f5' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                  Overdue Items
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ec4899', mt: 0.5 }}>
                  {checkoutService.getOverdueCheckouts().length}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mb: 3 }}>
        <TextField
          label="Search Equipment"
          placeholder="Arduino, Oscilloscope, Sensor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: '#6b7280' }} /> }}
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <Select value={categoryFilter} label="Category" onChange={(e) => setCategoryFilter(e.target.value)}>
            <MenuItem value="">All Categories</MenuItem>
            <MenuItem value="microcontroller">Microcontroller</MenuItem>
            <MenuItem value="sensor">Sensor</MenuItem>
            <MenuItem value="tool">Tool</MenuItem>
            <MenuItem value="component">Component</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Available Equipment Table */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            📦 Available Equipment ({filteredEquipment.length})
          </Typography>
          <TableContainer component={Paper} sx={{ backgroundColor: '#f8fafc' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Equipment Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Last Used By</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Usage Count</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEquipment.length > 0 ? (
                  filteredEquipment.map((item) => (
                    <TableRow key={item.id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                          {item.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getCategoryLabel(item.category)}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {item.location.building}, {item.location.room}
                          <br />
                          {item.location.cabinet}, {item.location.drawer}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{item.lastUsedBy || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {item.usageCount}x
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={() => handleOpenCheckoutDialog(item)}
                        >
                          Checkout
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        No equipment found matching your filters
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* My Active Checkouts */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            📋 My Active Checkouts ({activeCheckouts.length})
          </Typography>
          <TableContainer component={Paper} sx={{ backgroundColor: '#f8fafc' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Equipment</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Checkout Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Expected Return</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeCheckouts.length > 0 ? (
                  activeCheckouts.map((checkout) => {
                    const eq = equipment.find((e) => e.id === checkout.equipmentId);
                    const expectedDate = new Date(checkout.expectedReturnDate);
                    const isOverdue = expectedDate < new Date();

                    return (
                      <TableRow key={checkout.id} sx={{ backgroundColor: isOverdue ? '#fff5f5' : 'transparent' }}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {eq?.name || 'Unknown Equipment'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {new Date(checkout.checkoutDate).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="caption"
                            sx={{
                              color: isOverdue ? '#ef4444' : '#6b7280',
                              fontWeight: isOverdue ? 600 : 400,
                            }}
                          >
                            {new Date(checkout.expectedReturnDate).toLocaleDateString()}
                            {isOverdue && ' (OVERDUE)'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label="Active"
                            size="small"
                            sx={{ backgroundColor: '#10b98120', color: '#10b981' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{checkout.notes || '-'}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleReturnEquipment(checkout.id)}
                          >
                            Return
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        No active checkouts. All equipment is available for checkout!
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Checkout Dialog */}
      <Dialog open={checkoutDialogOpen} onClose={handleCloseCheckoutDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Checkout Equipment</DialogTitle>
        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {selectedEquipment && (
            <>
              {/* Equipment Info */}
              <Box sx={{ p: 2, backgroundColor: '#f3f4f6', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#6b7280', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  Equipment Details
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {selectedEquipment.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                  {selectedEquipment.description}
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280' }}>
                      QR Code
                    </Typography>
                    <Typography variant="caption">{selectedEquipment.qrCode}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280' }}>
                      Category
                    </Typography>
                    <Typography variant="caption">{getCategoryLabel(selectedEquipment.category)}</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Location Info */}
              <Box sx={{ p: 2, backgroundColor: '#f0f4ff', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  Current Location
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {selectedEquipment.location.building}, {selectedEquipment.location.room}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  {selectedEquipment.location.cabinet}, {selectedEquipment.location.drawer}
                </Typography>
              </Box>

              {/* Return Date Selection */}
              <TextField
                label="Expected Return Date"
                type="datetime-local"
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: new Date(Date.now() + 10 * 60 * 1000).toISOString().slice(0, 16),
                }}
              />

              {/* Notes */}
              <TextField
                label="Notes (Optional)"
                value={checkoutNotes}
                onChange={(e) => setCheckoutNotes(e.target.value)}
                fullWidth
                multiline
                rows={2}
                placeholder="Add any notes about your checkout..."
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCheckoutDialog}>Cancel</Button>
          <Button onClick={handleConfirmCheckout} variant="contained" color="primary">
            Confirm Checkout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EngineerCheckoutPage;
