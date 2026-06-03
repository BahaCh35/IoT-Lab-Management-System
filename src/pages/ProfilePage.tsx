import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { userService } from '../services/userService';
import type { UserProfile } from '../types';

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  admin:       { bg: '#FEE2E2', text: '#DC2626' },
  engineer:    { bg: '#DBEAFE', text: '#1D4ED8' },
  technician:  { bg: '#FEF3C7', text: '#D97706' },
  'lab-manager': { bg: '#EDE9FE', text: '#7C3AED' },
  guest:       { bg: '#F1F5F9', text: '#64748B' },
};

const INFO_ROWS = [
  { key: 'email',      label: 'Email',       icon: <EmailIcon sx={{ fontSize: 18 }} /> },
  { key: 'role',       label: 'Role',        icon: <BadgeIcon sx={{ fontSize: 18 }} /> },
  { key: 'department', label: 'Department',  icon: <BusinessIcon sx={{ fontSize: 18 }} /> },
  { key: 'phone',      label: 'Phone',       icon: <PhoneIcon sx={{ fontSize: 18 }} /> },
  { key: 'joinDate',   label: 'Member Since',icon: <CalendarTodayIcon sx={{ fontSize: 18 }} /> },
] as const;

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('user');
    if (!stored) { setError('Not logged in.'); setLoading(false); return; }
    const basic = JSON.parse(stored) as { id: string };
    const savedAvatar = localStorage.getItem(`avatar_${basic.id}`);
    if (savedAvatar) setAvatarUrl(savedAvatar);
    userService.getUserById(basic.id)
      .then((p) => {
        if (p) setProfile(p as UserProfile);
        else setError('Profile not found.');
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress sx={{ color: '#4361EE' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!profile) return null;

  const initials = profile.name
    ?.split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() ?? 'U';

  const roleStyle = ROLE_COLORS[profile.role] ?? ROLE_COLORS.guest;

  const infoValues: Record<string, string | undefined> = {
    email:      profile.email,
    role:       profile.role,
    department: profile.department,
    phone:      profile.phone,
    joinDate:   profile.joinDate
      ? new Date(profile.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : profile.createdAt
        ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : undefined,
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 680, mx: 'auto' }}>
      {/* Page title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <PersonIcon sx={{ color: '#4361EE', fontSize: 26 }} />
        <Typography variant="h5" fontWeight={700} color="#1E293B">
          My Profile
        </Typography>
      </Box>

      {/* Avatar card */}
      <Box
        sx={{
          backgroundColor: '#fff',
          borderRadius: 3,
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5,
          mb: 3,
        }}
      >
        <Box sx={{ position: 'relative', width: 88, height: 88, cursor: 'pointer' }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Avatar
            src={avatarUrl || undefined}
            sx={{
              width: 88,
              height: 88,
              fontSize: 32,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #003063 0%, #00B5DF 100%)',
            }}
          >
            {!avatarUrl && initials}
          </Avatar>
          <Box sx={{ position: 'absolute', bottom: 2, right: 2, backgroundColor: '#003063', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
            <CameraAltIcon sx={{ fontSize: 13, color: 'white' }} />
          </Box>
        </Box>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
              const dataUrl = ev.target?.result as string;
              setAvatarUrl(dataUrl);
              const stored = sessionStorage.getItem('user');
              const u = stored ? JSON.parse(stored) : null;
              if (u) {
                localStorage.setItem(`avatar_${u.id}`, dataUrl);
                window.dispatchEvent(new Event('storage'));
              }
            };
            reader.readAsDataURL(file);
          }}
        />
        {avatarUrl && (
          <Typography
            variant="caption"
            onClick={() => {
              setAvatarUrl(null);
              const stored = sessionStorage.getItem('user');
              const u = stored ? JSON.parse(stored) : null;
              if (u) {
                localStorage.removeItem(`avatar_${u.id}`);
                window.dispatchEvent(new Event('storage'));
              }
            }}
            sx={{ color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem', mt: -0.5, '&:hover': { textDecoration: 'underline' } }}
          >
            Remove photo
          </Typography>
        )}
        <Typography variant="h6" fontWeight={700} color="#1E293B">
          {profile.name}
        </Typography>
        <Chip
          label={profile.role.toUpperCase()}
          size="small"
          sx={{
            backgroundColor: roleStyle.bg,
            color: roleStyle.text,
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: 0.5,
          }}
        />
        <Chip
          label={profile.isActive ? 'Active' : 'Inactive'}
          size="small"
          sx={{
            backgroundColor: profile.isActive ? '#DCFCE7' : '#FEE2E2',
            color: profile.isActive ? '#16A34A' : '#DC2626',
            fontWeight: 600,
            fontSize: 11,
          }}
        />
      </Box>

      {/* Info card */}
      <Box
        sx={{
          backgroundColor: '#fff',
          borderRadius: 3,
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}
      >
        {INFO_ROWS.filter((r) => infoValues[r.key]).map((row, i, arr) => (
          <React.Fragment key={row.key}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 3,
                py: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#64748B' }}>
                {row.icon}
                <Typography variant="body2" color="#64748B">
                  {row.label}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                fontWeight={600}
                color="#1E293B"
                sx={{ textAlign: 'right', maxWidth: '60%', textTransform: row.key === 'role' ? 'capitalize' : 'none' }}
              >
                {infoValues[row.key]}
              </Typography>
            </Box>
            {i < arr.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
};

export default ProfilePage;
