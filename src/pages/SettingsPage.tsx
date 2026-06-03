import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  Divider,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Avatar,
  Chip,
  Alert,
  Snackbar,
  InputAdornment,
  IconButton,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import NotificationsIcon from '@mui/icons-material/Notifications';
import InfoIcon from '@mui/icons-material/Info';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SaveIcon from '@mui/icons-material/Save';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { apiClient } from '../services/api';

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  admin:      { bg: '#FEE2E2', text: '#DC2626' },
  engineer:   { bg: '#DBEAFE', text: '#1D4ED8' },
  technician: { bg: '#FEF3C7', text: '#D97706' },
  guest:      { bg: '#F1F5F9', text: '#64748B' },
};

const SectionCard: React.FC<{ icon?: React.ReactNode; title?: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <Card sx={{ borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: 'none', mb: 3 }}>
    {title && (
      <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid #f3f4f6' }}>
        <Box sx={{ color: '#1a73e8' }}>{icon}</Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827' }}>{title}</Typography>
      </Box>
    )}
    <Box sx={{ p: 3 }}>{children}</Box>
  </Card>
);

const SettingsPage: React.FC = () => {
  const stored = sessionStorage.getItem('user');
  const user = stored ? JSON.parse(stored) : null;

  // Account fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountMsg, setAccountMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Notification preferences (localStorage)
  const [notifPrefs, setNotifPrefs] = useState({
    lowStock: true,
    maintenance: true,
    reservations: true,
    approvals: true,
  });

  const [snackbar, setSnackbar] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('notif_prefs');
    if (saved) setNotifPrefs(JSON.parse(saved));
    const savedAvatar = localStorage.getItem(`avatar_${user?.id || user?.email}`);
    if (savedAvatar) setAvatarUrl(savedAvatar);
  }, []);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAvatarUrl(dataUrl);
      localStorage.setItem(`avatar_${user?.id || user?.email}`, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAccount = async () => {
    if (!name.trim()) return;
    setAccountSaving(true);
    try {
      await apiClient.put(`/users/${user.id}`, { name, phone });
      const updated = { ...user, name };
      sessionStorage.setItem('user', JSON.stringify(updated));
      setAccountMsg({ type: 'success', text: 'Account updated successfully.' });
    } catch {
      setAccountMsg({ type: 'error', text: 'Failed to update account.' });
    } finally {
      setAccountSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Please fill in all password fields.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    setPasswordSaving(true);
    try {
      await apiClient.put(`/users/${user.id}`, {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setPasswordMsg({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setPasswordMsg({ type: 'error', text: 'Failed to change password. Check your current password.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleToggleNotif = (key: keyof typeof notifPrefs) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    localStorage.setItem('notif_prefs', JSON.stringify(updated));
    setSnackbar('Notification preferences saved.');
  };

  const roleColor = ROLE_COLORS[user?.role] || ROLE_COLORS.guest;

  return (
    <Box sx={{ p: 3, maxWidth: 760, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>Settings</Typography>
      <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
        Manage your account, security, and preferences.
      </Typography>

      {/* Security */}
      <SectionCard icon={<LockIcon />} title="Security">
        <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
          Change your password. Use a strong password of at least 8 characters.
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Current Password"
            type={showCurrent ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowCurrent((v) => !v)}>
                    {showCurrent ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="New Password"
            type={showNew ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowNew((v) => !v)}>
                    {showNew ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            size="small"
            fullWidth
          />
        </Box>
        {passwordMsg && (
          <Alert severity={passwordMsg.type} sx={{ mt: 2 }} onClose={() => setPasswordMsg(null)}>
            {passwordMsg.text}
          </Alert>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<LockIcon />}
            onClick={handleChangePassword}
            disabled={passwordSaving}
            sx={{ backgroundColor: '#1a73e8', textTransform: 'none', borderRadius: 2 }}
          >
            {passwordSaving ? 'Updating...' : 'Update Password'}
          </Button>
        </Box>
      </SectionCard>

      {/* Notifications */}
      <SectionCard icon={<NotificationsIcon />} title="Notification Preferences">
        <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
          Choose which in-app notifications you want to receive.
        </Typography>
        {[
          { key: 'lowStock', label: 'Low Stock Alerts', desc: 'When a component drops below the minimum threshold' },
          { key: 'maintenance', label: 'Maintenance Updates', desc: 'Status changes on maintenance tasks' },
          { key: 'reservations', label: 'Reservation Updates', desc: 'Confirmations and changes to your reservations' },
          { key: 'approvals', label: 'Approval Requests', desc: 'New requests awaiting your approval' },
        ].map(({ key, label, desc }) => (
          <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid #f3f4f6' }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>{label}</Typography>
              <Typography variant="caption" sx={{ color: '#9ca3af' }}>{desc}</Typography>
            </Box>
            <Switch
              checked={notifPrefs[key as keyof typeof notifPrefs]}
              onChange={() => handleToggleNotif(key as keyof typeof notifPrefs)}
              sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#1a73e8' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#1a73e8' } }}
            />
          </Box>
        ))}
      </SectionCard>

      {/* About */}
      <SectionCard icon={<InfoIcon />} title="About">
        {[
          { label: 'Application', value: 'SmartLab' },
          { label: 'Version', value: '1.0.0' },
          { label: 'Description', value: 'IoT Laboratory Management System' },
          { label: 'Backend', value: 'Laravel 11 + MySQL' },
          { label: 'Frontend', value: 'React 18 + MUI v5' },
        ].map(({ label, value }) => (
          <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #f9fafb' }}>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>{label}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>{value}</Typography>
          </Box>
        ))}
      </SectionCard>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar('')}
        message={snackbar}
      />
    </Box>
  );
};

export default SettingsPage;
