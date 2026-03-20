import React from 'react';
import { Box } from '@mui/material';
import NovaChatHeader from './NovaChatHeader';
import NovaChatMessages from './NovaChatMessages';
import ChatInput from './ChatInput';

interface ChatMessage {
  id: string;
  type: 'nova' | 'user';
  text: string;
  timestamp: Date;
  actions?: Array<{ label: string; onClick: () => void }>;
  quickActions?: string[];
}

interface NovaChatWidgetProps {
  isOpen: boolean;
  messages: ChatMessage[];
  inputValue: string;
  isTyping: boolean;
  onClose: () => void;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onQuickActionClick?: (action: string) => void;
}

/**
 * Nova Chat Widget Component
 * Main chat window container with header, messages, and input
 */
const NovaChatWidget: React.FC<NovaChatWidgetProps> = ({
  isOpen,
  messages,
  inputValue,
  isTyping,
  onClose,
  onInputChange,
  onSendMessage,
  onQuickActionClick,
}) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: { xs: 0, md: 88 },
        right: { xs: 0, md: 24 },
        width: { xs: '100%', md: 380 },
        height: { xs: '80vh', md: 600 },
        borderRadius: { xs: '12px 12px 0 0', md: '12px' },
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        zIndex: 9998,
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? 'translateY(0) scaleY(1)' : 'translateY(20px) scaleY(0.95)',
        transformOrigin: { xs: 'bottom left', md: 'bottom right' },
        visibility: isOpen ? 'visible' : 'hidden',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: isOpen ? 'auto' : 'none',
      }}
    >
      {/* Header */}
      <NovaChatHeader onClose={onClose} />

      {/* Messages Area */}
      <NovaChatMessages
        messages={messages}
        isTyping={isTyping}
        onQuickActionClick={onQuickActionClick}
      />

      {/* Input Area */}
      <ChatInput
        value={inputValue}
        onChange={onInputChange}
        onSend={onSendMessage}
        disabled={isTyping}
      />
    </Box>
  );
};

export default NovaChatWidget;
