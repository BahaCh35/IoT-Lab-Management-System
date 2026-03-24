import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

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

interface EditingItem {
  cabinetId: string;
  drawerId: string;
  itemId: string;
  name: string;
  category: string;
  quantity: number;
}

const AdminStorageManagementPage: React.FC = () => {
  const [storageData, setStorageData] = useState<CabinetData[]>(initialStorageData);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCabinet, setSelectedCabinet] = useState<string>('');
  const [selectedDrawer, setSelectedDrawer] = useState<string>('');
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('Microcontroller');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [draggedItem, setDraggedItem] = useState<{ cabinetId: string; drawerId: string; itemId: string } | null>(null);

  const handleAddItem = () => {
    if (selectedCabinet && selectedDrawer && itemName) {
      setStorageData((prevData) =>
        prevData.map((cabinet) =>
          cabinet.id === selectedCabinet
            ? {
                ...cabinet,
                drawers: cabinet.drawers.map((drawer) =>
                  drawer.id === selectedDrawer
                    ? {
                        ...drawer,
                        items: [
                          ...drawer.items,
                          {
                            id: Date.now().toString(),
                            name: itemName,
                            category: itemCategory,
                            quantity: parseInt(itemQuantity),
                            addedDate: new Date().toISOString().split('T')[0],
                          },
                        ],
                      }
                    : drawer
                ),
              }
            : cabinet
        )
      );
      resetForm();
    }
  };

  const handleDeleteItem = (cabinetId: string, drawerId: string, itemId: string) => {
    setStorageData((prevData) =>
      prevData.map((cabinet) =>
        cabinet.id === cabinetId
          ? {
              ...cabinet,
              drawers: cabinet.drawers.map((drawer) =>
                drawer.id === drawerId
                  ? {
                      ...drawer,
                      items: drawer.items.filter((item) => item.id !== itemId),
                    }
                  : drawer
              ),
            }
          : cabinet
      )
    );
  };

  const handleEditItem = (cabinetId: string, drawerId: string, item: StorageItem) => {
    setEditingItem({
      cabinetId,
      drawerId,
      itemId: item.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
    });
    setItemName(item.name);
    setItemCategory(item.category);
    setItemQuantity(item.quantity.toString());
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingItem && itemName) {
      setStorageData((prevData) =>
        prevData.map((cabinet) =>
          cabinet.id === editingItem.cabinetId
            ? {
                ...cabinet,
                drawers: cabinet.drawers.map((drawer) =>
                  drawer.id === editingItem.drawerId
                    ? {
                        ...drawer,
                        items: drawer.items.map((item) =>
                          item.id === editingItem.itemId
                            ? {
                                ...item,
                                name: itemName,
                                category: itemCategory,
                                quantity: parseInt(itemQuantity),
                              }
                            : item
                        ),
                      }
                    : drawer
                ),
              }
            : cabinet
        )
      );
      resetEditForm();
    }
  };

  const handleDragStart = (e: React.DragEvent, cabinetId: string, drawerId: string, itemId: string) => {
    setDraggedItem({ cabinetId, drawerId, itemId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnDrawer = (dropCabinetId: string, dropDrawerId: string) => {
    if (!draggedItem) return;

    if (draggedItem.cabinetId === dropCabinetId && draggedItem.drawerId === dropDrawerId) {
      setDraggedItem(null);
      return; // Same drawer, no change needed
    }

    // Get the item being dragged
    const draggedCabinet = storageData.find((c) => c.id === draggedItem.cabinetId);
    const draggedDrawer = draggedCabinet?.drawers.find((d) => d.id === draggedItem.drawerId);
    const draggedItemData = draggedDrawer?.items.find((i) => i.id === draggedItem.itemId);

    if (!draggedItemData) {
      setDraggedItem(null);
      return;
    }

    // Remove from source drawer and add to target drawer
    setStorageData((prevData) =>
      prevData.map((cabinet) => {
        let updatedCabinet = cabinet;

        // Remove from source
        if (cabinet.id === draggedItem.cabinetId) {
          updatedCabinet = {
            ...cabinet,
            drawers: cabinet.drawers.map((drawer) =>
              drawer.id === draggedItem.drawerId
                ? {
                    ...drawer,
                    items: drawer.items.filter((item) => item.id !== draggedItem.itemId),
                  }
                : drawer
            ),
          };
        }

        // Add to target
        if (updatedCabinet.id === dropCabinetId) {
          updatedCabinet = {
            ...updatedCabinet,
            drawers: updatedCabinet.drawers.map((drawer) =>
              drawer.id === dropDrawerId
                ? {
                    ...drawer,
                    items: [...drawer.items, draggedItemData],
                  }
                : drawer
            ),
          };
        }

        return updatedCabinet;
      })
    );

    setDraggedItem(null);
  };

  const resetForm = () => {
    setAddDialogOpen(false);
    setSelectedCabinet('');
    setSelectedDrawer('');
    setItemName('');
    setItemCategory('Microcontroller');
    setItemQuantity('1');
  };

  const resetEditForm = () => {
    setEditDialogOpen(false);
    setEditingItem(null);
    setItemName('');
    setItemCategory('Microcontroller');
    setItemQuantity('1');
  };

  const getDrawersForCabinet = (cabinetId: string) => {
    const cabinet = storageData.find((c) => c.id === cabinetId);
    return cabinet?.drawers || [];
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Microcontroller: '#1a73e8',
      Component: '#7c3aed',
      Tool: '#f59e0b',
      Sensor: '#10b981',
      'Other': '#6b7280',
    };
    return colors[category] || '#6b7280';
  };

  const getTotalItems = () => {
    return storageData.reduce((total, cabinet) => {
      return total + cabinet.drawers.reduce((drawerTotal, drawer) => {
        return drawerTotal + drawer.items.length;
      }, 0);
    }, 0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <StorageIcon sx={{ fontSize: 32, color: '#1a73e8' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Storage Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddDialogOpen(true)}
        >
          Add Item
        </Button>
      </Box>

      {/* Storage Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Cabinets', value: storageData.length, color: '#1a73e8', bg: '#f0f4ff' },
          { label: 'Total Drawers', value: storageData.reduce((total, cabinet) => total + cabinet.drawers.length, 0), color: '#10b981', bg: '#e8f5e9' },
          { label: 'Total Items', value: getTotalItems(), color: '#f59e0b', bg: '#fff3e0' },
        ].map((s) => (
          <Card key={s.label} sx={{ backgroundColor: s.bg, minWidth: 150, flex: 1 }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>
                {s.label}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: s.color, mt: 1 }}>
                {s.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

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
                  <Card
                    key={drawer.id}
                    sx={{
                      backgroundColor: 'white',
                      borderLeft: '4px solid #1a73e8',
                      border: draggedItem && draggedItem.cabinetId === cabinet.id ? '2px dashed #10b981' : undefined,
                      transition: 'all 0.2s ease',
                      minHeight: '80px',
                    }}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDropOnDrawer(cabinet.id, drawer.id)}
                  >
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
                              draggable
                              onDragStart={(e) => handleDragStart(e, cabinet.id, drawer.id, item.id)}
                              onDragOver={handleDragOver}
                              sx={{
                                p: 1.5,
                                backgroundColor: draggedItem?.itemId === item.id ? '#e3f2fd' : '#f3f4f6',
                                borderRadius: 1,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'grab',
                                '&:active': {
                                  cursor: 'grabbing',
                                },
                                opacity: draggedItem?.itemId === item.id ? 0.6 : 1,
                                transition: 'all 0.2s ease',
                                border: draggedItem?.itemId === item.id ? '2px dashed #1a73e8' : 'none',
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                                <DragIndicatorIcon sx={{ fontSize: 18, color: '#9ca3af', cursor: 'grab' }} />
                                <Box sx={{ flex: 1 }}>
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
                              <IconButton
                                size="small"
                                onClick={() => handleEditItem(cabinet.id, drawer.id, item)}
                                sx={{ color: '#3b82f6' }}
                                title="Edit item"
                              >
                                <EditIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteItem(cabinet.id, drawer.id, item.id)}
                                title="Delete item"
                              >
                                <DeleteIcon sx={{ fontSize: 18 }} />
                              </IconButton>
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

      {/* Add Item Dialog */}
      <Dialog open={addDialogOpen} onClose={resetForm} maxWidth="sm" fullWidth>
        <DialogTitle>Add Item to Storage</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Cabinet</InputLabel>
              <Select
                value={selectedCabinet}
                onChange={(e) => {
                  setSelectedCabinet(e.target.value);
                  setSelectedDrawer('');
                }}
                label="Cabinet"
              >
                {storageData.map((cabinet) => (
                  <MenuItem key={cabinet.id} value={cabinet.id}>
                    {cabinet.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedCabinet && (
              <FormControl fullWidth>
                <InputLabel>Drawer</InputLabel>
                <Select
                  value={selectedDrawer}
                  onChange={(e) => setSelectedDrawer(e.target.value)}
                  label="Drawer"
                >
                  {getDrawersForCabinet(selectedCabinet).map((drawer) => (
                    <MenuItem key={drawer.id} value={drawer.id}>
                      {drawer.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <TextField
              label="Item Name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="Microcontroller">Microcontroller</MenuItem>
                <MenuItem value="Component">Component</MenuItem>
                <MenuItem value="Tool">Tool</MenuItem>
                <MenuItem value="Sensor">Sensor</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Quantity"
              type="number"
              value={itemQuantity}
              onChange={(e) => setItemQuantity(e.target.value)}
              fullWidth
              inputProps={{ min: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetForm}>Cancel</Button>
          <Button onClick={handleAddItem} variant="contained">
            Add Item
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={editDialogOpen} onClose={resetEditForm} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Item Name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="Microcontroller">Microcontroller</MenuItem>
                <MenuItem value="Component">Component</MenuItem>
                <MenuItem value="Tool">Tool</MenuItem>
                <MenuItem value="Sensor">Sensor</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Quantity"
              type="number"
              value={itemQuantity}
              onChange={(e) => setItemQuantity(e.target.value)}
              fullWidth
              inputProps={{ min: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetEditForm}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminStorageManagementPage;
