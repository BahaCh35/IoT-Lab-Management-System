import React, { useEffect, useRef } from 'react';
import { Box, Chip } from '@mui/material';
import Message from './Message';
import TypingIndicator from './TypingIndicator';

interface ChatMessage {
  id: string;
  type: 'nova' | 'user';
  text: string;
  timestamp: Date;
  actions?: Array<{ label: string; onClick: () => void }>;
  quickActions?: string[];
}

interface NovaChatMessagesProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onQuickActionClick?: (action: string) => void;
}

/**
 * Chat Messages Component
 * Displays all messages with auto-scroll to latest message
 */
const NovaChatMessages: React.FC<NovaChatMessagesProps> = ({
  messages,
  isTyping,
  onQuickActionClick,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <Box
      sx={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        backgroundColor: 'white',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#d1d5db',
          borderRadius: '3px',
          '&:hover': {
            backgroundColor: '#9ca3af',
          },
        },
      }}
    >
      {messages.map((message) => (
        <div key={message.id}>
          <Message
            type={message.type}
            text={message.text}
            timestamp={message.timestamp}
            actions={message.actions}
          />

          {/* Quick Actions - Shown below Nova's greeting message */}
          {message.quickActions && message.quickActions.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                mb: 2,
              }}
            >
              {message.quickActions.map((action, index) => (
                <Chip
                  key={index}
                  label={action}
                  onClick={() => onQuickActionClick?.(action)}
                  sx={{
                    backgroundColor: 'white',
                    border: '1px solid #667eea',
                    color: '#667eea',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: '#f0f4ff',
                      borderColor: '#764ba2',
                      color: '#764ba2',
                      cursor: 'pointer',
                    },
                    transition: 'all 0.2s ease',
                  }}
                />
              ))}
            </Box>
          )}
        </div>
      ))}

      {/* Typing Indicator */}
      {isTyping && <TypingIndicator />}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default NovaChatMessages;
