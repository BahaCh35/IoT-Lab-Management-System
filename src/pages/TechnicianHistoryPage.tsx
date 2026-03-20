import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, MenuItem, Select, FormControl, InputLabel, Button } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import { maintenanceService } from '../services/maintenanceService';
import { MaintenanceRequest } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const TechnicianHistoryPage: React.FC = () => {
  const [completedTasks, setCompletedTasks] = useState<MaintenanceRequest[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<MaintenanceRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  useEffect(() => {
    const history = maintenanceService.getMaintenanceHistory();
    setCompletedTasks(history);
    setFilteredTasks(history);
  }, []);

  useEffect(() => {
    let filtered = completedTasks;

    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.problemDescription.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterMonth) {
      const [filterYear, filterMon] = filterMonth.split('-').map(Number);
      filtered = filtered.filter((task) => {
        const d = new Date(task.reportedDate);
        return d.getFullYear() === filterYear && d.getMonth() + 1 === filterMon;
      });
    }

    setFilteredTasks(filtered);
  }, [searchQuery, filterMonth, completedTasks]);

  const getStatusIcon = (status: string) =>
    status === 'completed' ? (
      <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />
    ) : (
      <BlockIcon sx={{ color: '#ef4444', fontSize: 20 }} />
    );

  const repairStats = {
    completed: completedTasks.filter((t) => t.status === 'completed').length,
    cannotRepair: completedTasks.filter((t) => t.status === 'cannot-repair').length,
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Equipment', 'Problem', 'Status', 'Priority', 'Completed Date', 'Parts Used'];
    const rows = filteredTasks.map((task) => [
      task.equipmentName,
      task.problemDescription.replace(/,/g, ';'),
      task.status === 'completed' ? 'Fixed' : 'Failed',
      task.priority.toUpperCase(),
      task.completedDate ? new Date(task.completedDate).toLocaleDateString() : '-',
      task.partsUsed.length > 0 ? task.partsUsed.join('; ').replace(/µ/g, 'u') : 'None',
    ]);
    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `maintenance_history_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Export to Excel
  const exportToExcel = () => {
    const data = filteredTasks.map((task) => ({
      Equipment: task.equipmentName,
      Problem: task.problemDescription,
      Status: task.status === 'completed' ? 'Fixed' : 'Cannot Repair',
      Priority: task.priority.toUpperCase(),
      'Completed Date': task.completedDate ? new Date(task.completedDate).toLocaleDateString() : '-',
      'Parts Used': task.partsUsed.length > 0 ? task.partsUsed.join('; ') : 'None',
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Maintenance History');
    const columnWidths = [20, 30, 15, 12, 15, 25];
    worksheet['!cols'] = columnWidths.map((width) => ({ wch: width }));
    XLSX.writeFile(workbook, `maintenance_history_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Technician Maintenance History Report', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 22, { align: 'center' });

    doc.setFillColor(245, 247, 250);
    doc.rect(10, 28, pageWidth - 20, 12, 'F');
    doc.setTextColor(0);
    doc.setFontSize(9);
    const stats = `Completed: ${repairStats.completed}  |  Cannot Repair: ${repairStats.cannotRepair}`;
    doc.text(stats, 15, 36);

    const tableData = filteredTasks.map((task) => {
      const cleanParts = task.partsUsed.join(', ')
        .replace(/µ/g, 'u')
        .replace(/[^\x00-\x7F]/g, '');
      return [
        task.equipmentName,
        task.problemDescription,
        task.status === 'completed' ? 'Fixed' : 'Failed',
        task.priority.toUpperCase(),
        task.completedDate ? new Date(task.completedDate).toLocaleDateString() : '-',
        cleanParts || 'None',
      ];
    });

    autoTable(doc, {
      startY: 45,
      head: [['Equipment', 'Problem Description', 'Status', 'Priority', 'Date', 'Parts']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [26, 115, 232], halign: 'center', fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 22, halign: 'center' },
        4: { cellWidth: 25, halign: 'center' },
        5: { cellWidth: 65 },
      },
      styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak', font: 'helvetica' },
      margin: { left: 10, right: 10 },
      didDrawPage: (data) => {
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${data.pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      },
    });

    doc.save(`maintenance_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <HistoryIcon sx={{ fontSize: 32, color: '#1a73e8' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Maintenance History
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
        <Card sx={{ backgroundColor: '#e8f5e9' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                  Completed
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981', mt: 0.5 }}>
                  {repairStats.completed}
                </Typography>
              </Box>
              <CheckCircleIcon sx={{ fontSize: 40, color: '#10b981', opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: '#fee2e2' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                  Cannot Repair
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ef4444', mt: 0.5 }}>
                  {repairStats.cannotRepair}
                </Typography>
              </Box>
              <BlockIcon sx={{ fontSize: 40, color: '#ef4444', opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search equipment or problem..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: '#6b7280' }} /> }}
          sx={{ minWidth: 260, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Month</InputLabel>
          <Select value={filterMonth} label="Month" onChange={(e) => setFilterMonth(e.target.value)}>
            <MenuItem value="">All Year</MenuItem>
            <MenuItem value="2026-01">January 2026</MenuItem>
            <MenuItem value="2026-02">February 2026</MenuItem>
            <MenuItem value="2026-03">March 2026</MenuItem>
          </Select>
        </FormControl>
        {(searchQuery || filterMonth) && (
          <Button
            size="small"
            variant="outlined"
            onClick={() => { setSearchQuery(''); setFilterMonth(''); }}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Clear
          </Button>
        )}
        {(searchQuery || filterMonth) && (
          <Typography variant="caption" sx={{ color: '#6b7280', alignSelf: 'center' }}>
            {filteredTasks.length} of {completedTasks.length} tasks
          </Typography>
        )}
      </Box>

      {/* Export Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={exportToCSV}
          sx={{ backgroundColor: '#10b981', '&:hover': { backgroundColor: '#059669' }, textTransform: 'none' }}
          disabled={filteredTasks.length === 0}
        >
          Export as CSV
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={exportToExcel}
          sx={{ backgroundColor: '#3b82f6', '&:hover': { backgroundColor: '#2563eb' }, textTransform: 'none' }}
          disabled={filteredTasks.length === 0}
        >
          Export as Excel
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={exportToPDF}
          sx={{ backgroundColor: '#ef4444', '&:hover': { backgroundColor: '#dc2626' }, textTransform: 'none' }}
          disabled={filteredTasks.length === 0}
        >
          Export as PDF
        </Button>
      </Box>

      {/* History Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Completed Tasks ({filteredTasks.length})
          </Typography>
          <TableContainer component={Paper} sx={{ backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Equipment</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Problem</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Completed</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Parts Used</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <TableRow key={task.id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {task.equipmentName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{task.problemDescription.substring(0, 40)}...</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {getStatusIcon(task.status)}
                          <Typography variant="caption">
                            {task.status === 'completed' ? 'Fixed' : 'Cannot Repair'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {task.completedDate ? new Date(task.completedDate).toLocaleDateString() : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {task.partsUsed.length > 0 ? task.partsUsed.join(', ') : 'None'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        No completed tasks found
                      </Typography>
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

export default TechnicianHistoryPage;
