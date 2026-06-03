import React from 'react';
import { Box, TextField, IconButton, Tooltip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStartVoice: () => void;
  disabled?: boolean;
}

/**
 * Chat Input Component
 * Text input field with send button and voice button.
 */
const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onStartVoice,
  disabled = false,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 1,
        padding: '16px',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: 'white',
      }}
    >
      {/* Text Input */}
      <TextField
        fullWidth
        size="small"
        placeholder="Ask Nova anything..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        multiline
        maxRows={3}
        aria-label="Chat message input"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '24px',
            backgroundColor: '#f9fafb',
            '& fieldset': {
              borderColor: '#e5e7eb',
            },
            '&:hover fieldset': {
              borderColor: '#00B5DF',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00B5DF',
              boxShadow: '0 0 0 3px rgba(0, 181, 223, 0.15)',
            },
          },
          '& .MuiOutlinedInput-input': {
            padding: '12px 16px',
            fontSize: '14px',
            '&::placeholder': {
              color: '#9ca3af',
              opacity: 1,
            },
          },
        }}
      />

      {/* Microphone Button — starts voice session */}
      <Tooltip title="Start voice conversation" placement="top">
        <IconButton
          onClick={onStartVoice}
          size="small"
          disabled={disabled}
          sx={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'none',
            backgroundColor: '#f9fafb',
            color: '#00B5DF',
            border: '1px solid #e5e7eb',
            '&:hover': {
              background: 'none',
              backgroundColor: '#e6f8fc',
              borderColor: '#00B5DF',
            },
            '&.Mui-disabled': {
              color: '#9ca3af',
            },
            transition: 'all 0.2s ease',
          }}
          aria-label="Start voice conversation"
        >
          <MicIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Tooltip>

      {/* Send Button */}
      <IconButton
        onClick={onSend}
        size="small"
        disabled={disabled || !value.trim()}
        sx={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'none',
          backgroundColor: '#f9fafb',
          color: '#00B5DF',
          border: '1px solid #e5e7eb',
          '&:hover': {
            background: 'none',
            backgroundColor: '#e6f8fc',
            borderColor: '#00B5DF',
          },
          '&.Mui-disabled': {
            color: '#9ca3af',
          },
          transition: 'all 0.2s ease',
        }}
        aria-label="Send message"
      >
        <SendIcon sx={{ fontSize: 20 }} />
      </IconButton>
    </Box>
  );
};

export default ChatInput;
