import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import NovaChatButton from './NovaChatButton';
import NovaChatWidget from './NovaChatWidget';
import { getMockResponse, getResponseActions } from './mockResponses';

// Animation keyframes
const slideInBounce = keyframes`
  0% {
    opacity: 0;
    transform: translateX(30px) scale(0.9);
  }
  50% {
    transform: translateX(-5px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
`;

const fadeOutSlide = keyframes`
  to {
    opacity: 0;
    transform: translateX(20px);
    pointer-events: none;
  }
`;

interface ChatMessage {
  id: string;
  type: 'nova' | 'user';
  text: string;
  timestamp: Date;
  actions?: Array<{ label: string; onClick: () => void }>;
  quickActions?: string[];
}

/**
 * Nova AI Chat Widget Main Component
 * Manages state and orchestrates all sub-components
 * Appears on all pages of the application
 */
const NovaChat: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);

  // Get user-specific storage key for chat history
  const getUserStorageKey = (): string => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        return `nova_chat_history_${userData.id || userData.email || 'default'}`;
      } catch {
        return 'nova_chat_history_default';
      }
    }
    return 'nova_chat_history_default';
  };

  // Load chat history from localStorage on mount
  useEffect(() => {
    const chatKey = getUserStorageKey();
    const savedMessages = localStorage.getItem(chatKey);

    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages) as Array<{
          id: string;
          type: 'nova' | 'user';
          text: string;
          timestamp: string;
          quickActions?: string[];
        }>;

        // Convert timestamp strings back to Date objects
        // Note: actions cannot be serialized to JSON, so we don't restore them
        const messagesWithDates = parsedMessages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
          actions: undefined, // Actions with onClick functions can't be serialized to JSON
        }));

        setMessages(messagesWithDates);
      } catch (error) {
        console.error('Failed to parse chat history:', error);
        setMessages(getInitialMessages());
      }
    } else {
      setMessages(getInitialMessages());
    }
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      const chatKey = getUserStorageKey();
      const messagesToSave = messages.slice(-50).map((msg) => ({
        id: msg.id,
        type: msg.type,
        text: msg.text,
        timestamp: msg.timestamp.toISOString(),
        quickActions: msg.quickActions,
        // Note: actions with onClick functions are not serialized
      }));
      localStorage.setItem(chatKey, JSON.stringify(messagesToSave));
    }
  }, [messages]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key closes the chat
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Show welcome bubble on every page load
  useEffect(() => {
    // Show welcome message after 1 second delay
    const showTimer = setTimeout(() => setShowWelcome(true), 1000);

    // Hide after 10 seconds
    const hideTimer = setTimeout(() => {
      setShowWelcome(false);
    }, 11000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // Get initial welcome message
  const getInitialMessages = (): ChatMessage[] => {
    return [
      {
        id: '1',
        type: 'nova',
        text: "Hi! I'm Nova, your lab assistant. How can I help you today?",
        timestamp: new Date(),
        quickActions: ['Find equipment', 'Check availability', 'Make reservation'],
      },
    ];
  };

  // Send message function
  const sendMessage = (messageText: string) => {
    if (!messageText.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      text: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate Nova's response after 1 second
    setTimeout(() => {
      const responseText = getMockResponse(messageText);
      const actions = getResponseActions(messageText);

      const novaResponse: ChatMessage = {
        id: `nova-${Date.now()}`,
        type: 'nova',
        text: responseText,
        timestamp: new Date(),
        actions: actions || undefined,
      };

      setMessages((prev) => [...prev, novaResponse]);
      setIsTyping(false);

      // Show unread count if widget is closed
      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    }, 1000);
  };

  // Handle quick action buttons
  const handleQuickAction = (actionText: string) => {
    sendMessage(actionText);
  };

  // Clear unread count when widget opens
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  return location.pathname === '/login' ? null : (
    <Box>
      {/* Welcome Text Bubble - Shows on every page load */}
      {showWelcome && !isOpen && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 106,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '12px 18px',
            borderRadius: '24px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
            fontSize: '14px',
            fontWeight: 500,
            maxWidth: '280px',
            textAlign: 'center',
            zIndex: 9998,
            animation: `${slideInBounce} 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55), ${fadeOutSlide} 0.5s ease 5s forwards`,
          }}
        >
          Need something? Just ask - I'm quick!
        </Box>
      )}

      {/* Floating Chat Button */}
      <NovaChatButton
        onClick={() => {
          setShowWelcome(false);
          setIsOpen(!isOpen);
        }}
        isOpen={isOpen}
        unreadCount={unreadCount}
      />

      {/* Chat Widget */}
      <NovaChatWidget
        isOpen={isOpen}
        messages={messages}
        inputValue={inputValue}
        isTyping={isTyping}
        onClose={() => setIsOpen(false)}
        onInputChange={setInputValue}
        onSendMessage={() => sendMessage(inputValue)}
        onQuickActionClick={handleQuickAction}
      />
    </Box>
  );
};

export default NovaChat;
