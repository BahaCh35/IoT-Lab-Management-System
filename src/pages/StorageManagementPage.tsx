import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import { storageService, CabinetData, StorageItemData } from '../services/api/storageService';

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    Microcontroller: '#1a73e8',
    microcontroller: '#1a73e8',
    Component: '#7c3aed',
    component: '#7c3aed',
    Tool: '#f59e0b',
    tool: '#f59e0b',
    Sensor: '#10b981',
    sensor: '#10b981',
    Other: '#6b7280',
    other: '#6b7280',
  };
  return colors[category] || '#6b7280';
};

const StorageManagementPage: React.FC = () => {
  const [storageData, setStorageData] = useState<CabinetData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    try {
      setLoading(true);
      const cabinets = await storageService.getCabinetsWithDrawersAndItems();
      setStorageData(cabinets);
    } catch (error) {
      console.error('Error loading storage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalItems = () => {
    return storageData.reduce((total, cabinet) => {
      return total + cabinet.drawers.reduce((drawerTotal, drawer) => {
        return drawerTotal + drawer.items.length;
      }, 0);
    }, 0);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading storage data...
          </Typography>
        </Box>
      </Box>
    );
  }

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
                {storageData.length}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                Total Drawers
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#3b82f6', mt: 0.5 }}>
                {storageData.reduce((total, cabinet) => total + cabinet.drawers.length, 0)}
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
        {storageData.map((cabinet) => (
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
