import React from 'react';
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Paper } from '@mui/material';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PeopleIcon from '@mui/icons-material/People';

const GuestRoomsPage: React.FC = () => {
  const mockMeetingRooms = [
    {
      id: 'mr-001',
      name: 'Conference A',
      capacity: 12,
      floor: 2,
      location: 'Building A',
      amenities: ['Projector', 'Whiteboard', 'Conference Phone'],
      isActive: true,
      availability: 'Available',
    },
    {
      id: 'mr-002',
      name: 'Conference B',
      capacity: 8,
      floor: 2,
      location: 'Building A',
      amenities: ['TV Monitor', 'Whiteboard'],
      isActive: true,
      availability: 'Booked - 2:00 PM to 3:30 PM',
    },
    {
      id: 'mr-003',
      name: 'Small Meeting Room',
      capacity: 4,
      floor: 1,
      location: 'Building A',
      amenities: ['Whiteboard', 'AC'],
      isActive: true,
      availability: 'Available',
    },
    {
      id: 'mr-004',
      name: 'Collaboration Space',
      capacity: 20,
      floor: 3,
      location: 'Building B',
      amenities: ['Multiple Monitors', 'Projector', 'Whiteboard', 'Dial-in Phone'],
      isActive: true,
      availability: 'Available',
    },
    {
      id: 'mr-005',
      name: 'Training Room',
      capacity: 30,
      floor: 1,
      location: 'Building B',
      amenities: ['Projector', 'Whiteboard', 'Tiered Seating'],
      isActive: true,
      availability: 'Booked - 1:00 PM to 4:00 PM',
    },
    {
      id: 'mr-006',
      name: 'Executive Boardroom',
      capacity: 16,
      floor: 4,
      location: 'Building A',
      amenities: ['Projector', 'Video Conference', 'Leather Seating'],
      isActive: true,
      availability: 'Available',
    },
  ];

  const getAvailabilityColor = (availability: string): string => {
    return availability.includes('Available') ? '#10b981' : '#f59e0b';
  };

  const getAmmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'Projector':
        return '🎥';
      case 'Whiteboard':
        return '✏️';
      case 'Conference Phone':
        return '☎️';
      case 'TV Monitor':
        return '📺';
      case 'AC':
        return '❄️';
      case 'Multiple Monitors':
        return '🖥️';
      case 'Dial-in Phone':
        return '☎️';
      case 'Tiered Seating':
        return '💺';
      case 'Video Conference':
        return '🎬';
      case 'Leather Seating':
        return '🪑';
      default:
        return '📍';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <MeetingRoomIcon sx={{ fontSize: 32, color: '#1a73e8' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Meeting Rooms
        </Typography>
      </Box>

      {/* Room Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
        {mockMeetingRooms.map((room) => (
          <Card sx={{ height: '100%' }} key={room.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {room.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      {room.location} - Floor {room.floor}
                    </Typography>
                  </Box>
                  <Chip
                    icon={<PeopleIcon />}
                    label={room.capacity}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={room.availability}
                    size="small"
                    sx={{
                      backgroundColor: getAvailabilityColor(room.availability) + '20',
                      color: getAvailabilityColor(room.availability),
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280', mb: 1 }}>
                    Amenities
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {room.amenities.map((amenity, idx) => (
                      <Chip
                        key={idx}
                        label={`${getAmmenityIcon(amenity)} ${amenity}`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

      {/* Full Details Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            All Meeting Rooms ({mockMeetingRooms.length})
          </Typography>
          <TableContainer component={Paper} sx={{ backgroundColor: '#f8fafc' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Room Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Capacity</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status Today</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amenities</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockMeetingRooms.map((room) => (
                  <TableRow key={room.id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {room.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PeopleIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                        {room.capacity}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {room.location} - Floor {room.floor}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={room.availability}
                        size="small"
                        sx={{
                          backgroundColor: getAvailabilityColor(room.availability) + '20',
                          color: getAvailabilityColor(room.availability),
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        {room.amenities.join(', ')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="caption" sx={{ display: 'block', mt: 2, color: '#6b7280' }}>
            ℹ️ Calendar view shows general availability. User reservation details are kept anonymous for privacy reasons.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default GuestRoomsPage;
