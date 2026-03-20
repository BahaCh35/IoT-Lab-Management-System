import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy';

interface NovaChatHeaderProps {
  onClose: () => void;
}

/**
 * Chat Widget Header Component
 * Contains title and close button with gradient background
 */
const NovaChatHeader: React.FC<NovaChatHeaderProps> = ({ onClose }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        height: '60px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)',
      }}
    >
      {/* Left: Icon + Title */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <SmartToyIcon
          sx={{
            fontSize: 28,
            color: 'white',
            fontWeight: 700,
          }}
        />
        <Typography
          variant="h6"
          sx={{
            color: 'white',
            fontWeight: 700,
            fontSize: '16px',
          }}
        >
          Nova AI Assistant
        </Typography>
      </Box>

      {/* Right: Close Button */}
      <IconButton
        onClick={onClose}
        aria-label="Close chat"
        sx={{
          color: 'white',
          width: 36,
          height: 36,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
          },
          transition: 'all 0.2s ease',
        }}
      >
        <CloseIcon sx={{ fontSize: 20 }} />
      </IconButton>
    </Box>
  );
};

export default NovaChatHeader;
