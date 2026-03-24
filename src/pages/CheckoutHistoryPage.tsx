import React, { useState, useMemo } from 'react';
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
  Chip,
  Paper,
  TextField,
  Button,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import DownloadIcon from '@mui/icons-material/Download';
import { Checkout, Equipment } from '../types';
import { checkoutService } from '../services/checkoutService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`checkout-tabpanel-${index}`}
      aria-labelledby={`checkout-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

const CheckoutHistoryPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [dateFilterStart, setDateFilterStart] = useState('');
  const [dateFilterEnd, setDateFilterEnd] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('');
  const [allCheckouts, setAllCheckouts] = useState<Checkout[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  // Mock current user
  const currentUser = {
    id: '101',
    name: 'Ahmed',
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [checkouts, equipmentData] = await Promise.all([
        checkoutService.getCheckouts(),
        checkoutService.getEquipment()
      ]);
      setAllCheckouts(checkouts);
      setEquipment(equipmentData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadCheckouts = async () => {
    try {
      const checkouts = await checkoutService.getCheckouts();
      setAllCheckouts(checkouts);
    } catch (error) {
      console.error('Error loading checkouts:', error);
    }
  };

  // Filter checkouts based on tab and date range
  const filteredCheckouts = useMemo(() => {
    let filtered = allCheckouts.filter((c) => c.userId === currentUser.id);

    // Apply tab filter
    if (tabValue === 1) {
      filtered = filtered.filter((c) => c.status === 'active');
    } else if (tabValue === 2) {
      filtered = filtered.filter((c) => c.status === 'returned');
    }

    // Apply date range filter
    if (dateFilterStart) {
      const startDate = new Date(dateFilterStart);
      filtered = filtered.filter((c) => new Date(c.checkoutDate) >= startDate);
    }

    if (dateFilterEnd) {
      const endDate = new Date(dateFilterEnd);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((c) => new Date(c.checkoutDate) <= endDate);
    }

    // Apply equipment filter
    if (equipmentFilter) {
      filtered = filtered.filter((c) => c.equipmentId.includes(equipmentFilter));
    }

    return filtered.sort(
      (a, b) => new Date(b.checkoutDate).getTime() - new Date(a.checkoutDate).getTime()
    );
  }, [allCheckouts, tabValue, dateFilterStart, dateFilterEnd, equipmentFilter]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string): string => {
    return status === 'active' ? '#10b981' : '#6b7280';
  };

  const getStatusLabel = (status: string): string => {
    return status === 'active' ? 'Active ✅' : 'Returned 📦';
  };

  // Get equipment names from loaded equipment data
  const getEquipmentName = (equipmentId: string): string => {
    const eq = equipment.find(e => e.id === equipmentId);
    return eq?.name || 'Unknown Equipment';
  };

  // Calculate statistics
  const stats = {
    totalCheckouts: allCheckouts.filter((c) => c.userId === currentUser.id).length,
    activeCheckouts: allCheckouts.filter((c) => c.userId === currentUser.id && c.status === 'active').length,
    returnedCheckouts: allCheckouts.filter(
      (c) => c.userId === currentUser.id && c.status === 'returned'
    ).length,
    overdueCheckouts: allCheckouts.filter((c) => {
      if (c.userId !== currentUser.id || c.status !== 'active') return false;
      return new Date(c.expectedReturnDate) < new Date();
    }).length,
  };

  const handleExportCSV = () => {
    const csv = [
      ['Equipment', 'Checkout Date', 'Expected Return', 'Actual Return', 'Status', 'Notes'],
      ...filteredCheckouts.map((c) => [
        getEquipmentName(c.equipmentId),
        new Date(c.checkoutDate).toLocaleDateString(),
        new Date(c.expectedReturnDate).toLocaleDateString(),
        c.actualReturnDate ? new Date(c.actualReturnDate).toLocaleDateString() : '-',
        c.status,
        c.notes || '',
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checkout-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <HistoryIcon sx={{ fontSize: 32, color: '#1a73e8' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Checkout History
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={handleExportCSV}
          disabled={filteredCheckouts.length === 0}
        >
          Export CSV
        </Button>
      </Box>

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
                <Typography
                  variant="caption"
                  sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}
                >
                  Total Checkouts
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981', mt: 0.5 }}>
                  {stats.totalCheckouts}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: '#fff3e0' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}
                >
                  Active Checkouts
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b', mt: 0.5 }}>
                  {stats.activeCheckouts}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: '#e3f2fd' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}
                >
                  Returned Items
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b82f6', mt: 0.5 }}>
                  {stats.returnedCheckouts}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: '#fee2e2' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}
                >
                  Overdue Items
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ef4444', mt: 0.5 }}>
                  {stats.overdueCheckouts}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            🔍 Filter Results
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              value={dateFilterStart}
              onChange={(e) => setDateFilterStart(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="End Date"
              type="date"
              value={dateFilterEnd}
              onChange={(e) => setDateFilterEnd(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Equipment Filter</InputLabel>
              <Select
                value={equipmentFilter}
                label="Equipment Filter"
                onChange={(e) => setEquipmentFilter(e.target.value)}
              >
                <MenuItem value="">All Equipment</MenuItem>
                {Array.from(new Set(allCheckouts.map((c) => c.equipmentId))).map((eqId) => (
                  <MenuItem key={eqId} value={eqId}>
                    {getEquipmentName(eqId)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button variant="outlined" color="primary" onClick={() => { setDateFilterStart(''); setDateFilterEnd(''); setEquipmentFilter(''); }}>
              Clear Filters
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="checkout status tabs"
            sx={{ px: 2 }}
          >
            <Tab label={`All Checkouts (${allCheckouts.filter((c) => c.userId === currentUser.id).length})`} />
            <Tab label={`Active (${stats.activeCheckouts})`} />
            <Tab label={`Returned (${stats.returnedCheckouts})`} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <CheckoutTable checkouts={filteredCheckouts} getEquipmentName={getEquipmentName} getStatusColor={getStatusColor} getStatusLabel={getStatusLabel} />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <CheckoutTable checkouts={filteredCheckouts} getEquipmentName={getEquipmentName} getStatusColor={getStatusColor} getStatusLabel={getStatusLabel} />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <CheckoutTable checkouts={filteredCheckouts} getEquipmentName={getEquipmentName} getStatusColor={getStatusColor} getStatusLabel={getStatusLabel} />
        </TabPanel>
      </Card>
    </Box>
  );
};

// Separate component for the checkout table
interface CheckoutTableProps {
  checkouts: Checkout[];
  getEquipmentName: (id: string) => string;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
}

const CheckoutTable: React.FC<CheckoutTableProps> = ({
  checkouts,
  getEquipmentName,
  getStatusColor,
  getStatusLabel,
}) => {
  return (
    <CardContent>
      <TableContainer component={Paper} sx={{ backgroundColor: '#f8fafc' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
              <TableCell sx={{ fontWeight: 600 }}>Equipment</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Checkout Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Expected Return</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actual Return</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {checkouts.length > 0 ? (
              checkouts.map((checkout) => {
                const checkoutDate = new Date(checkout.checkoutDate);
                const returnDate = checkout.actualReturnDate
                  ? new Date(checkout.actualReturnDate)
                  : new Date(checkout.expectedReturnDate);
                const days = Math.ceil((returnDate.getTime() - checkoutDate.getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <TableRow key={checkout.id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {getEquipmentName(checkout.equipmentId)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{checkoutDate.toLocaleDateString()}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(checkout.expectedReturnDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {checkout.actualReturnDate
                          ? new Date(checkout.actualReturnDate).toLocaleDateString()
                          : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={`${days} days`} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(checkout.status)}
                        size="small"
                        sx={{ backgroundColor: getStatusColor(checkout.status) + '20', color: getStatusColor(checkout.status) }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{checkout.notes || '-'}</Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    No checkout records found matching your filters
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </CardContent>
  );
};

export default CheckoutHistoryPage;
