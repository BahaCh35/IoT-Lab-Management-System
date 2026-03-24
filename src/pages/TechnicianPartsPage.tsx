import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert } from '@mui/material';
import WidgetsIcon from '@mui/icons-material/Widgets';
import AddIcon from '@mui/icons-material/Add';
import WarningIcon from '@mui/icons-material/Warning';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import { partsService } from '../services/partsService';
import { PartsRequest, User } from '../types';

const TechnicianPartsPage: React.FC = () => {
  const [partsRequests, setPartsRequests] = useState<PartsRequest[]>([]);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [lowStockParts, setLowStockParts] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    totalInventoryItems: 0,
    lowStockItems: 0,
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [partName, setPartName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'approved' | 'arrived'>('all');
  const [searchParts, setSearchParts] = useState('');

  // Mock technician user
  const mockTechnician: User = {
    id: '201',
    name: 'John (Technician)',
    email: 'technician@novation.com',
    role: 'technician',
    createdAt: '2024-01-01',
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load parts requests
      const requests = await partsService.getPartsRequests();
      setPartsRequests(requests);

      // Load inventory
      const inv = await partsService.getComponentInventory();
      // Convert ComponentInventory[] to Record<string, number>
      const inventoryMap: Record<string, number> = {};
      inv.forEach((item) => {
        inventoryMap[item.partName] = item.quantity;
      });
      setInventory(inventoryMap);

      // Load low stock items
      const lowStock = await partsService.getLowStockItems();
      // Extract part names from ComponentInventory[]
      const lowStockNames = lowStock.map((item) => item.partName);
      setLowStockParts(lowStockNames);

      // Load stats
      const statsData = await partsService.getPartsStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading parts data:', error);
    }
  };

  const handleRequestParts = async () => {
    if (!partName || !quantity || !reason) return;

    try {
      await partsService.createPartsRequest({
        technicianId: mockTechnician.id,
        technicianName: mockTechnician.name,
        partName,
        quantity: parseInt(quantity),
        reason,
      });

      setPartName('');
      setQuantity('');
      setReason('');
      setOpenDialog(false);
      loadData();
    } catch (error) {
      console.error('Error creating parts request:', error);
    }
  };

  const handleOpenQuickRequest = (name: string) => {
    setPartName(name);
    setQuantity('');
    setReason('');
    setOpenDialog(true);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'approved':
        return '#3b82f6';
      case 'arrived':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'approved':
        return '✅';
      case 'arrived':
        return '📦';
      default:
        return '❓';
    }
  };

  let filteredRequests = partsRequests;
  if (filterTab === 'pending') {
    filteredRequests = partsRequests.filter((r) => r.status === 'pending');
  } else if (filterTab === 'approved') {
    filteredRequests = partsRequests.filter((r) => r.status === 'approved');
  } else if (filterTab === 'arrived') {
    filteredRequests = partsRequests.filter((r) => r.status === 'arrived');
  }

  if (searchParts) {
    filteredRequests = filteredRequests.filter(
      (r) =>
        r.partName.toLowerCase().includes(searchParts.toLowerCase()) ||
        r.reason.toLowerCase().includes(searchParts.toLowerCase())
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <WidgetsIcon sx={{ fontSize: 32, color: '#1a73e8' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Parts & Inventory
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Request Parts
        </Button>
      </Box>

      {/* Low Stock Alert */}
      {lowStockParts.length > 0 && (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            ⚠️ {lowStockParts.length} Parts Running Low
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
            {lowStockParts.slice(0, 3).join(', ')}
            {lowStockParts.length > 3 && ` and ${lowStockParts.length - 3} more...`}
          </Typography>
        </Alert>
      )}

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <Card sx={{ backgroundColor: '#f3f4f6' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                  Total Requests
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#374151', mt: 0.5 }}>
                  {stats.totalRequests}
                </Typography>
              </Box>
              <ShoppingCartIcon sx={{ fontSize: 40, color: '#6b7280', opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: '#fff3e0' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                  Pending
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b', mt: 0.5 }}>
                  {stats.pendingRequests}
                </Typography>
              </Box>
              <WarningIcon sx={{ fontSize: 40, color: '#f59e0b', opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: '#e3f2fd' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                  Approved
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b82f6', mt: 0.5 }}>
                  {stats.approvedRequests}
                </Typography>
              </Box>
              <CheckCircleIcon sx={{ fontSize: 40, color: '#3b82f6', opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: '#e8f5e9' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                  Part Types
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981', mt: 0.5 }}>
                  {stats.totalInventoryItems}
                </Typography>
              </Box>
              <WidgetsIcon sx={{ fontSize: 40, color: '#10b981', opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Parts Requests Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            {(['all', 'pending', 'approved', 'arrived'] as const).map((tab) => (
              <Button
                key={tab}
                variant={filterTab === tab ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setFilterTab(tab)}
              >
                {tab === 'all' ? `All (${partsRequests.length})` : `${tab.charAt(0).toUpperCase() + tab.slice(1)} (${partsRequests.filter((r) => r.status === tab).length})`}
              </Button>
            ))}
          </Box>

          {/* Search bar */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search part name or reason..."
              value={searchParts}
              onChange={(e) => setSearchParts(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: '#6b7280' }} /> }}
              sx={{ minWidth: 280, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            {searchParts && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => setSearchParts('')}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Clear
              </Button>
            )}
            {searchParts && (
              <Typography variant="caption" sx={{ color: '#6b7280', alignSelf: 'center' }}>
                {filteredRequests.length} of {partsRequests.filter((r) => filterTab === 'all' || r.status === filterTab).length} requests
              </Typography>
            )}
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            {getStatusIcon(filterTab)} Parts Requests
          </Typography>
          <TableContainer component={Paper} sx={{ backgroundColor: '#f8fafc' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Part Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Requested</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Approved By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => (
                    <TableRow key={req.id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {req.partName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={req.quantity} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{req.reason}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={req.status.toUpperCase()}
                          size="small"
                          sx={{ backgroundColor: getStatusColor(req.status), color: 'white' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{new Date(req.requestedDate).toLocaleDateString()}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{req.approvedBy?.name || '-'}</Typography>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        No {filterTab !== 'all' ? filterTab : ''} part requests
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Component Inventory */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            📦 Component Inventory ({Object.keys(inventory).length} types)
          </Typography>
          <TableContainer component={Paper} sx={{ backgroundColor: '#f8fafc' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Part Name</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Stock
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Quick Request</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(inventory)
                  .slice(0, 15)
                  .map(([partName, stock]) => {
                    const isLow = stock < 10;
                    return (
                      <TableRow key={partName} sx={{ '&:hover': { backgroundColor: '#f9fafb' }, backgroundColor: isLow ? '#fff5f5' : 'transparent' }}>
                        <TableCell>
                          <Typography variant="body2">{partName}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip label={stock.toString()} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          {isLow ? (
                            <Chip label="Low Stock ⚠️" size="small" sx={{ backgroundColor: '#fee2e2', color: '#ef4444' }} />
                          ) : (
                            <Chip label="Available ✅" size="small" sx={{ backgroundColor: '#e8f5e9', color: '#10b981' }} />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant={isLow ? 'contained' : 'outlined'}
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenQuickRequest(partName)}
                            sx={{
                              textTransform: 'none',
                              borderRadius: 2,
                              ...(isLow && { backgroundColor: '#ef4444', '&:hover': { backgroundColor: '#dc2626' } }),
                            }}
                          >
                            Request
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="caption" sx={{ display: 'block', mt: 2, color: '#6b7280' }}>
            Showing 15 of {Object.keys(inventory).length} parts. Click "Request" on any row to quickly submit a parts request.
          </Typography>
        </CardContent>
      </Card>

      {/* Request Parts Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Parts</DialogTitle>
        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Part Name"
            value={partName}
            onChange={(e) => setPartName(e.target.value)}
            fullWidth
            placeholder="e.g., Resistor 1K Ohm"
            helperText="Specify the exact part name or part number"
          />

          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            fullWidth
            inputProps={{ min: '1' }}
          />

          <TextField
            label="Reason/Justification"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="Why do you need this part? Which maintenance tasks require it?"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleRequestParts} variant="contained" color="primary">
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TechnicianPartsPage;
