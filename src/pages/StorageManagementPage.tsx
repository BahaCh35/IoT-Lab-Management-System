import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';

interface StorageItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  addedDate: string;
}

interface DrawerData {
  id: string;
  name: string;
  items: StorageItem[];
}

interface CabinetData {
  id: string;
  name: string;
  drawers: DrawerData[];
}

// Mock storage data
const initialStorageData: CabinetData[] = [
  {
    id: 'cabinet-1',
    name: 'Cabinet A',
    drawers: [
      {
        id: 'drawer-1-1',
        name: 'Drawer 1',
        items: [
          { id: '1', name: 'Arduino Uno', category: 'Microcontroller', quantity: 5, addedDate: '2024-01-15' },
          { id: '2', name: 'Resistor Kit', category: 'Component', quantity: 10, addedDate: '2024-01-10' },
        ],
      },
      {
        id: 'drawer-1-2',
        name: 'Drawer 2',
        items: [
          { id: '3', name: 'LED Assortment', category: 'Component', quantity: 20, addedDate: '2024-01-12' },
        ],
      },
      {
        id: 'drawer-1-3',
        name: 'Drawer 3',
        items: [
          { id: '4', name: 'Capacitor Pack', category: 'Component', quantity: 15, addedDate: '2024-01-08' },
        ],
      },
    ],
  },
  {
    id: 'cabinet-2',
    name: 'Cabinet B',
    drawers: [
      {
        id: 'drawer-2-1',
        name: 'Drawer 1',
        items: [
          { id: '5', name: 'Raspberry Pi 4', category: 'Microcontroller', quantity: 3, addedDate: '2024-01-14' },
        ],
      },
      {
        id: 'drawer-2-2',
        name: 'Drawer 2',
        items: [
          { id: '6', name: 'Jumper Wires', category: 'Component', quantity: 8, addedDate: '2024-01-11' },
          { id: '7', name: 'USB Cables', category: 'Component', quantity: 6, addedDate: '2024-01-13' },
        ],
      },
      {
        id: 'drawer-2-3',
        name: 'Drawer 3',
        items: [],
      },
    ],
  },
  {
    id: 'cabinet-3',
    name: 'Cabinet C',
    drawers: [
      {
        id: 'drawer-3-1',
        name: 'Drawer 1',
        items: [
          { id: '8', name: 'Soldering Iron', category: 'Tool', quantity: 2, addedDate: '2024-01-09' },
          { id: '9', name: 'Multimeter', category: 'Tool', quantity: 4, addedDate: '2024-01-07' },
        ],
      },
      {
        id: 'drawer-3-2',
        name: 'Drawer 2',
        items: [
          { id: '10', name: 'Breadboard Set', category: 'Tool', quantity: 3, addedDate: '2024-01-16' },
        ],
      },
      {
        id: 'drawer-3-3',
        name: 'Drawer 3',
        items: [
          { id: '11', name: 'Oscilloscope Probes', category: 'Tool', quantity: 2, addedDate: '2024-01-06' },
        ],
      },
    ],
  },
];

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    Microcontroller: '#1a73e8',
    Component: '#7c3aed',
    Tool: '#f59e0b',
    Sensor: '#10b981',
    Other: '#6b7280',
  };
  return colors[category] || '#6b7280';
};

const StorageManagementPage: React.FC = () => {
  const getTotalItems = () => {
    return initialStorageData.reduce((total, cabinet) => {
      return total + cabinet.drawers.reduce((drawerTotal, drawer) => {
        return drawerTotal + drawer.items.length;
      }, 0);
    }, 0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <StorageIcon sx={{ fontSize: 32, color: '#1a73e8' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Storage Inventory
        </Typography>
      </Box>

      {/* Storage Stats */}
      <Card sx={{ mb: 4, backgroundColor: '#e3f2fd' }}>
        <CardContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                Total Cabinets
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a73e8', mt: 0.5 }}>
                {initialStorageData.length}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                Total Drawers
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#3b82f6', mt: 0.5 }}>
                {initialStorageData.reduce((total, cabinet) => total + cabinet.drawers.length, 0)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                Total Items
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#7c3aed', mt: 0.5 }}>
                {getTotalItems()}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Storage Cabinets Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
        {initialStorageData.map((cabinet) => (
          <Card key={cabinet.id} sx={{ backgroundColor: '#f8fafc' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#1a73e8' }}>
                {cabinet.name}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {cabinet.drawers.map((drawer) => (
                  <Card key={drawer.id} sx={{ backgroundColor: 'white', borderLeft: '4px solid #1a73e8' }}>
                    <CardContent sx={{ pb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                        {drawer.name}
                      </Typography>

                      {drawer.items.length === 0 ? (
                        <Typography variant="caption" sx={{ color: '#9ca3af', fontStyle: 'italic' }}>
                          Empty
                        </Typography>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {drawer.items.map((item) => (
                            <Box
                              key={item.id}
                              sx={{
                                p: 1.5,
                                backgroundColor: '#f3f4f6',
                                borderRadius: 1,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                                  {item.name}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                  <Chip
                                    label={item.category}
                                    size="small"
                                    sx={{
                                      backgroundColor: getCategoryColor(item.category),
                                      color: 'white',
                                      height: 20,
                                    }}
                                  />
                                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                    Qty: {item.quantity}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default StorageManagementPage;
