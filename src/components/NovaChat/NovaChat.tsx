import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import NovaChatButton from './NovaChatButton';
import NovaChatWidget from './NovaChatWidget';
import VoiceSession from './VoiceSession';
import chatbotService, { ChatHistoryMessage } from '../../services/api/chatbotService';

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
  const [isOpen, setIsOpen]           = useState(false);
  const [messages, setMessages]       = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue]   = useState('');
  const [isTyping, setIsTyping]       = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);

  // Voice session state
  const [isVoiceMode, setIsVoiceMode]           = useState(false);
  const [voicePendingResp, setVoicePendingResp] = useState<string | null>(null);
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);

  // Track which user the current chat history belongs to so that switching
  // accounts within the same browser tab resets the conversation.
  const readCurrentUserId = (): string | null => {
    const raw = sessionStorage.getItem('user');
    if (!raw) return null;
    try {
      const u = JSON.parse(raw);
      return String(u.id || u.email || '') || null;
    } catch {
      return null;
    }
  };
  const [currentUserId, setCurrentUserId] = useState<string | null>(readCurrentUserId);

  // Build a per-user storage key. Uses sessionStorage to match how the rest of
  // the app stores the auth user (LoginPage stores it in sessionStorage).
  const getUserStorageKey = (userId: string | null): string => {
    return `nova_chat_history_${userId || 'default'}`;
  };

  // Detect user changes (login as a different role within the same tab).
  // Poll lightly on a short interval and also listen to the storage event.
  useEffect(() => {
    const sync = () => {
      const id = readCurrentUserId();
      setCurrentUserId((prev) => (prev === id ? prev : id));
    };
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    const interval = window.setInterval(sync, 1500);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
      window.clearInterval(interval);
    };
  }, []);

  // Load chat history when the current user changes (mount or account switch).
  useEffect(() => {
    const chatKey = getUserStorageKey(currentUserId);
    const savedMessages = sessionStorage.getItem(chatKey);

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
      // New user (or no stored history yet) → fresh welcome message
      setMessages(getInitialMessages());
    }
  }, [currentUserId]);

  // Save chat history to sessionStorage whenever messages change, scoped to
  // the current user so we never overwrite another user's history.
  useEffect(() => {
    if (messages.length > 0) {
      const chatKey = getUserStorageKey(currentUserId);
      const messagesToSave = messages.slice(-50).map((msg) => ({
        id: msg.id,
        type: msg.type,
        text: msg.text,
        timestamp: msg.timestamp.toISOString(),
        quickActions: msg.quickActions,
        // Note: actions with onClick functions are not serialized
      }));
      sessionStorage.setItem(chatKey, JSON.stringify(messagesToSave));
    }
  }, [messages, currentUserId]);

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

  // Send message function (used by both text input and voice session)
  const sendMessage = async (messageText: string, fromVoice = false) => {
    if (!messageText.trim()) return;

    // Add user message to UI immediately
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      text: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    if (fromVoice) {
      setIsVoiceProcessing(true);
    } else {
      setIsTyping(true);
    }

    // Build history from current messages (last 20, skip the message we just added)
    const history: ChatHistoryMessage[] = messages.slice(-20).map((m) => ({
      role: m.type === 'user' ? 'user' : 'nova',
      text: m.text,
    }));

    try {
      const responseText = await chatbotService.sendMessage(messageText, history);

      const novaResponse: ChatMessage = {
        id: `nova-${Date.now()}`,
        type: 'nova',
        text: responseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, novaResponse]);

      if (fromVoice) {
        setIsVoiceProcessing(false);
        setVoicePendingResp(responseText);
      } else {
        setIsTyping(false);
        if (!isOpen) {
          setUnreadCount((prev) => prev + 1);
        }
      }
    } catch {
      const errorResponse: ChatMessage = {
        id: `nova-${Date.now()}`,
        type: 'nova',
        text: "I'm having trouble connecting right now. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);

      if (fromVoice) {
        setIsVoiceProcessing(false);
        setVoicePendingResp("I'm having trouble connecting right now. Please try again.");
      } else {
        setIsTyping(false);
      }
    }
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
            background: 'linear-gradient(135deg, #003063 0%, #00B5DF 100%)',
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
        onLongPress={() => {
          setShowWelcome(false);
          setIsOpen(false);
          setIsVoiceMode(true);
        }}
        isOpen={isOpen}
        isVoiceMode={isVoiceMode}
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
        onStartVoice={() => {
          setIsOpen(false);
          setIsVoiceMode(true);
        }}
      />

      {/* Voice Session Overlay */}
      {isVoiceMode && (
        <VoiceSession
          onSendMessage={(text) => sendMessage(text, true)}
          pendingResponse={voicePendingResp}
          onResponseSpoken={() => setVoicePendingResp(null)}
          onHangUp={() => {
            setIsVoiceMode(false);
            setVoicePendingResp(null);
            setIsVoiceProcessing(false);
          }}
          isProcessing={isVoiceProcessing}
        />
      )}
    </Box>
  );
};

export default NovaChat;
