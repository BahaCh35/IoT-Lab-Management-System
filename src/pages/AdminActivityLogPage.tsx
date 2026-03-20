import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Paper, TextField, MenuItem, Select, FormControl, InputLabel, Button } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import { approvalService } from '../services/approvalService';

const systemLogs = [
  { id: 1,  timestamp: '2026-03-07 09:14:32', type: 'APPROVAL',     user: 'ahmed.benali',    resource: 'Equipment Request — Oscilloscope DS1054Z',       status: 'approved' },
  { id: 2,  timestamp: '2026-03-07 09:02:11', type: 'LOGIN',        user: 'sara.mansouri',   resource: 'User session started',                            status: 'success'  },
  { id: 3,  timestamp: '2026-03-07 08:55:44', type: 'BOOKING',      user: 'karim.ouali',     resource: 'Meeting Room B — 10:00 to 12:00',                 status: 'pending'  },
  { id: 4,  timestamp: '2026-03-07 08:47:03', type: 'APPROVAL',     user: 'admin',           resource: 'Lab Reservation — Electronics Lab',               status: 'rejected' },
  { id: 5,  timestamp: '2026-03-07 08:31:19', type: 'RESERVATION',  user: 'lina.hadj',       resource: 'Soldering Station — 2h slot',                     status: 'approved' },
  { id: 6,  timestamp: '2026-03-07 08:20:07', type: 'LOGIN',        user: 'omar.khelil',     resource: 'User session started',                            status: 'success'  },
  { id: 7,  timestamp: '2026-03-07 08:10:55', type: 'MAINTENANCE',  user: 'tech.yasser',     resource: 'Power Supply Unit — Reported fault',              status: 'pending'  },
  { id: 8,  timestamp: '2026-03-06 17:48:22', type: 'APPROVAL',     user: 'admin',           resource: 'Storage Addition — Arduino Mega x10',             status: 'approved' },
  { id: 9,  timestamp: '2026-03-06 17:30:01', type: 'BOOKING',      user: 'rania.chetti',    resource: 'Lab A — Full day reservation',                    status: 'approved' },
  { id: 10, timestamp: '2026-03-06 16:55:40', type: 'LOGIN',        user: 'sara.mansouri',   resource: 'User session ended',                              status: 'success'  },
  { id: 11, timestamp: '2026-03-06 16:22:13', type: 'MAINTENANCE',  user: 'tech.yasser',     resource: 'USB Oscilloscope — Cannot repair, escalated',     status: 'error'    },
  { id: 12, timestamp: '2026-03-06 15:44:08', type: 'APPROVAL',     user: 'ahmed.benali',    resource: 'Meeting Room Booking — Room C',                   status: 'pending'  },
  { id: 13, timestamp: '2026-03-06 15:10:33', type: 'RESERVATION',  user: 'karim.ouali',     resource: 'Equipment — Multimeter x2',                       status: 'approved' },
  { id: 14, timestamp: '2026-03-06 14:30:00', type: 'LOGIN',        user: 'lina.hadj',       resource: 'User session started',                            status: 'success'  },
  { id: 15, timestamp: '2026-03-06 13:58:47', type: 'APPROVAL',     user: 'admin',           resource: 'Product Modification — Sensor Kit updated',       status: 'approved' },
];

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'approved':
    case 'success':  return { bg: '#e8f5e9', color: '#2e7d32', label: status === 'success' ? 'Success' : 'Approved' };
    case 'pending':  return { bg: '#fff8e1', color: '#f57f17', label: 'Pending'  };
    case 'rejected': return { bg: '#ffebee', color: '#c62828', label: 'Rejected' };
    case 'error':    return { bg: '#ffebee', color: '#c62828', label: 'Error'    };
    default:         return { bg: '#f3f4f6', color: '#6b7280', label: status };
  }
};

const getTypeStyle = (type: string) => {
  switch (type) {
    case 'APPROVAL':    return { bg: '#e8eaf6', color: '#3949ab' };
    case 'LOGIN':       return { bg: '#e3f2fd', color: '#1565c0' };
    case 'BOOKING':     return { bg: '#e8f5e9', color: '#2e7d32' };
    case 'RESERVATION': return { bg: '#f3e5f5', color: '#6a1b9a' };
    case 'MAINTENANCE': return { bg: '#fff3e0', color: '#e65100' };
    default:            return { bg: '#f3f4f6', color: '#374151' };
  }
};

const AdminActivityLogPage: React.FC = () => {
  const [logFilter, setLogFilter] = useState('all');
  const [logSearch, setLogSearch]  = useState('');
  const [stats, setStats] = useState({ total: 0, approved: 0, rejected: 0, created: 0 });

  useEffect(() => {
    const logs = approvalService.getActivityLog(200);
    setStats({
      total:    logs.length,
      approved: logs.filter((l: any) => l.action === 'approved').length,
      rejected: logs.filter((l: any) => l.action === 'rejected').length,
      created:  logs.filter((l: any) => l.action === 'created').length,
    });
  }, []);

  const filteredLogs = systemLogs.filter((log) => {
    const matchesType   = logFilter === 'all' || log.type === logFilter;
    const matchesSearch =
      log.user.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.resource.toLowerCase().includes(logSearch.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <HistoryIcon sx={{ fontSize: 32, color: '#1a73e8' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Activity Logs
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        {[
          { label: 'Total Actions', value: stats.total,    color: '#1a73e8', bg: '#f0f4ff' },
          { label: 'Approved',      value: stats.approved, color: '#10b981', bg: '#e8f5e9' },
          { label: 'Rejected',      value: stats.rejected, color: '#ef4444', bg: '#fee2e2' },
          { label: 'Created',       value: stats.created,  color: '#3b82f6', bg: '#e3f2fd' },
        ].map((s) => (
          <Card key={s.label} sx={{ backgroundColor: s.bg }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                {s.label}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: s.color, mt: 0.5 }}>
                {s.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Log Table Card */}
      <Card>
        <CardContent>
          {/* Header + filters */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                System Logs
              </Typography>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                {filteredLogs.length} entries
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search user or resource..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: '#6b7280' }} /> }}
              sx={{ minWidth: 260, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Type</InputLabel>
              <Select value={logFilter} label="Type" onChange={(e) => setLogFilter(e.target.value)}>
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="APPROVAL">Approval</MenuItem>
                <MenuItem value="LOGIN">Login</MenuItem>
                <MenuItem value="BOOKING">Booking</MenuItem>
                <MenuItem value="RESERVATION">Reservation</MenuItem>
                <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
              </Select>
            </FormControl>
            {(logSearch || logFilter !== 'all') && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => { setLogSearch(''); setLogFilter('all'); }}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Clear
              </Button>
            )}
          </Box>

          {/* Table */}
          <TableContainer component={Paper} sx={{ backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#6b7280', py: 1.5 }}>Timestamp</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#6b7280', py: 1.5 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#6b7280', py: 1.5 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#6b7280', py: 1.5 }}>Resource / Event</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#6b7280', py: 1.5 }} align="right">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.length > 0 ? filteredLogs.map((log) => {
                  const statusStyle = getStatusStyle(log.status);
                  const typeStyle   = getTypeStyle(log.type);
                  return (
                    <TableRow
                      key={log.id}
                      sx={{ backgroundColor: '#fff', '&:hover': { backgroundColor: '#f0f4ff' }, borderBottom: '1px solid #f3f4f6' }}
                    >
                      <TableCell sx={{ color: '#9ca3af', fontSize: 12, py: 1.2, whiteSpace: 'nowrap' }}>
                        {log.timestamp}
                      </TableCell>
                      <TableCell sx={{ py: 1.2 }}>
                        <Chip
                          label={log.type}
                          size="small"
                          sx={{ backgroundColor: typeStyle.bg, color: typeStyle.color, fontWeight: 600, fontSize: 11, height: 22 }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#1a73e8', fontSize: 13, fontWeight: 500, py: 1.2 }}>
                        {log.user}
                      </TableCell>
                      <TableCell sx={{ color: '#374151', fontSize: 13, py: 1.2 }}>
                        {log.resource}
                      </TableCell>
                      <TableCell sx={{ py: 1.2 }} align="right">
                        <Chip
                          label={statusStyle.label}
                          size="small"
                          sx={{ backgroundColor: statusStyle.bg, color: statusStyle.color, fontWeight: 600, fontSize: 11, height: 22 }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                      <HistoryIcon sx={{ fontSize: 44, color: '#d1d5db', display: 'block', mx: 'auto', mb: 1 }} />
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>No log entries found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminActivityLogPage;
