import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { Checkout, Equipment } from '../types';
import { checkoutService } from '../services/checkoutService';

const QRScannerPage: React.FC = () => {
  const [qrInput, setQrInput] = useState('');
  const [scannedItems, setScannedItems] = useState<
    (Checkout & { equipment: Equipment | undefined })[]
  >([]);
  const [selectedScannedItem, setSelectedScannedItem] = useState<
    (Checkout & { equipment: Equipment | undefined }) | null
  >(null);
  const [returnNotes, setReturnNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [currentCheckouts, setCurrentCheckouts] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);

  // Mock current user
  const currentUser = {
    id: '101',
    name: 'Ahmed',
  };

  // Load statistics on component mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const activeCheckouts = await checkoutService.getUserActiveCheckouts(currentUser.id);
        const overdueCheckouts = await checkoutService.getOverdueCheckouts();
        setCurrentCheckouts(activeCheckouts.length);
        setOverdueCount(overdueCheckouts.length);
      } catch (error) {
        console.error('Error loading checkout statistics:', error);
      }
    };
    loadStats();
  }, [currentUser.id]);

  const handleScanQR = () => {
    if (!qrInput.trim()) {
      setErrorMessage('Please enter a QR code');
      return;
    }

    setIsScanning(true);

    // Simulate scan delay
    setTimeout(async () => {
      try {
        const checkout = await checkoutService.getCheckoutByQRCode(qrInput);

        if (!checkout) {
          setErrorMessage(`❌ QR Code "${qrInput}" not found or not currently checked out`);
          setQrInput('');
          setIsScanning(false);
          return;
        }

        if (checkout.status === 'returned') {
          setErrorMessage('❌ This equipment has already been returned');
          setQrInput('');
          setIsScanning(false);
          return;
        }

        if (checkout.userId !== currentUser.id) {
          setErrorMessage('❌ This equipment was not checked out by you');
          setQrInput('');
          setIsScanning(false);
          return;
        }

        const equipment = await checkoutService.getEquipmentById(checkout.equipmentId);

        const scannedItem = {
          ...checkout,
          equipment,
        };

        setSelectedScannedItem(scannedItem);
        setReturnNotes('');
        setDialogOpen(true);
        setQrInput('');
        setIsScanning(false);
      } catch (error: any) {
        setErrorMessage(error.message || 'Failed to process QR code');
        setQrInput('');
        setIsScanning(false);
      }
    }, 800);
  };

  const handleConfirmReturn = async () => {
    if (!selectedScannedItem) return;

    try {
      const updatedCheckout = await checkoutService.checkInEquipment(
        selectedScannedItem.id,
        returnNotes || undefined
      );

      const equipment = await checkoutService.getEquipmentById(updatedCheckout.equipmentId);

      setScannedItems([
        ...scannedItems,
        {
          ...updatedCheckout,
          equipment,
        },
      ]);

      setSuccessMessage(
        `✅ ${selectedScannedItem.equipment?.name || 'Equipment'} returned successfully!`
      );

      setDialogOpen(false);
      setSelectedScannedItem(null);
      setReturnNotes('');

      // Refresh statistics after successful return
      const activeCheckouts = await checkoutService.getUserActiveCheckouts(currentUser.id);
      const overdueCheckouts = await checkoutService.getOverdueCheckouts();
      setCurrentCheckouts(activeCheckouts.length);
      setOverdueCount(overdueCheckouts.length);

      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to return equipment');
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedScannedItem(null);
    setReturnNotes('');
  };

  const handleClearScannedItems = () => {
    setScannedItems([]);
  };

  const isOverdue = selectedScannedItem
    ? new Date(selectedScannedItem.expectedReturnDate) < new Date()
    : false;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <QrCodeScannerIcon sx={{ fontSize: 32, color: '#1a73e8' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Return Equipment (QR Scanner)
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

      {/* Scanner Area */}
      <Card sx={{ mb: 4, backgroundColor: '#f0f7ff', borderLeft: '4px solid #1a73e8' }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            📱 Scan QR Code or Enter Manually
          </Typography>

          {/* Visual Scanner Simulation */}
          <Box
            sx={{
              width: '100%',
              maxWidth: 300,
              aspectRatio: '1',
              border: '3px dashed #1a73e8',
              borderRadius: 2,
              backgroundColor: '#e3f2fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: 'auto',
              mb: 3,
              position: 'relative',
            }}
          >
            {isScanning ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CircularProgress />
                <Typography variant="caption" sx={{ mt: 2, color: '#1a73e8', fontWeight: 600 }}>
                  Scanning...
                </Typography>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <QrCodeScannerIcon sx={{ fontSize: 80, color: '#1a73e8', opacity: 0.5 }} />
                <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mt: 1 }}>
                  Point camera at QR code
                </Typography>
              </Box>
            )}

            {/* Scanning corner indicators */}
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                width: 20,
                height: 20,
                border: '2px solid #1a73e8',
                borderRight: 'none',
                borderBottom: 'none',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 20,
                height: 20,
                border: '2px solid #1a73e8',
                borderLeft: 'none',
                borderBottom: 'none',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                width: 20,
                height: 20,
                border: '2px solid #1a73e8',
                borderRight: 'none',
                borderTop: 'none',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                width: 20,
                height: 20,
                border: '2px solid #1a73e8',
                borderLeft: 'none',
                borderTop: 'none',
              }}
            />
          </Box>

          {/* QR Code Input */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr auto' }, gap: 2 }}>
            <TextField
              label="QR Code / Equipment ID"
              placeholder="Scan or manually enter QR code..."
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleScanQR();
                }
              }}
              fullWidth
              disabled={isScanning}
              autoFocus
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleScanQR}
              disabled={isScanning || !qrInput.trim()}
              sx={{ minWidth: 120 }}
            >
              {isScanning ? 'Scanning...' : 'Scan'}
            </Button>
          </Box>

          <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mt: 2 }}>
            💡 Tip: Press Enter after typing QR code to scan, or click Scan button. Try scanning codes like:
            QR-EQ-001-ARDUINO-UNO, QR-EQ-002-OSCILLOSCOPE, or QR-EQ-005-MULTIMETER
          </Typography>
        </CardContent>
      </Card>

      {/* Session Statistics */}
      <Card sx={{ mb: 4, backgroundColor: '#f8fafc' }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            📊 Session Summary
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
            <Box sx={{ p: 2, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>
                Items Returned
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#10b981', mt: 0.5 }}>
                {scannedItems.length}
              </Typography>
            </Box>
            <Box sx={{ p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>
                Current Checkouts
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#3b82f6', mt: 0.5 }}>
                {currentCheckouts}
              </Typography>
            </Box>
            <Box sx={{ p: 2, backgroundColor: '#fff3e0', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>
                Overdue Items
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#f59e0b', mt: 0.5 }}>
                {overdueCount}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Scanned Items History */}
      {scannedItems.length > 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                ✅ Returned in This Session ({scannedItems.length})
              </Typography>
              <Button variant="outlined" color="error" size="small" onClick={handleClearScannedItems}>
                Clear Session
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ backgroundColor: '#f8fafc' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Equipment</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Checkout Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Expected Return</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scannedItems.map((item, idx) => {
                    const checkoutDate = new Date(item.checkoutDate);
                    const returnDate = new Date(item.actualReturnDate || item.expectedReturnDate);
                    const days = Math.ceil(
                      (returnDate.getTime() - checkoutDate.getTime()) / (1000 * 60 * 60 * 24)
                    );

                    return (
                      <TableRow key={idx}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.equipment?.name || 'Unknown'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{checkoutDate.toLocaleDateString()}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {new Date(item.expectedReturnDate).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={`${days} days`} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Returned"
                            size="small"
                            sx={{ backgroundColor: '#10b98120', color: '#10b981' }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Return Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: isOverdue ? '#fee2e2' : '#f0f7ff' }}>
          {isOverdue ? '⚠️ Overdue Item - Confirm Return' : '✅ Confirm Equipment Return'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {selectedScannedItem && selectedScannedItem.equipment && (
            <>
              {/* Equipment Info */}
              <Box sx={{ p: 2, backgroundColor: '#f3f4f6', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {selectedScannedItem.equipment.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                  {selectedScannedItem.equipment.description}
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280' }}>
                      QR Code
                    </Typography>
                    <Typography variant="caption">{selectedScannedItem.equipment.qrCode}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280' }}>
                      Status
                    </Typography>
                    <Chip
                      label="Active"
                      size="small"
                      sx={{ backgroundColor: '#10b98120', color: '#10b981', mt: 0.5 }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Checkout Details */}
              <Box sx={{ p: 2, backgroundColor: '#f0f4ff', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#6b7280' }}>
                  Checkout Details
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280' }}>
                      Checkout Date
                    </Typography>
                    <Typography variant="body2">
                      {new Date(selectedScannedItem.checkoutDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280' }}>
                      Expected Return
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: isOverdue ? '#ef4444' : '#6b7280', fontWeight: isOverdue ? 600 : 400 }}
                    >
                      {new Date(selectedScannedItem.expectedReturnDate).toLocaleDateString()}
                      {isOverdue && ' (OVERDUE)'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Overdue Alert */}
              {isOverdue && (
                <Alert severity="warning">
                  ⚠️ This equipment was due {new Date(selectedScannedItem.expectedReturnDate).toLocaleDateString()}.
                  Please provide notes about the delay.
                </Alert>
              )}

              {/* Return Notes */}
              <TextField
                label="Return Notes (Optional)"
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                fullWidth
                multiline
                rows={2}
                placeholder="Add any notes about the equipment condition, usage, or return..."
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleConfirmReturn} variant="contained" color="success">
            Confirm Return
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QRScannerPage;
