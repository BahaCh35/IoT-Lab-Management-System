import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  InputAdornment,
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

// Mock data
const activeCheckouts = [
  {
    id: '1',
    equipment: 'Arduino Uno',
    user: 'Ahmed',
    checkoutDate: '2024-02-15 10:30',
    expectedReturnDate: '2024-02-20',
    daysRemaining: 3,
    status: 'active',
  },
  {
    id: '2',
    equipment: 'Oscilloscope',
    user: 'Asma',
    checkoutDate: '2024-02-15 09:15',
    expectedReturnDate: '2024-02-16',
    daysRemaining: 0,
    status: 'overdue',
  },
  {
    id: '3',
    equipment: 'Raspberry Pi 4',
    user: 'Ali',
    checkoutDate: '2024-02-13 14:20',
    expectedReturnDate: '2024-02-19',
    daysRemaining: 5,
    status: 'active',
  },
];

const returnedCheckouts = [
  {
    id: '4',
    equipment: 'Digital Multimeter',
    user: 'Nada',
    checkoutDate: '2024-02-10 11:00',
    returnDate: '2024-02-12 15:30',
    daysUsed: 2,
    status: 'returned',
  },
  {
    id: '5',
    equipment: 'Soldering Iron',
    user: 'Yomna',
    checkoutDate: '2024-02-08 09:00',
    returnDate: '2024-02-08 16:00',
    daysUsed: 0,
    status: 'returned',
  },
];

interface CheckoutConfirmDialogProps {
  open: boolean;
  qrCode?: string;
  onClose: () => void;
  onConfirm: (returnDate: string) => void;
}

const CheckoutConfirmDialog: React.FC<CheckoutConfirmDialogProps> = ({ open, qrCode, onClose, onConfirm }) => {
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);

  const handleConfirm = () => {
    onConfirm(returnDate);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirm Checkout</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Alert severity="info">
            Equipment found: <strong>Arduino Uno</strong>
          </Alert>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              QR Code
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#6b7280' }}>
              {qrCode}
            </Typography>
          </Box>

          <TextField
            type="date"
            label="Expected Return Date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Additional Notes"
            placeholder="Any special notes or conditions..."
            multiline
            rows={3}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleConfirm}>
          Confirm Checkout
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const CheckoutCheckinPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [qrInput, setQrInput] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleQRScan = () => {
    if (qrInput.trim()) {
      setDialogOpen(true);
    }
  };

  const handleCheckoutConfirm = (returnDate: string) => {
    setSuccess(true);
    setQrInput('');
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleReturn = (checkoutId: string) => {
    alert(`Returned equipment for checkout ID: ${checkoutId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Check-out / Check-in
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7280' }}>
          Manage equipment checkouts and returns using QR codes or manual search.
        </Typography>
      </Box>

      {/* Success Alert */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(false)}>
          Equipment checked out successfully!
        </Alert>
      )}

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{
            borderBottom: '1px solid #e5e7eb',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
            },
          }}
        >
          <Tab label="Check Out" />
          <Tab label="Check In" />
          <Tab label="Active Checkouts" />
          <Tab label="Return History" />
        </Tabs>

        {/* Check Out Tab */}
        {tabValue === 0 && (
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Scan QR Code
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Scan QR code or enter equipment ID..."
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleQRScan()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <QrCodeScannerIcon sx={{ color: '#6b7280' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Button
                variant="contained"
                size="large"
                onClick={handleQRScan}
                disabled={!qrInput.trim()}
                startIcon={<QrCodeScannerIcon />}
              >
                Scan & Checkout
              </Button>

              <TypeSeparator />

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Quick Search
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    fullWidth
                    placeholder="Equipment name..."
                    size="small"
                  />
                  <Button variant="outlined" fullWidth>
                    Search
                  </Button>
                </Box>
              </Box>
            </Box>
          </CardContent>
        )}

        {/* Check In Tab */}
        {tabValue === 1 && (
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Scan QR Code to Return
              </Typography>
              <TextField
                fullWidth
                placeholder="Scan QR code to return equipment..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <QrCodeScannerIcon sx={{ color: '#6b7280' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Equipment Condition"
                select
                fullWidth
                defaultValue="good"
              >
                <option value="good">Good</option>
                <option value="damaged">Damaged</option>
                <option value="requires-maintenance">Requires Maintenance</option>
              </TextField>

              <TextField
                label="Return Notes"
                multiline
                rows={3}
                fullWidth
                placeholder="Any notes about the equipment condition..."
              />

              <Button variant="contained" size="large">
                Confirm Return
              </Button>
            </Box>
          </CardContent>
        )}

        {/* Active Checkouts Tab */}
        {tabValue === 2 && (
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Equipment</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Checked Out</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Days Left</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeCheckouts.map((checkout) => (
                    <TableRow key={checkout.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {checkout.equipment}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{checkout.user}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{checkout.checkoutDate}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{checkout.expectedReturnDate}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={checkout.daysRemaining === 0 ? 'OVERDUE' : `${checkout.daysRemaining} days`}
                          size="small"
                          color={checkout.daysRemaining === 0 ? 'error' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => handleReturn(checkout.id)}>
                          Return
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        )}

        {/* Return History Tab */}
        {tabValue === 3 && (
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Equipment</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Checkout Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Return Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {returnedCheckouts.map((checkout) => (
                    <TableRow key={checkout.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {checkout.equipment}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{checkout.user}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{checkout.checkoutDate}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{checkout.returnDate}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{checkout.daysUsed} days</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        )}
      </Card>

      {/* Checkout Confirm Dialog */}
      <CheckoutConfirmDialog
        open={dialogOpen}
        qrCode={qrInput}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleCheckoutConfirm}
      />
    </Box>
  );
};

const TypeSeparator: React.FC = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
    <Box sx={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
      OR
    </Typography>
    <Box sx={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
  </Box>
);

export default CheckoutCheckinPage;
