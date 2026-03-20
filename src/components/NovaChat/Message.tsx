import React from 'react';
import { Box, Button, Typography } from '@mui/material';

interface MessageAction {
  label: string;
  onClick: () => void;
}

interface MessageProps {
  type: 'nova' | 'user';
  text: string;
  timestamp: Date;
  actions?: MessageAction[];
}

/**
 * Message Bubble Component
 * Displays individual messages from Nova (left, gray) or User (right, blue gradient)
 */
const Message: React.FC<MessageProps> = ({ type, text, timestamp, actions }) => {
  const isNova = type === 'nova';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isNova ? 'flex-start' : 'flex-end',
        mb: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: '80%',
        }}
      >
        <Box
          sx={{
            backgroundColor: isNova ? '#f3f4f6' : '#a8bdff',
            padding: '12px 16px',
            borderRadius: 2,
            borderBottomLeftRadius: isNova ? 4 : 16,
            borderBottomRightRadius: isNova ? 16 : 4,
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: '14px',
              lineHeight: '1.5',
              fontWeight: 400,
              color: '#111827',
            }}
          >
            {text}
          </Typography>
        </Box>

        {/* Timestamp */}
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.5,
            color: '#9ca3af',
            fontSize: '11px',
            textAlign: isNova ? 'left' : 'right',
          }}
        >
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>

        {/* Action Buttons */}
        {actions && actions.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              mt: 1.5,
              flexWrap: 'wrap',
              justifyContent: isNova ? 'flex-start' : 'flex-end',
            }}
          >
            {actions.map((action, index) => (
              <Button
                key={index}
                size="small"
                onClick={action.onClick}
                sx={{
                  borderRadius: '16px',
                  textTransform: 'none',
                  fontSize: '12px',
                  border: '1px solid #667eea',
                  color: '#667eea',
                  backgroundColor: 'transparent',
                  padding: '6px 12px',
                  '&:hover': {
                    backgroundColor: '#f0f4ff',
                    borderColor: '#764ba2',
                    color: '#764ba2',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {action.label}
              </Button>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Message;
