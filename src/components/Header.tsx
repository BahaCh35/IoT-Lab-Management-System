import React from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  onSearch?: (query: string) => void;
  user?: { name: string; email: string; avatar?: string; role: string };
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch, user, onLogout }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [searchValue, setSearchValue] = React.useState('');

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: '#ffffff',
        color: '#111827',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
      }}
      elevation={0}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', height: 70 }}>
        {/* Logo and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #1a73e8 0%, #7c3aed 100%)',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.2rem',
            }}
          >
            SL
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
            SmartLab
          </Typography>
        </Box>

        {/* Search Bar */}
        <Box sx={{ flex: 1, maxWidth: 400, mx: 2 }}>
          <TextField
            size="small"
            placeholder="Search equipment, tools..."
            fullWidth
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                '&:hover': {
                  border: '1px solid #d1d5db',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#6b7280' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Right Side Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationBell />

          <IconButton onClick={handleMenu} sx={{ ml: 1 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #1a73e8 0%, #7c3aed 100%)',
                cursor: 'pointer',
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem sx={{ py: 1.5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  {user?.email}
                </Typography>
                <Chip
                  label={user?.role === 'admin' ? '👨‍💼 Admin' : user?.role}
                  size="small"
                  sx={{
                    width: 'fit-content',
                    mt: 0.5,
                    backgroundColor: user?.role === 'admin' ? '#ef4444' : '#dbeafe',
                    color: user?.role === 'admin' ? 'white' : '#1e40af',
                    fontWeight: 600
                  }}
                />
              </Box>
            </MenuItem>
            <MenuItem onClick={handleClose} sx={{ gap: 1 }}>
              <PersonIcon fontSize="small" />
              Profile
            </MenuItem>
            <MenuItem
              onClick={() => {
                onLogout?.();
                handleClose();
              }}
              sx={{ gap: 1, color: '#ef4444' }}
            >
              <LogoutIcon fontSize="small" />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
