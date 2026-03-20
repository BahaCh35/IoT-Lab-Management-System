import React from 'react';
import { Box, IconButton, Badge, Typography, keyframes } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';

interface NovaChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
  unreadCount: number;
}

// Pulse animation for first load
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(102, 126, 234, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
  }
`;

/**
 * Nova Chat Floating Button Component
 * Fixed position button in bottom-right corner
 */
const NovaChatButton: React.FC<NovaChatButtonProps> = ({ onClick, isOpen, unreadCount }) => {
  return (
    <Badge
      badgeContent={unreadCount}
      color="error"
      sx={{
        '& .MuiBadge-badge': {
          right: -3,
          top: 13,
          border: `2px solid white`,
          padding: 0,
          minWidth: '20px',
          height: '20px',
          fontSize: '12px',
          fontWeight: 700,
        },
      }}
    >
      <Box
        sx={{
          position: 'fixed',
          bottom: { xs: 16, md: 24 },
          right: { xs: 16, md: 24 },
          zIndex: 9999,
        }}
      >
        <IconButton
          onClick={onClick}
          aria-label="Open Nova AI Assistant"
          aria-expanded={isOpen}
          sx={{
            width: { xs: 56, md: 60 },
            height: { xs: 56, md: 60 },
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            animation: !isOpen ? `${pulse} 2s infinite` : 'none',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <SmartToyIcon sx={{ fontSize: { xs: 24, md: 28 } }} />
          <Typography
            sx={{
              fontSize: { xs: '8px', md: '10px' },
              fontWeight: 700,
              lineHeight: 1,
              textAlign: 'center',
            }}
          >
            Nova
          </Typography>
        </IconButton>
      </Box>
    </Badge>
  );
};

export default NovaChatButton;
