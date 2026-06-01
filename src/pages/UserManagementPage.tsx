import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Paper, MenuItem } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import { userService } from '../services/userService';
import { UserProfile } from '../types';

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    phone: '',
    role: 'engineer' as 'admin' | 'engineer' | 'technician',
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    engineers: 0,
    admins: 0,
    technicians: 0,
  });
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    try {
      const allUsers = await userService.getUsers();
      setUsers(allUsers);

      // Calculate stats from loaded users
      const statsData = await userService.getUserStats();
      setStats({
        totalUsers: statsData.totalUsers,
        activeUsers: statsData.activeUsers,
        inactiveUsers: statsData.inactiveUsers,
        engineers: statsData.engineers || 0,
        admins: statsData.admins || 0,
        technicians: statsData.technicians || 0,
      });
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddClick = () => {
    setEditingUser(null);
    setFormData({ firstName: '', lastName: '', email: '', department: '', phone: '', role: 'engineer' });
    setOpenDialog(true);
  };

  const handleEditClick = (user: UserProfile) => {
    setEditingUser(user);
    const parts = user.name.trim().split(' ');
    setFormData({
      firstName: parts[0] ?? '',
      lastName: parts.slice(1).join(' '),
      email: user.email,
      department: user.department,
      phone: user.phone || '',
      role: (user.role === 'admin' || user.role === 'engineer' || user.role === 'technician') ? user.role : 'engineer',
    });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const userData = {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
        email: formData.email,
        department: formData.department,
        phone: formData.phone,
        role: formData.role,
      };

      if (editingUser) {
        await userService.updateUser(editingUser.id, userData);
      } else {
        await userService.createUser({ ...userData, password: 'password123' });
      }

      await loadUsers();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      if (isActive) {
        await userService.deactivateUser(id);
      } else {
        await userService.activateUser(id);
      }
      await loadUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Failed to update user status. Please try again.');
    }
  };

  const handleDeleteClick = (user: UserProfile) => {
    setEditingUser(user);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (editingUser) {
      setLoading(true);
      try {
        await userService.deleteUser(editingUser.id);
        await loadUsers();
        setDeleteConfirmOpen(false);
        setOpenDialog(false);
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PeopleIcon sx={{ fontSize: 32, color: '#1a73e8' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            User Management
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
          Add User
        </Button>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(5, 1fr)' }, gap: 3, mb: 4 }}>
        <Card sx={{ backgroundColor: '#f0f4ff' }}>
          <CardContent>
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
              Total Users
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a73e8', mt: 1 }}>
              {stats.totalUsers}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ backgroundColor: '#e8f5e9' }}>
          <CardContent>
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
              Active
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981', mt: 1 }}>
              {stats.activeUsers}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ backgroundColor: '#ffebee' }}>
          <CardContent>
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
              Admins
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#ef4444', mt: 1 }}>
              {stats.admins}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ backgroundColor: '#dbeafe' }}>
          <CardContent>
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
              Engineers
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1d4ed8', mt: 1 }}>
              {stats.engineers}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ backgroundColor: '#fff3e0' }}>
          <CardContent>
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
              Technicians
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b', mt: 1 }}>
              {stats.technicians}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper} sx={{ backgroundColor: '#f8fafc' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: '#f9fafb' }, opacity: user.isActive ? 1 : 0.6 }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {user.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip label={user.role} size="small" sx={{
                        backgroundColor:
                          user.role === 'admin' ? '#ef4444' :
                          user.role === 'technician' ? '#FEF3C7' :
                          '#dbeafe',
                        color:
                          user.role === 'admin' ? 'white' :
                          user.role === 'technician' ? '#D97706' :
                          '#1e40af',
                        fontWeight: 600,
                      }} />
                    </TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>{user.phone || '—'}</TableCell>
                    <TableCell>
                      <Chip label={user.isActive ? 'Active' : 'Inactive'} size="small" sx={{ backgroundColor: user.isActive ? '#e8f5e9' : '#ffebee', color: user.isActive ? '#10b981' : '#ef4444' }} />
                    </TableCell>
                    <TableCell>
                      <Button size="small" startIcon={<EditIcon />} onClick={() => handleEditClick(user)} sx={{ mr: 1 }}>
                        Edit
                      </Button>
                      <Button size="small" startIcon={user.isActive ? <ToggleOnIcon /> : <ToggleOffIcon />} onClick={() => handleToggleStatus(user.id, user.isActive)} sx={{ mr: 1 }}>
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button size="small" startIcon={<DeleteIcon />} onClick={() => handleDeleteClick(user)} sx={{ color: '#ef4444' }}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="First Name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} fullWidth />
            <TextField label="Last Name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} fullWidth />
          </Box>
          <TextField label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} fullWidth />
          <TextField
            label="Role"
            select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'engineer' | 'technician' })}
            fullWidth
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="engineer">Engineer</MenuItem>
            <MenuItem value="technician">Technician</MenuItem>
          </TextField>
          <TextField label="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} fullWidth />
          <TextField label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} fullWidth />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Box>
            {editingUser && (
              <Button
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteConfirmOpen(true)}
                sx={{ textTransform: 'none' }}
              >
                Delete User
              </Button>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} variant="contained">Save</Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to permanently delete <strong>{editingUser?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteConfirm}
            sx={{ textTransform: 'none' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagementPage;
