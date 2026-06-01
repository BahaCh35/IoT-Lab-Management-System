import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Paper, TextField, MenuItem, Select, FormControl, InputLabel, Button, Menu } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import { approvalService } from '../services/approvalService';
import { ActivityLog } from '../types';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const getStatusStyle = (action: string) => {
  switch (action.toLowerCase()) {
    case 'login':
      return { bg: '#e3f2fd', color: '#1565c0', label: 'Login' };
    case 'logout':
      return { bg: '#f3f4f6', color: '#6b7280', label: 'Logout' };
    case 'create':
      return { bg: '#e3f2fd', color: '#1565c0', label: 'Create' };
    case 'update':
      return { bg: '#eef2ff', color: '#3730a3', label: 'Update' };
    case 'delete':
      return { bg: '#fee2e2', color: '#c62828', label: 'Delete' };
    case 'checkout':
      return { bg: '#fff3e0', color: '#e65100', label: 'Checkout' };
    case 'checkin':
      return { bg: '#e8f5e9', color: '#2e7d32', label: 'Check-in' };
    case 'activate':
      return { bg: '#e8f5e9', color: '#2e7d32', label: 'Activate' };
    case 'deactivate':
      return { bg: '#fffde7', color: '#f57f17', label: 'Deactivate' };
    case 'approved':
      return { bg: '#e8f5e9', color: '#2e7d32', label: 'Approved' };
    case 'rejected':
      return { bg: '#ffebee', color: '#c62828', label: 'Rejected' };
    case 'created':
      return { bg: '#e3f2fd', color: '#1565c0', label: 'Created' };
    case 'success':
      return { bg: '#e8f5e9', color: '#2e7d32', label: 'Success' };
    case 'pending':
      return { bg: '#fff8e1', color: '#f57f17', label: 'Pending' };
    default:
      return { bg: '#f3f4f6', color: '#6b7280', label: action.charAt(0).toUpperCase() + action.slice(1) };
  }
};

const getTypeStyle = (type: string) => {
  switch (type.toUpperCase()) {
    case 'USER':
      return { bg: '#f3e8ff', color: '#7c3aed' };
    case 'AUTH':
      return { bg: '#e3f2fd', color: '#1565c0' };
    case 'EQUIPMENT':
      return { bg: '#fff3e0', color: '#e65100' };
    case 'CHECKOUT':
      return { bg: '#fffde7', color: '#f57f17' };
    case 'LAB':
      return { bg: '#e0f2f1', color: '#00695c' };
    case 'MEETINGROOM':
    case 'MEETING_ROOM':
      return { bg: '#f3e5f5', color: '#6a1b9a' };
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
  const [exportAnchor, setExportAnchor] = useState<null | HTMLElement>(null);

  const buildRows = (logs: ActivityLog[]) =>
    logs.map((log) => ({
      Timestamp: log.timestamp,
      Type: log.entityType,
      User: log.userName ?? log.userId,
      Resource: formatResource(log),
      Action: getStatusStyle(log.action).label,
    }));

  const exportCSV = () => {
    const rows = buildRows(filteredLogs);
    const header = Object.keys(rows[0] || {}).join(',');
    const body = rows.map((r) => Object.values(r).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csv = [header, ...body].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportAnchor(null);
  };

  const exportExcel = () => {
    const rows = buildRows(filteredLogs);
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Activity Logs');
    XLSX.writeFile(wb, `activity-logs-${new Date().toISOString().slice(0, 10)}.xlsx`);
    setExportAnchor(null);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Activity Logs', 14, 15);
    doc.setFontSize(9);
    doc.text(`Exported: ${new Date().toLocaleString()}  |  ${filteredLogs.length} entries`, 14, 22);
    autoTable(doc, {
      startY: 27,
      head: [['Timestamp', 'Type', 'User', 'Resource', 'Action']],
      body: filteredLogs.map((log) => [
        log.timestamp,
        log.entityType,
        log.userName ?? log.userId,
        formatResource(log),
        getStatusStyle(log.action).label,
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [26, 115, 232] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    doc.save(`activity-logs-${new Date().toISOString().slice(0, 10)}.pdf`);
    setExportAnchor(null);
  };

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const logs = await approvalService.getActivityLog(200);
        setActivityLogs(logs);
        setStats({
          total: logs.length,
          approved: logs.filter((l) => ['create', 'activate', 'checkin', 'approved'].includes(l.action.toLowerCase())).length,
          rejected: logs.filter((l) => ['delete', 'deactivate', 'rejected'].includes(l.action.toLowerCase())).length,
          created: logs.filter((l) => ['checkout', 'update', 'login', 'logout'].includes(l.action.toLowerCase())).length,
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
      (log.userName ?? log.userId).toLowerCase().includes(searchText) ||
      log.entityType.toLowerCase().includes(searchText) ||
      JSON.stringify(log.details).toLowerCase().includes(searchText);
    return matchesType && matchesSearch;
  });

  const formatResource = (log: ActivityLog) => {
    if (typeof log.details === 'string') return log.details;
    if (log.details?.name) {
      const extra = log.details.email ? ` (${log.details.email})` : log.details.status ? ` — ${log.details.status}` : '';
      return `${log.details.name}${extra}`;
    }
    if (log.details?.equipment_name) return `${log.details.equipment_name} → ${log.details.user_name ?? ''}`;
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
          { label: 'Created / Approved', value: stats.approved, color: '#10b981', bg: '#e8f5e9' },
          { label: 'Deleted / Rejected', value: stats.rejected, color: '#ef4444', bg: '#fee2e2' },
          { label: 'Checkouts / Logins', value: stats.created, color: '#f59e0b', bg: '#fffde7' },
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
            <Box>
              <Button
                size="small"
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={(e) => setExportAnchor(e.currentTarget)}
                sx={{ textTransform: 'none', borderRadius: 2, borderColor: '#d1d5db', color: '#374151' }}
              >
                Export
              </Button>
              <Menu
                anchorEl={exportAnchor}
                open={Boolean(exportAnchor)}
                onClose={() => setExportAnchor(null)}
                PaperProps={{ sx: { boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 2 } }}
              >
                <MenuItem onClick={exportCSV} sx={{ fontSize: 14, gap: 1 }}>Export as CSV</MenuItem>
                <MenuItem onClick={exportExcel} sx={{ fontSize: 14, gap: 1 }}>Export as Excel</MenuItem>
                <MenuItem onClick={exportPDF} sx={{ fontSize: 14, gap: 1 }}>Export as PDF</MenuItem>
              </Menu>
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
                <MenuItem value="User">User</MenuItem>
                <MenuItem value="AUTH">Auth</MenuItem>
                <MenuItem value="Equipment">Equipment</MenuItem>
                <MenuItem value="Checkout">Checkout</MenuItem>
                <MenuItem value="Lab">Lab</MenuItem>
                <MenuItem value="MeetingRoom">Meeting Room</MenuItem>
                <MenuItem value="APPROVAL">Approval</MenuItem>
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

          <TableContainer component={Paper} sx={{ backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 2, maxHeight: 508, overflow: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#6b7280', py: 1.5, backgroundColor: '#f3f4f6' }}>Timestamp</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#6b7280', py: 1.5, backgroundColor: '#f3f4f6' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#6b7280', py: 1.5, backgroundColor: '#f3f4f6' }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#6b7280', py: 1.5, backgroundColor: '#f3f4f6' }}>Resource / Event</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#6b7280', py: 1.5, backgroundColor: '#f3f4f6' }} align="right">Action</TableCell>
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
                          {log.userName ?? log.userId}
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
