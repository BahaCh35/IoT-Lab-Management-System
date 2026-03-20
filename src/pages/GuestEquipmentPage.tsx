import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, TextField, MenuItem, Select, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Paper } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory2';
import SearchIcon from '@mui/icons-material/Search';
import { Equipment } from '../types';

const GuestEquipmentPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Mock equipment data - limited information for guests
  const mockEquipment: Partial<Equipment>[] = [
    {
      id: 'eq-001',
      name: 'Arduino Uno',
      category: 'microcontroller',
      status: 'available',
      location: { building: 'Building A', room: 'Lab 1', cabinet: '', drawer: '' },
      specifications: { 'Flash Memory': '32 KB', 'RAM': '2 KB', 'Operating Voltage': '5V' },
    },
    {
      id: 'eq-002',
      name: 'Oscilloscope',
      category: 'tool',
      status: 'checked-out',
      location: { building: 'Building A', room: 'Lab 2', cabinet: '', drawer: '' },
      specifications: { 'Bandwidth': '100 MHz', 'Sample Rate': '1 GS/s', 'Channels': '2' },
    },
    {
      id: 'eq-003',
      name: 'Raspberry Pi 4',
      category: 'microcontroller',
      status: 'maintenance',
      location: { building: 'Building B', room: 'Lab 3', cabinet: '', drawer: '' },
      specifications: { 'CPU': 'ARM 1.8GHz', 'RAM': '4GB', 'Ports': 'HDMI, USB, Ethernet' },
    },
    {
      id: 'eq-004',
      name: 'Power Supply Unit (30V)',
      category: 'tool',
      status: 'available',
      location: { building: 'Building A', room: 'Storage', cabinet: '', drawer: '' },
      specifications: { 'Output Voltage': '0-30V', 'Current': '5A', 'Regulation': '±1%' },
    },
    {
      id: 'eq-005',
      name: 'Digital Multimeter',
      category: 'tool',
      status: 'available',
      location: { building: 'Building A', room: 'Lab 1', cabinet: '', drawer: '' },
      specifications: { 'Voltage Range': '0-600V', 'Current Range': '0-10A', 'Resistance': '0-2M Ohm' },
    },
    {
      id: 'eq-006',
      name: 'USB Oscilloscope',
      category: 'tool',
      status: 'checked-out',
      location: { building: 'Building B', room: 'Lab 4', cabinet: '', drawer: '' },
      specifications: { 'Bandwidth': '20 MHz', 'Sample Rate': '250 MS/s', 'Channels': '2' },
    },
    {
      id: 'eq-007',
      name: 'Soldering Iron - Weller',
      category: 'tool',
      status: 'available',
      location: { building: 'Building A', room: 'Soldering Station', cabinet: '', drawer: '' },
      specifications: { 'Power': '40W', 'Temp Range': '200-400°C', 'Tip Size': '3.2mm' },
    },
    {
      id: 'eq-008',
      name: 'Breadboard (830pt)',
      category: 'component',
      status: 'available',
      location: { building: 'Building A', room: 'Lab 1', cabinet: '', drawer: '' },
      specifications: { 'Holes': '830', 'Bus Strips': '2', 'Terminal Strips': '63' },
    },
  ];

  const filteredEquipment = mockEquipment.filter((item) => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string): string => {
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

  const getStatusLabel = (status: string): string => {
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

  const getCategoryLabel = (category: string): string => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <InventoryIcon sx={{ fontSize: 32, color: '#1a73e8' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Equipment Catalog
        </Typography>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 4 }}>
        <TextField
          label="Search Equipment"
          placeholder="Arduino, Oscilloscope..."
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

        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="available">Available</MenuItem>
            <MenuItem value="checked-out">Checked Out</MenuItem>
            <MenuItem value="maintenance">Maintenance</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Equipment Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Equipment List ({filteredEquipment.length})
          </Typography>
          <TableContainer component={Paper} sx={{ backgroundColor: '#f8fafc' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Equipment Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Key Specs</TableCell>
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
                      </TableCell>
                      <TableCell>
                        <Chip label={getCategoryLabel(item.category || 'other')} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(item.status || 'available')}
                          size="small"
                          sx={{ backgroundColor: getStatusColor(item.status || 'available') + '20', color: getStatusColor(item.status || 'available') }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {item.location?.building}, {item.location?.room}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                          {Object.entries(item.specifications || {})
                            .slice(0, 2)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(' | ')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        No equipment found matching your filters
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="caption" sx={{ display: 'block', mt: 2, color: '#6b7280' }}>
            Note: For security reasons, exact drawer locations and QR codes are not shown to guest users.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default GuestEquipmentPage;
