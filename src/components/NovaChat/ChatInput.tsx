import React from 'react';
import { Box, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

/**
 * Chat Input Component
 * Text input field with send button and optional microphone button
 */
const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSend, disabled = false }) => {
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
              borderColor: '#667eea',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#667eea',
              boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
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

      {/* Microphone Button (Optional for future) */}
      <IconButton
        size="small"
        disabled={disabled}
        sx={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          backgroundColor: '#f9fafb',
          color: '#667eea',
          border: '1px solid #e5e7eb',
          '&:hover': {
            backgroundColor: '#f0f4ff',
            borderColor: '#667eea',
          },
          transition: 'all 0.2s ease',
        }}
        title="Voice input (coming soon)"
      >
        <MicIcon sx={{ fontSize: 20 }} />
      </IconButton>

      {/* Send Button */}
      <IconButton
        onClick={onSend}
        disabled={disabled || !value.trim()}
        sx={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
          },
          '&:disabled': {
            background: 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)',
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
