import React, { useRef } from 'react';
import { Box, IconButton, Badge, Typography, keyframes } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';

interface NovaChatButtonProps {
  onClick: () => void;
  onLongPress: () => void;
  isOpen: boolean;
  isVoiceMode: boolean;
  unreadCount: number;
}

// Pulse animation for first load
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(0, 181, 223, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 181, 223, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 181, 223, 0);
  }
`;

// Voice-mode ring animation
const voiceRing = keyframes`
  0%   { transform: scale(1);   opacity: 0.8; }
  100% { transform: scale(1.8); opacity: 0;   }
`;

const LONG_PRESS_DURATION = 2000; // 2 seconds

/**
 * Nova Chat Floating Button Component
 * Fixed position button in bottom-right corner.
 * - Click: open/close chat widget
 * - Hold 2 seconds: activate voice session
 */
const NovaChatButton: React.FC<NovaChatButtonProps> = ({
  onClick,
  onLongPress,
  isOpen,
  isVoiceMode,
  unreadCount,
}) => {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress   = useRef(false);

  const handlePointerDown = () => {
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      onLongPress();
    }, LONG_PRESS_DURATION);
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleClick = () => {
    // Ignore click if it was triggered at the end of a long press
    if (didLongPress.current) {
      didLongPress.current = false;
      return;
    }
    onClick();
  };

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
        {/* Voice-mode ripple ring */}
        {isVoiceMode && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px solid #00B5DF',
              animation: `${voiceRing} 1.4s ease-out infinite`,
              pointerEvents: 'none',
            }}
          />
        )}

        <IconButton
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          aria-label="Open Nova AI Assistant (hold 2s for voice)"
          aria-expanded={isOpen}
          title="Click to chat · Hold 2s for voice"
          sx={{
            width: { xs: 56, md: 60 },
            height: { xs: 56, md: 60 },
            borderRadius: '50%',
            background: isVoiceMode
              ? 'linear-gradient(135deg, #00B5DF 0%, #003063 100%)'
              : 'linear-gradient(135deg, #003063 0%, #00B5DF 100%)',
            color: 'white',
            boxShadow: isVoiceMode
              ? '0 4px 20px rgba(0, 181, 223, 0.6)'
              : '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            animation: !isOpen && !isVoiceMode ? `${pulse} 2s infinite` : 'none',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0 6px 20px rgba(0, 181, 223, 0.4)',
            },
            transition: 'all 0.2s ease',
            userSelect: 'none',
            WebkitUserSelect: 'none',
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
