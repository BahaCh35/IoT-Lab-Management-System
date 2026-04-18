import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Paper, TextField, MenuItem, Select, FormControl, InputLabel, Button } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import { approvalService } from '../services/approvalService';
import { ActivityLog } from '../types';

const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved':
    case 'success':
      return { bg: '#e8f5e9', color: '#2e7d32', label: status === 'success' ? 'Success' : 'Approved' };
    case 'pending':
    case 'created':
      return { bg: '#fff8e1', color: '#f57f17', label: status.charAt(0).toUpperCase() + status.slice(1) };
    case 'rejected':
    case 'error':
      return { bg: '#ffebee', color: '#c62828', label: status.charAt(0).toUpperCase() + status.slice(1) };
    default:
      return { bg: '#f3f4f6', color: '#6b7280', label: status.charAt(0).toUpperCase() + status.slice(1) };
  }
};

const getTypeStyle = (type: string) => {
  switch (type.toUpperCase()) {
    case 'APPROVAL':
    case 'APPROVAL_REQUEST':
      return { bg: '#e8eaf6', color: '#3949ab' };
    case 'LOGIN':
    case 'USER_SESSION':
      return { bg: '#e3f2fd', color: '#1565c0' };
    case 'BOOKING':
      return { bg: '#e8f5e9', color: '#2e7d32' };
    case 'RESERVATION':
      return { bg: '#f3e5f5', color: '#6a1b9a' };
    case 'MAINTENANCE':
      return { bg: '#fff3e0', color: '#e65100' };
    default:
      return { bg: '#f3f4f6', color: '#374151' };
  }
};

const AdminActivityLogPage: React.FC = () => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [logFilter, setLogFilter] = useState('all');
  const [logSearch, setLogSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, approved: 0, rejected: 0, created: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const logs = await approvalService.getActivityLog(200);
        setActivityLogs(logs);
        setStats({
          total: logs.length,
          approved: logs.filter((l) => l.action.toLowerCase() === 'approved').length,
          rejected: logs.filter((l) => l.action.toLowerCase() === 'rejected').length,
          created: logs.filter((l) => l.action.toLowerCase() === 'created').length,
        });
      } catch (fetchError) {
        setError('Failed to load activity logs.');
        console.error('Error loading activity logs:', fetchError);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  const filteredLogs = activityLogs.filter((log) => {
    const matchesType = logFilter === 'all' || log.entityType.toUpperCase() === logFilter.toUpperCase();
    const searchText = logSearch.toLowerCase();
    const matchesSearch =
      log.userId.toLowerCase().includes(searchText) ||
      log.entityType.toLowerCase().includes(searchText) ||
      JSON.stringify(log.details).toLowerCase().includes(searchText);
    return matchesType && matchesSearch;
  });

  const formatResource = (log: ActivityLog) => {
    if (typeof log.details === 'string') return log.details;
    if (log.details?.description) return log.details.description;
    if (log.entityId && log.entityType) return `${log.entityType.replace(/_/g, ' ')} — ${log.entityId}`;
    return JSON.stringify(log.details || {});
  };

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
          { label: 'Total Actions', value: stats.total, color: '#1a73e8', bg: '#f0f4ff' },
          { label: 'Approved', value: stats.approved, color: '#10b981', bg: '#e8f5e9' },
          { label: 'Rejected', value: stats.rejected, color: '#ef4444', bg: '#fee2e2' },
          { label: 'Created', value: stats.created, color: '#3b82f6', bg: '#e3f2fd' },
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
                onClick={() => {
                  setLogSearch('');
                  setLogFilter('all');
                }}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Clear
              </Button>
            )}
          </Box>

          <TableContainer component={Paper} sx={{ backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#6b7280', py: 1.5 }}>Timestamp</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#6b7280', py: 1.5 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#6b7280', py: 1.5 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#6b7280', py: 1.5 }}>Resource / Event</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#6b7280', py: 1.5 }} align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>Loading activity logs...</Typography>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" sx={{ color: '#ef4444' }}>{error}</Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => {
                    const statusStyle = getStatusStyle(log.action);
                    const typeStyle = getTypeStyle(log.entityType);
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
                            label={log.entityType}
                            size="small"
                            sx={{ backgroundColor: typeStyle.bg, color: typeStyle.color, fontWeight: 600, fontSize: 11, height: 22 }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#1a73e8', fontSize: 13, fontWeight: 500, py: 1.2 }}>
                          {log.userId}
                        </TableCell>
                        <TableCell sx={{ color: '#374151', fontSize: 13, py: 1.2 }}>
                          {formatResource(log)}
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
                  })
                ) : (
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
