import React from 'react';
import { Box } from '@mui/material';

/**
 * Typing Indicator Component
 * Shows three animated dots while waiting for Nova's response
 */
const TypingIndicator: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 2,
        backgroundColor: '#f3f4f6',
        borderRadius: 2,
        width: 'fit-content',
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: '#9ca3af',
          animation: 'typing 1.4s infinite',
          '@keyframes typing': {
            '0%, 60%, 100%': {
              opacity: 0.3,
            },
            '30%': {
              opacity: 1,
            },
          },
        }}
      />
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: '#9ca3af',
          animation: 'typing 1.4s infinite',
          animationDelay: '0.2s',
          '@keyframes typing': {
            '0%, 60%, 100%': {
              opacity: 0.3,
            },
            '30%': {
              opacity: 1,
            },
          },
        }}
      />
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: '#9ca3af',
          animation: 'typing 1.4s infinite',
          animationDelay: '0.4s',
          '@keyframes typing': {
            '0%, 60%, 100%': {
              opacity: 0.3,
            },
            '30%': {
              opacity: 1,
            },
          },
        }}
      />
    </Box>
  );
};

export default TypingIndicator;
