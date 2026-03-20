import React from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory2';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsIcon from '@mui/icons-material/Settings';
import StorageIcon from '@mui/icons-material/Storage';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import MonitorIcon from '@mui/icons-material/Monitor';
import PeopleIcon from '@mui/icons-material/People';
import HistoryIcon from '@mui/icons-material/History';
import WidgetsIcon from '@mui/icons-material/Widgets';
import PersonIcon from '@mui/icons-material/Person';
import { User } from '../types';

const SIDEBAR_WIDTH = 280;

const ENGINEER_MENU_ITEMS = [
  { label: 'My Activity & Stats', path: '/analytics',       icon: PersonIcon },
  { label: 'Equipment Catalog', path: '/equipment',        icon: InventoryIcon },
  { label: 'Storage Inventory', path: '/storage',          icon: StorageIcon },
  { label: 'Meeting Rooms',   path: '/engineer/meetings',  icon: MeetingRoomIcon },
  { label: 'Labs',            path: '/engineer/labs',      icon: MonitorIcon },
];

const ADMIN_MENU_ITEMS = [
  { label: 'Dashboard',          path: '/admin',            icon: DashboardIcon },
  { label: 'Equipment Catalog',  path: '/admin/equipment',  icon: InventoryIcon },
  { label: 'Meeting Rooms',      path: '/admin/meetings',   icon: MeetingRoomIcon },
  { label: 'Labs Management',    path: '/admin/labs',       icon: MonitorIcon },
  { label: 'Storage Management', path: '/admin/storage',    icon: StorageIcon },
  { label: 'Users',              path: '/admin/users',      icon: PeopleIcon },
  { label: 'Activity Logs',      path: '/admin/activity',   icon: HistoryIcon },
  { label: 'Analytics',          path: '/admin/analytics',  icon: AnalyticsIcon },
];

const TECHNICIAN_MENU_ITEMS = [
  { label: 'Dashboard', path: '/technician', icon: DashboardIcon },
  { label: 'Maintenance History', path: '/technician/history', icon: HistoryIcon },
  { label: 'Parts Inventory', path: '/technician/parts', icon: WidgetsIcon },
];

const GUEST_MENU_ITEMS = [
  { label: 'Dashboard', path: '/guest', icon: DashboardIcon },
  { label: 'Equipment Catalog', path: '/guest/equipment', icon: InventoryIcon },
  { label: 'Meeting Rooms', path: '/guest/meetings', icon: MeetingRoomIcon },
  { label: 'Labs', path: '/guest/labs', icon: MonitorIcon },
];

const BOTTOM_MENU = [
  { label: 'Settings', path: '/settings', icon: SettingsIcon },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  user?: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ open = true, onClose, user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine which menu to show based on user role
  let menuToDisplay = ENGINEER_MENU_ITEMS;
  if (user?.role === 'admin') {
    menuToDisplay = ADMIN_MENU_ITEMS;
  } else if (user?.role === 'technician') {
    menuToDisplay = TECHNICIAN_MENU_ITEMS;
  } else if (user?.role === 'guest') {
    menuToDisplay = GUEST_MENU_ITEMS;
  }

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose?.();
  };

  const isActive = (path: string) => {
    const pathname = location.pathname;
    if (pathname === path) return true;
    // For /admin, /dashboard, /technician, /guest paths, only match exact path
    if (path === '/admin' || path === '/dashboard' || path === '/technician' || path === '/guest') {
      return pathname === path;
    }
    // For /guest/equipment paths, match exact or sub-paths
    if (path === '/guest/equipment') {
      return pathname === path || pathname.startsWith(path + '/');
    }
    // For other paths, match exact or sub-paths
    return pathname.startsWith(path + '/');
  };

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e5e7eb',
      }}
    >
      {/* Logo Section */}
      <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, #1a73e8 0%, #7c3aed 100%)',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.5rem',
            }}
          >
            SL
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
              SmartLab
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b7280' }}>
              Lab Management
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Menu */}
      <List sx={{ flex: 1, pt: 2, px: 0 }}>
        {menuToDisplay.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <ListItem
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 1,
                backgroundColor: active ? '#f0f4ff' : 'transparent',
                borderLeft: active ? '4px solid #1a73e8' : 'none',
                paddingLeft: active ? '12px' : '16px',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: active ? '#f0f4ff' : '#f9fafb',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: active ? '#1a73e8' : '#6b7280',
                }}
              >
                <Icon />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: '0.95rem',
                    fontWeight: active ? 600 : 500,
                    color: active ? '#1a73e8' : '#374151',
                  },
                }}
              />
            </ListItem>
          );
        })}
      </List>

      {/* Bottom Menu */}
      <Box sx={{ borderTop: '1px solid #e5e7eb', px: 0, py: 2 }}>
        <List sx={{ px: 0 }}>
          {/* Show AI Assistant and Settings for all roles except guest */}
          {user?.role !== 'guest' && BOTTOM_MENU.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <ListItem
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 1,
                  backgroundColor: active ? '#f0f4ff' : 'transparent',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: active ? '#f0f4ff' : '#f9fafb',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: active ? '#1a73e8' : '#6b7280',
                  }}
                >
                  <Icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.95rem',
                      fontWeight: active ? 600 : 500,
                      color: active ? '#1a73e8' : '#374151',
                    },
                  }}
                />
              </ListItem>
            );
          })}
          {/* For guests, only show Settings */}
          {user?.role === 'guest' && (
            <ListItem
              onClick={() => handleNavigation('/settings')}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 1,
                backgroundColor: isActive('/settings') ? '#f0f4ff' : 'transparent',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: isActive('/settings') ? '#f0f4ff' : '#f9fafb',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: isActive('/settings') ? '#1a73e8' : '#6b7280',
                }}
              >
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Settings"
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: '0.95rem',
                    fontWeight: isActive('/settings') ? 600 : 500,
                    color: isActive('/settings') ? '#1a73e8' : '#374151',
                  },
                }}
              />
            </ListItem>
          )}
        </List>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          position: 'fixed',
          height: '100vh',
          top: 0,
          left: 0,
          marginTop: 0,
          zIndex: 1000,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
