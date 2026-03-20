import React from 'react';
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Paper, Alert } from '@mui/material';
import MonitorIcon from '@mui/icons-material/Monitor';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';

const GuestLabsPage: React.FC = () => {
  const mockLabs = [
    {
      id: 'lab-001',
      name: 'IoT Lab',
      type: 'Internet of Things',
      capacity: 15,
      floor: 2,
      location: 'Building A',
      equipment: ['Arduino Board', 'Raspberry Pi', 'Sensors', 'Wireless Modules'],
      availability: 'Available',
      safetyRequirements: 'No special requirements',
      operatingHours: '8:00 AM - 6:00 PM',
    },
    {
      id: 'lab-002',
      name: 'Electronics Lab',
      type: 'Electronics & Circuits',
      capacity: 20,
      floor: 3,
      location: 'Building A',
      equipment: ['Oscilloscope', 'Power Supply', 'Function Generator', 'Multimeter'],
      availability: 'Booked',
      safetyRequirements: 'Electrical Safety Training Required',
      operatingHours: '7:00 AM - 7:00 PM',
    },
    {
      id: 'lab-003',
      name: 'Robotics Lab',
      type: 'Robotics & Automation',
      capacity: 12,
      floor: 4,
      location: 'Building B',
      equipment: ['Robot Arms', 'Motion Controllers', 'Vision Systems', 'PLC Units'],
      availability: 'Available',
      safetyRequirements: 'Safety Training & PPE Required',
      operatingHours: '8:00 AM - 5:00 PM',
    },
    {
      id: 'lab-004',
      name: 'Materials Lab',
      type: 'Materials Science',
      capacity: 8,
      floor: 1,
      location: 'Building B',
      equipment: ['Microscopes', 'Testing Equipment', 'Analysis Tools', 'Sample Storage'],
      availability: 'Available',
      safetyRequirements: 'Chemical Handling Training Required',
      operatingHours: '9:00 AM - 5:00 PM',
    },
  ];

  const getAvailabilityColor = (availability: string): string => {
    return availability === 'Available' ? '#10b981' : '#f59e0b';
  };

  const getSafetyLevel = (requirement: string): string => {
    if (requirement.includes('No special')) return 'Low';
    if (requirement.includes('Training')) return 'Medium';
    return 'High';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <MonitorIcon sx={{ fontSize: 32, color: '#1a73e8' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Laboratory Facilities
        </Typography>
      </Box>

      {/* Lab Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
        {mockLabs.map((lab) => (
          <Card sx={{ height: '100%' }} key={lab.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {lab.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      {lab.type}
                    </Typography>
                  </Box>
                  <Chip
                    icon={<PeopleIcon />}
                    label={lab.capacity}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Chip
                      label={lab.availability}
                      size="small"
                      sx={{
                        backgroundColor: getAvailabilityColor(lab.availability) + '20',
                        color: getAvailabilityColor(lab.availability),
                      }}
                    />
                    <Chip
                      label={`${getSafetyLevel(lab.safetyRequirements)} Safety`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280', mb: 0.5 }}>
                    Location & Hours
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                    {lab.location} - Floor {lab.floor}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                    {lab.operatingHours}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280', mb: 0.5 }}>
                    Equipment Available
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#374151' }}>
                    {lab.equipment.join(', ')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

      {/* Full Details Table */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Laboratory Details ({mockLabs.length})
          </Typography>
          <TableContainer component={Paper} sx={{ backgroundColor: '#f8fafc' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Lab Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Capacity</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Availability</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Safety Requirements</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Operating Hours</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockLabs.map((lab) => (
                  <TableRow key={lab.id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {lab.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                          {lab.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PeopleIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                        {lab.capacity}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={lab.availability}
                        size="small"
                        sx={{
                          backgroundColor: getAvailabilityColor(lab.availability) + '20',
                          color: getAvailabilityColor(lab.availability),
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        {lab.safetyRequirements}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        {lab.operatingHours}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Safety Information */}
      <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Safety Notice for Lab Usage
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Lab usage is restricted to authorized personnel only. Contact the Lab Manager for access requests and safety training certification.
        </Typography>
      </Alert>
    </Box>
  );
};

export default GuestLabsPage;
