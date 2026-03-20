import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import StarIcon from '@mui/icons-material/Star';
import RecommendIcon from '@mui/icons-material/Recommend';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { checkoutStore } from '../services/checkoutStore';
import { maintenanceService } from '../services/maintenanceService';
import { approvalService } from '../services/approvalService';

/* ── Mock personal data ── */
const myCheckoutHistory = [
  { month: 'Oct', checkouts: 2 },
  { month: 'Nov', checkouts: 4 },
  { month: 'Dec', checkouts: 1 },
  { month: 'Jan', checkouts: 3 },
  { month: 'Feb', checkouts: 5 },
  { month: 'Mar', checkouts: 3 },
];

const myReservations = [
  { id: '1', resource: 'Meeting Room A', type: 'meeting',   date: 'Tomorrow', time: '2:00 PM – 3:30 PM'   },
  { id: '2', resource: 'ESP32 Board',    type: 'equipment', date: 'Mar 12',   time: '9:00 AM – 12:00 PM'  },
  { id: '3', resource: 'IoT Lab',        type: 'lab',       date: 'Mar 14',   time: '8:00 AM – 10:00 AM'  },
];

const recommendations = [
  { name: 'USB Cable',    reason: 'Often borrowed alongside Arduino Uno' },
  { name: 'Breadboard',  reason: 'Frequently paired with ESP32 checkouts' },
  { name: 'Logic Analyzer', reason: 'Complements Oscilloscope usage' },
];

const RESERVATION_TYPE_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  meeting:   { bg: '#e8f5e9', color: '#2e7d32', label: 'Meeting Room' },
  equipment: { bg: '#e3f2fd', color: '#1565c0', label: 'Equipment'    },
  lab:       { bg: '#f3e5f5', color: '#6a1b9a', label: 'Lab'          },
};

type RecItemState = 'none' | 'reserved' | 'checked-out';

const AnalyticsPage: React.FC = () => {
  const [equipment, setEquipment] = useState(() => checkoutStore.getItems());
  const [reservations, setReservations] = useState(myReservations);
  const [recStates, setRecStates] = useState<Record<string, RecItemState>>({});

  const setRecState = (name: string, state: RecItemState) =>
    setRecStates((prev) => ({ ...prev, [name]: state }));

  // Borrow report dialog state
  const [reportOpen, setReportOpen]         = useState(false);
  const [reportItem, setReportItem]         = useState('');
  const [reportType, setReportType]         = useState('');
  const [reportDesc, setReportDesc]         = useState('');
  const [reportSent, setReportSent]         = useState(false);
  const [reportReturnFn, setReportReturnFn] = useState<(() => void) | null>(null);

  const openReport = (name: string, onReturn: () => void) => {
    setReportItem(name);
    setReportType('');
    setReportDesc('');
    setReportSent(false);
    setReportReturnFn(() => onReturn);
    setReportOpen(true);
  };

  const handleReportSubmit = () => {
    // Create a maintenance task visible to the technician
    maintenanceService.createMaintenanceRequest({
      equipmentName: reportItem,
      problemDescription: `[${reportType}] ${reportDesc}`,
      reportedBy: { id: 'current-engineer', name: 'My Profile', email: 'engineer@novation.com', role: 'engineer', createdAt: new Date().toISOString() },
      reportedDate: new Date().toISOString(),
      priority: 'high',
      location: { building: '', room: '', cabinet: '', drawer: '' },
    });

    // Flag the damage for admin via the approval workflow
    approvalService.createApproval({
      type: 'damage-report',
      requester: { id: 'current-engineer', name: 'My Profile', email: 'engineer@novation.com', role: 'engineer', createdAt: new Date().toISOString() },
      description: `Damage reported on "${reportItem}": [${reportType}] ${reportDesc}`,
      details: { equipmentName: reportItem, issueType: reportType, description: reportDesc },
      requestedDate: new Date().toISOString().split('T')[0],
    });

    setReportSent(true);
  };

  // Modify dialog state
  const [modifyOpen, setModifyOpen]             = useState(false);
  const [modifyRes,  setModifyRes]              = useState<(typeof myReservations)[0] | null>(null);
  const [modifyDate, setModifyDate]             = useState('');
  const [modifyTime, setModifyTime]             = useState('');

  // Rec checkout dialog state
  const [recCheckoutOpen, setRecCheckoutOpen]   = useState(false);
  const [recCheckoutName, setRecCheckoutName]   = useState('');
  const [recCheckoutQty,  setRecCheckoutQty]    = useState(1);
  const [recReturnDate,   setRecReturnDate]     = useState('');
  const today = new Date().toISOString().split('T')[0];

  // Snackbar
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg,  setSnackMsg]  = useState('');

  const openRecCheckout = (name: string) => {
    setRecCheckoutName(name);
    setRecCheckoutQty(1);
    setRecReturnDate('');
    setRecCheckoutOpen(true);
  };

  const handleRecCheckoutConfirm = () => {
    const item = checkoutStore.addItem(`rec-${recCheckoutName}`, recCheckoutName, recCheckoutQty, recReturnDate);
    setEquipment((prev) => [...prev, item]);
    setRecState(recCheckoutName, 'checked-out');
    const label = new Date(recReturnDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    setSnackMsg(`Checked out ${recCheckoutQty}× ${recCheckoutName} — return by ${label}`);
    setSnackOpen(true);
    setRecCheckoutOpen(false);
  };

  const handleReturn = (id: string) => {
    checkoutStore.removeById(id);
    setEquipment((prev) => prev.filter((e) => e.id !== id));
  };

  const handleCancelReservation = (id: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));
  };

  const openModify = (res: (typeof myReservations)[0]) => {
    setModifyRes(res);
    setModifyDate('');
    setModifyTime(res.time);
    setModifyOpen(true);
  };

  const handleModifySave = () => {
    if (!modifyRes) return;
    setReservations((prev) =>
      prev.map((r) =>
        r.id === modifyRes.id
          ? { ...r, date: modifyDate || r.date, time: modifyTime || r.time }
          : r
      )
    );
    setModifyOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <PersonIcon sx={{ fontSize: 32, color: '#1a73e8' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          My Activity & Stats
        </Typography>
      </Box>

      {/* ── Top stat cards ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        {/* MY CHECKOUTS */}
        <Card sx={{ backgroundColor: '#f0f4ff' }}>
          <CardContent>
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>
              My Checkouts
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a73e8', mt: 1 }}>
              5
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mt: 0.5 }}>
              2 active
            </Typography>
          </CardContent>
        </Card>

        {/* MY RESERVATIONS */}
        <Card sx={{ backgroundColor: '#f3e5f5' }}>
          <CardContent>
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>
              My Reservations
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#7c3aed', mt: 1 }}>
              3
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mt: 0.5 }}>
              1 today
            </Typography>
          </CardContent>
        </Card>

        {/* RETURN COMPLIANCE */}
        <Card sx={{ backgroundColor: '#e8f5e9' }}>
          <CardContent>
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>
              Return Compliance
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981', mt: 1 }}>
              90%
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <CheckCircleIcon sx={{ fontSize: 14, color: '#10b981' }} />
              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                On-time returner
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* FAVORITE EQUIPMENT */}
        <Card sx={{ backgroundColor: '#fff3e0' }}>
          <CardContent>
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>
              Favorite Equipment
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <StarIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#92400e' }}>
                  ESP32
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>(5×)</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <StarIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#92400e' }}>
                  Arduino
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>(3×)</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* ── Checkout History chart ── */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            My Checkout History (Last 6 Months)
          </Typography>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={myCheckoutHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 13 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="checkouts"
                name="Checkouts"
                stroke="#1a73e8"
                strokeWidth={2.5}
                dot={{ fill: '#1a73e8', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Current Equipment ── */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <AssignmentReturnIcon sx={{ color: '#1a73e8' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              My Current Equipment
            </Typography>
          </Box>

          {equipment.length > 0 ? (
            <TableContainer component={Paper} sx={{ backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Equipment</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Checked Out</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {equipment.map((item) => (
                    <TableRow key={item.id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                          {item.checkedOut}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`Due: ${item.dueLabel}`}
                          size="small"
                          sx={{
                            backgroundColor:
                              item.dueLabel === 'Today' ? '#ffebee' :
                              item.dueLabel === 'Tomorrow' ? '#fff3e0' : '#f0f4ff',
                            color:
                              item.dueLabel === 'Today' ? '#c62828' :
                              item.dueLabel === 'Tomorrow' ? '#e65100' : '#1a73e8',
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={() => handleReturn(item.id)}
                            sx={{ textTransform: 'none' }}
                          >
                            Return
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            startIcon={<ReportProblemIcon sx={{ fontSize: 13 }} />}
                            onClick={() => openReport(item.name, () => handleReturn(item.id))}
                            sx={{ textTransform: 'none' }}
                          >
                            Report
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: '#10b981', mb: 1 }} />
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                All equipment returned — great job!
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* ── Bottom row: Reservations + Recommended ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
        {/* MY RESERVATIONS */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <EventNoteIcon sx={{ color: '#1a73e8' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                My Reservations
              </Typography>
            </Box>

            {reservations.length > 0 ? (
              <List dense disablePadding>
                {reservations.map((res, idx) => {
                  const typeStyle = RESERVATION_TYPE_COLORS[res.type];
                  return (
                    <React.Fragment key={res.id}>
                      <ListItem disableGutters sx={{ py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Chip
                              label={typeStyle.label}
                              size="small"
                              sx={{ backgroundColor: typeStyle.bg, color: typeStyle.color, fontWeight: 500, fontSize: 11 }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {res.resource}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: '#6b7280', ml: 0.5 }}>
                            {res.date} · {res.time}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => openModify(res)}
                            sx={{ textTransform: 'none', fontSize: 12, py: 0.3 }}
                          >
                            Modify
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleCancelReservation(res.id)}
                            sx={{ textTransform: 'none', fontSize: 12, py: 0.3 }}
                          >
                            Cancel
                          </Button>
                        </Box>
                      </ListItem>
                      {idx < reservations.length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })}
              </List>
            ) : (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  No upcoming reservations.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* RECOMMENDED FOR YOU */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <RecommendIcon sx={{ color: '#7c3aed' }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recommended for You
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  Based on your usage patterns
                </Typography>
              </Box>
            </Box>
            <List dense disablePadding>
              {recommendations.map((item, idx) => (
                <React.Fragment key={item.name}>
                  <ListItem disableGutters sx={{ py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <FiberManualRecordIcon sx={{ fontSize: 10, color: '#7c3aed' }} />
                    </ListItemIcon>
                    <ListItemText
                      sx={{ flex: 1, m: 0 }}
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                          {item.reason}
                        </Typography>
                      }
                    />
                    <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                      {(recStates[item.name] || 'none') === 'none' && (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => openRecCheckout(item.name)}
                            sx={{ textTransform: 'none', fontSize: 11, py: 0.3, backgroundColor: '#1a73e8', '&:hover': { backgroundColor: '#1557b0' } }}
                          >
                            Check Out
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setRecState(item.name, 'reserved')}
                            sx={{ textTransform: 'none', fontSize: 11, py: 0.3, borderColor: '#7c3aed', color: '#7c3aed', '&:hover': { borderColor: '#6a1b9a', backgroundColor: '#f3e5f5' } }}
                          >
                            Reserve
                          </Button>
                        </>
                      )}
                      {(recStates[item.name] || 'none') === 'reserved' && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => openRecCheckout(item.name)}
                          sx={{ textTransform: 'none', fontSize: 11, py: 0.3, backgroundColor: '#1a73e8', '&:hover': { backgroundColor: '#1557b0' } }}
                        >
                          Check Out
                        </Button>
                      )}
                      {(recStates[item.name] || 'none') === 'checked-out' && (
                        <>
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={() => {
                              checkoutStore.removeByEquipmentId(`rec-${item.name}`);
                              setEquipment((prev) => prev.filter((e) => e.equipmentId !== `rec-${item.name}`));
                              setRecState(item.name, 'none');
                            }}
                            sx={{ textTransform: 'none', fontSize: 11, py: 0.3 }}
                          >
                            Return
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            startIcon={<ReportProblemIcon sx={{ fontSize: 13 }} />}
                            onClick={() => openReport(item.name, () => {
                              checkoutStore.removeByEquipmentId(`rec-${item.name}`);
                              setEquipment((prev) => prev.filter((e) => e.equipmentId !== `rec-${item.name}`));
                              setRecState(item.name, 'none');
                            })}
                            sx={{ textTransform: 'none', fontSize: 11, py: 0.3 }}
                          >
                            Report
                          </Button>
                        </>
                      )}
                    </Box>
                  </ListItem>
                  {idx < recommendations.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>

      {/* Borrow Report Dialog */}
      <Dialog open={reportOpen} onClose={() => setReportOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReportProblemIcon sx={{ color: '#f59e0b', fontSize: 22 }} />
          Borrow Report — {reportItem}
        </DialogTitle>
        <DialogContent dividers>
          {reportSent ? (
            <Box sx={{ py: 2, textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 44, color: '#10b981', mb: 1 }} />
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#10b981' }}>
                Report submitted!
              </Typography>
              <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mt: 0.5 }}>
                Our team will review the issue with <strong>{reportItem}</strong>.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Problem Type</InputLabel>
                <Select
                  value={reportType}
                  label="Problem Type"
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <MenuItem value="damaged">Damaged / Broken</MenuItem>
                  <MenuItem value="missing-part">Missing Part</MenuItem>
                  <MenuItem value="not-working">Not Working Properly</MenuItem>
                  <MenuItem value="calibration">Needs Calibration</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Description"
                multiline
                rows={3}
                fullWidth
                size="small"
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
                placeholder="Describe the issue in detail..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setReportOpen(false)} sx={{ textTransform: 'none' }}>
            {reportSent ? 'Close' : 'Cancel'}
          </Button>
          {reportSent && (
            <Button
              variant="outlined"
              color="success"
              onClick={() => { reportReturnFn?.(); setReportOpen(false); }}
              sx={{ textTransform: 'none' }}
            >
              Return Item
            </Button>
          )}
          {!reportSent && (
            <Button
              variant="contained"
              onClick={handleReportSubmit}
              disabled={!reportType}
              sx={{ backgroundColor: '#f59e0b', '&:hover': { backgroundColor: '#d97706' }, textTransform: 'none' }}
            >
              Submit Report
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Modify Reservation Dialog */}
      <Dialog open={modifyOpen} onClose={() => setModifyOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          Modify Reservation — {modifyRes?.resource}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0.5 }}>
            <TextField
              label="New Date"
              type="date"
              fullWidth
              value={modifyDate}
              onChange={(e) => setModifyDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
              helperText={`Current: ${modifyRes?.date}`}
            />
            <TextField
              label="New Time Slot"
              fullWidth
              value={modifyTime}
              onChange={(e) => setModifyTime(e.target.value)}
              placeholder="e.g. 10:00 AM – 11:30 AM"
              helperText={`Current: ${modifyRes?.time}`}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setModifyOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleModifySave}
            sx={{ backgroundColor: '#1a73e8', '&:hover': { backgroundColor: '#1557b0' }, textTransform: 'none' }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rec Checkout Dialog */}
      <Dialog open={recCheckoutOpen} onClose={() => setRecCheckoutOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Check Out Equipment</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" sx={{ color: '#374151' }}>
            Item: <strong>{recCheckoutName}</strong>
          </Typography>
          <TextField
            label="Quantity"
            type="number"
            fullWidth
            value={recCheckoutQty}
            onChange={(e) => setRecCheckoutQty(Math.max(1, Number(e.target.value)))}
            inputProps={{ min: 1 }}
            helperText="Enter quantity needed"
          />
          <TextField
            label="Return By"
            type="date"
            fullWidth
            value={recReturnDate}
            onChange={(e) => setRecReturnDate(e.target.value)}
            inputProps={{ min: today }}
            InputLabelProps={{ shrink: true }}
            helperText="Select a return date"
          />
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={() => setRecCheckoutOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!recReturnDate}
            onClick={handleRecCheckoutConfirm}
            sx={{ backgroundColor: '#1a73e8', '&:hover': { backgroundColor: '#1557b0' } }}
          >
            Check Out
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar notification */}
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

export default AnalyticsPage;
