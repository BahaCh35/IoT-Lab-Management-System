import React, { useState, useEffect } from 'react';
import {
  Box,
  Badge,
  IconButton,
  Popover,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Button,
  Chip,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ClearIcon from '@mui/icons-material/Clear';
import { notificationService, Notification } from '../services/notificationService';

const NotificationBell: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    const allNotifications = notificationService.getNotifications();
    setNotifications(allNotifications);
    setUnreadCount(notificationService.getUnreadCount());
  };

  const handleOpenPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      notificationService.markAsRead(notification.id);
      loadNotifications();
    }
    handleClosePopover();
  };

  const handleDeleteNotification = (
    event: React.MouseEvent<HTMLButtonElement>,
    notificationId: string
  ) => {
    event.stopPropagation();
    notificationService.deleteNotification(notificationId);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
    loadNotifications();
  };

  const handleClearAll = () => {
    if (notifications.length > 0) {
      notificationService.clearAll();
      loadNotifications();
      handleClosePopover();
    }
  };

  const getNotificationColor = (type: Notification['type']): string => {
    switch (type) {
      case 'success':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'error':
        return '#ef4444';
      case 'info':
      default:
        return '#3b82f6';
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <>
      <IconButton
        aria-describedby={id}
        color="inherit"
        onClick={handleOpenPopover}
        sx={{ mr: 1 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ width: 400, maxHeight: 500 }}>
          <Box
            sx={{
              p: 2,
              backgroundColor: '#f9fafb',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              🔔 Notifications
            </Typography>
            <Box>
              {unreadCount > 0 && (
                <Button
                  size="small"
                  onClick={handleMarkAllAsRead}
                  sx={{ mr: 1, textTransform: 'none', fontSize: '0.75rem' }}
                >
                  Mark all as read
                </Button>
              )}
              <IconButton size="small" onClick={handleClearAll} title="Clear all">
                <ClearIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {notifications.length > 0 ? (
            <List sx={{ p: 0, maxHeight: 400, overflowY: 'auto' }}>
              {notifications.map((notif, idx) => (
                <React.Fragment key={notif.id}>
                  <ListItemButton
                    onClick={() => handleNotificationClick(notif)}
                    sx={{
                      backgroundColor: notif.read ? 'transparent' : '#f0f9ff',
                      borderLeft: `4px solid ${getNotificationColor(notif.type)}`,
                      '&:hover': {
                        backgroundColor: notif.read ? '#f9fafb' : '#e0f2fe',
                      },
                      p: 1.5,
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
                            {notif.title}
                          </Typography>
                          <Chip
                            label={notif.type.toUpperCase()}
                            size="small"
                            sx={{
                              backgroundColor: getNotificationColor(notif.type) + '20',
                              color: getNotificationColor(notif.type),
                              height: 20,
                              fontSize: '0.65rem',
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" sx={{ color: '#6b7280' }}>
                            {notif.message}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: '#9ca3af', display: 'block', mt: 0.5 }}
                          >
                            {new Date(notif.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>
                        </Box>
                      }
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => handleDeleteNotification(e, notif.id)}
                      sx={{ ml: 1 }}
                    >
                      <ClearIcon fontSize="small" sx={{ color: '#9ca3af' }} />
                    </IconButton>
                  </ListItemButton>
                  {idx < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                No notifications
              </Typography>
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;
