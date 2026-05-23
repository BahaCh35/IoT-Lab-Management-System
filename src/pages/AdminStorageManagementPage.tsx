import React, { useState, useEffect } from 'react';
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
  Badge,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import SaveIcon from '@mui/icons-material/Save';
import UndoIcon from '@mui/icons-material/Undo';
import { equipmentService } from '../services/equipmentService';
import { storageService, CabinetData as APICabinetData, DrawerData as APIDrawerData, StorageItemData } from '../services/api/storageService';
import { Equipment } from '../types';

// Use the API types directly
type CabinetData = APICabinetData;
type DrawerData = APIDrawerData;
type StorageItem = StorageItemData;

interface PendingChange {
  itemId: string;
  equipmentId?: string;
  originalLocation: {
    cabinetId: string;
    drawerId: string;
  };
  newLocation: {
    cabinetId: string;
    drawerId: string;
  };
}

interface EditingItem {
  cabinetId: string;
  drawerId: string;
  itemId: string;
  name: string;
  category: string;
  quantity: number;
}

const AdminStorageManagementPage: React.FC = () => {
  const [storageData, setStorageData] = useState<CabinetData[]>([]);
  const [originalStorageData, setOriginalStorageData] = useState<CabinetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCabinet, setSelectedCabinet] = useState<string>('');
  const [selectedDrawer, setSelectedDrawer] = useState<string>('');
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('microcontroller'); // Updated to match backend enum
  const [itemQuantity, setItemQuantity] = useState('1');
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [draggedItem, setDraggedItem] = useState<{ cabinetId: string; drawerId: string; itemId: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Load storage data on component mount
  useEffect(() => {
    loadStorageData();
  }, []);

  // Show snackbar message
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const loadStorageData = async () => {
    try {
      setLoading(true);
      const cabinets = await storageService.getCabinetsWithDrawersAndItems();
      setStorageData(cabinets);
      setOriginalStorageData([...cabinets]);
    } catch (error) {
      console.error('Error loading storage data:', error);
      showSnackbar('Failed to load storage data. Please refresh the page.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Check if an item has pending changes
  const hasItemPendingChanges = (itemId: string): boolean => {
    return pendingChanges.some(change => change.itemId === itemId);
  };

  // Get pending change for an item
  const getItemPendingChange = (itemId: string): PendingChange | undefined => {
    return pendingChanges.find(change => change.itemId === itemId);
  };

  // Handle add item with API call
  const handleAddItem = async () => {
    if (selectedCabinet && selectedDrawer && itemName) {
      try {
        const newItem = await storageService.createItem({
          drawer_id: selectedDrawer,
          name: itemName,
          category: itemCategory,
          quantity: parseInt(itemQuantity),
          added_date: new Date().toISOString().split('T')[0],
        });

        // Reload data to get fresh state
        await loadStorageData();
        showSnackbar('Item added successfully!', 'success');
        resetForm();
      } catch (error) {
        console.error('Error adding item:', error);
        showSnackbar('Failed to add item. Please try again.', 'error');
      }
    }
  };

  // Handle delete item with API call
  const handleDeleteItem = async (cabinetId: string, drawerId: string, itemId: string) => {
    try {
      await storageService.deleteItem(itemId);
      await loadStorageData();
      showSnackbar('Item deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting item:', error);
      showSnackbar('Failed to delete item. Please try again.', 'error');
    }
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

  // Handle save edit with API call
  const handleSaveEdit = async () => {
    if (editingItem && itemName) {
      try {
        await storageService.updateItem(editingItem.itemId, {
          name: itemName,
          category: itemCategory,
          quantity: parseInt(itemQuantity),
        });

        await loadStorageData();
        showSnackbar('Item updated successfully!', 'success');
        resetEditForm();
      } catch (error) {
        console.error('Error updating item:', error);
        showSnackbar('Failed to update item. Please try again.', 'error');
      }
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

    // Check if item already has a pending change
    const existingChangeIndex = pendingChanges.findIndex(change => change.itemId === draggedItem.itemId);

    // Create or update pending change
    const newPendingChange: PendingChange = {
      itemId: draggedItem.itemId,
      equipmentId: draggedItemData.equipmentId,
      originalLocation: existingChangeIndex >= 0
        ? pendingChanges[existingChangeIndex].originalLocation
        : { cabinetId: draggedItem.cabinetId, drawerId: draggedItem.drawerId },
      newLocation: { cabinetId: dropCabinetId, drawerId: dropDrawerId }
    };

    // Update pending changes
    if (existingChangeIndex >= 0) {
      // Update existing pending change
      const updatedChanges = [...pendingChanges];

      // If moving back to original location, remove the pending change
      if (newPendingChange.originalLocation.cabinetId === dropCabinetId &&
          newPendingChange.originalLocation.drawerId === dropDrawerId) {
        updatedChanges.splice(existingChangeIndex, 1);
      } else {
        updatedChanges[existingChangeIndex] = newPendingChange;
      }

      setPendingChanges(updatedChanges);
    } else {
      // Add new pending change
      setPendingChanges(prev => [...prev, newPendingChange]);
    }

    // Update visual state (move item in UI but don't persist yet)
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
    showSnackbar(`Item moved to ${dropCabinetId} - ${dropDrawerId}. Click 'Save Changes' to persist.`, 'info');
  };

  // Save all pending changes to backend
  const handleSaveChanges = async () => {
    if (pendingChanges.length === 0) {
      showSnackbar('No changes to save.', 'info');
      return;
    }

    setSaving(true);
    try {
      // Use the new storage service batch move functionality
      const moves = pendingChanges.map(change => ({
        itemId: change.itemId,
        newDrawerId: change.newLocation.drawerId,
      }));

      const result = await storageService.batchMoveItems(moves);

      if (result.success) {
        showSnackbar(`Successfully moved ${result.count} item${result.count === 1 ? '' : 's'}!`, 'success');

        // Clear pending changes and reload data to get fresh state
        setPendingChanges([]);
        await loadStorageData();
      } else {
        throw new Error('Batch move operation failed');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      showSnackbar('Error saving changes. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Discard all pending changes
  const handleDiscardChanges = async () => {
    try {
      await loadStorageData(); // Reload fresh data from API
      setPendingChanges([]);
      showSnackbar('All changes discarded.', 'info');
    } catch (error) {
      console.error('Error reloading data:', error);
      showSnackbar('Error reloading data. Please refresh the page.', 'error');
    }
  };

  // Helper functions to get names from IDs
  const getCabinetNameFromId = (cabinetId: string): string => {
    const cabinet = storageData.find(c => c.id === cabinetId);
    return cabinet?.name || cabinetId;
  };

  const getDrawerNameFromId = (cabinetId: string, drawerId: string): string => {
    const cabinet = storageData.find(c => c.id === cabinetId);
    const drawer = cabinet?.drawers.find(d => d.id === drawerId);
    return drawer?.name || drawerId;
  };

  const resetForm = () => {
    setAddDialogOpen(false);
    setSelectedCabinet('');
    setSelectedDrawer('');
    setItemName('');
    setItemCategory('microcontroller'); // Updated to match backend enum
    setItemQuantity('1');
  };

  const resetEditForm = () => {
    setEditDialogOpen(false);
    setEditingItem(null);
    setItemName('');
    setItemCategory('microcontroller'); // Updated to match backend enum
    setItemQuantity('1');
  };

  const getDrawersForCabinet = (cabinetId: string) => {
    const cabinet = storageData.find((c) => c.id === cabinetId);
    return cabinet?.drawers || [];
  };

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
      'Other': '#6b7280',
      'other': '#6b7280',
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
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading storage data...
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <StorageIcon sx={{ fontSize: 32, color: '#1a73e8' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Storage Management
          </Typography>
          {pendingChanges.length > 0 && (
            <Badge badgeContent={pendingChanges.length} color="warning" sx={{ '& .MuiBadge-badge': { color: 'white' } }}>
              <Chip
                label={`${pendingChanges.length} unsaved change${pendingChanges.length === 1 ? '' : 's'}`}
                color="warning"
                size="small"
                sx={{ color: 'white' }}
              />
            </Badge>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {pendingChanges.length > 0 && (
            <>
              <Button
                variant="outlined"
                size="small"
                startIcon={<UndoIcon sx={{ fontSize: 16 }} />}
                onClick={handleDiscardChanges}
                disabled={saving}
                sx={{
                  fontSize: '0.875rem',
                  px: 2,
                  py: 0.5,
                  minHeight: 32,
                  textTransform: 'none',
                  borderColor: '#d1d5db',
                  color: '#6b7280',
                  '&:hover': {
                    borderColor: '#9ca3af',
                    backgroundColor: '#f9fafb'
                  }
                }}
              >
                Discard
              </Button>
              <Button
                variant="contained"
                size="small"
                color="success"
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon sx={{ fontSize: 16 }} />}
                onClick={handleSaveChanges}
                disabled={saving || pendingChanges.length === 0}
                sx={{
                  fontSize: '0.875rem',
                  px: 2,
                  py: 0.5,
                  minHeight: 32,
                  textTransform: 'none',
                  backgroundColor: '#10b981',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#059669'
                  }
                }}
              >
                {saving ? 'Saving...' : `Save (${pendingChanges.length})`}
              </Button>
            </>
          )}
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            onClick={() => setAddDialogOpen(true)}
            sx={{
              fontSize: '0.875rem',
              px: 2,
              py: 0.5,
              minHeight: 32,
              textTransform: 'none',
              backgroundColor: '#1a73e8',
              '&:hover': {
                backgroundColor: '#1557b0'
              }
            }}
          >
            Add Item
          </Button>
        </Box>
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
                                backgroundColor: draggedItem?.itemId === item.id ? '#e3f2fd' :
                                  hasItemPendingChanges(item.id) ? '#fff3e0' : '#f3f4f6',
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
                                border: hasItemPendingChanges(item.id)
                                  ? '2px solid #f59e0b'
                                  : draggedItem?.itemId === item.id
                                    ? '2px dashed #1a73e8'
                                    : 'none',
                                position: 'relative',
                              }}
                            >
                              {hasItemPendingChanges(item.id) && (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: -8,
                                    right: -8,
                                    backgroundColor: '#f59e0b',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: 20,
                                    height: 20,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 12,
                                    fontWeight: 'bold'
                                  }}
                                >
                                  !
                                </Box>
                              )}

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                                <DragIndicatorIcon sx={{ fontSize: 18, color: '#9ca3af', cursor: 'grab' }} />
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                                    {item.name}
                                    {hasItemPendingChanges(item.id) && (
                                      <Chip
                                        label="Moved"
                                        size="small"
                                        color="warning"
                                        sx={{ ml: 1, height: 16, fontSize: 10, color: 'white' }}
                                      />
                                    )}
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
                <MenuItem value="microcontroller">Microcontroller</MenuItem>
                <MenuItem value="component">Component</MenuItem>
                <MenuItem value="tool">Tool</MenuItem>
                <MenuItem value="sensor">Sensor</MenuItem>
                <MenuItem value="other">Other</MenuItem>
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
                <MenuItem value="microcontroller">Microcontroller</MenuItem>
                <MenuItem value="component">Component</MenuItem>
                <MenuItem value="tool">Tool</MenuItem>
                <MenuItem value="sensor">Sensor</MenuItem>
                <MenuItem value="other">Other</MenuItem>
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

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      </>
      )}
    </Box>
  );
};

export default AdminStorageManagementPage;
