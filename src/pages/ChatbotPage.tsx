import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Typography,
  Avatar,
  Chip,
  Paper,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import chatbotService, { ChatHistoryMessage } from '../services/api/chatbotService';

interface Message {
  id: string;
  role: 'user' | 'nova';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load initial message from the assistant
    setMessages([
      {
        id: 'init-1',
        role: 'nova',
        text: "Hello! I'm Nova, your SmartLab AI Assistant. How can I help you today?",
        timestamp: new Date().toLocaleTimeString(),
        suggestions: [
          'Where can I find the oscilloscopes?',
          'What equipment is available right now?',
          'Show me my active checkouts',
          'Do I have any upcoming reservations?',
        ],
      },
    ]);
  }, []);

  const handleSendMessage = async (messageText: string = inputValue) => {
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const history: ChatHistoryMessage[] = messages
        .slice(-20) // Send last 20 messages as history
        .map((m) => ({ role: m.role, text: m.text }));

      const responseText = await chatbotService.sendMessage(messageText, history);

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'nova',
        text: responseText,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'nova',
        text: "I'm having trouble connecting to my systems right now. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <Card sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', maxWidth: '80%' }}>
              {msg.role !== 'user' && (
                <Avatar sx={{ bgcolor: 'primary.main', mr: 1.5 }}>
                  <SmartToyIcon />
                </Avatar>
              )}
              <Paper
                elevation={1}
                sx={{
                  p: 1.5,
                  bgcolor: msg.role === 'user' ? 'primary.light' : 'grey.100',
                  borderRadius:
                    msg.role === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {msg.text}
                </Typography>
                {msg.suggestions && (
                  <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {msg.suggestions.map((s, i) => (
                      <Chip key={i} label={s} onClick={() => handleSuggestionClick(s)} size="small" />
                    ))}
                  </Box>
                )}
              </Paper>
              {msg.role === 'user' && (
                <Avatar sx={{ bgcolor: 'secondary.main', ml: 1.5 }}>
                  <PersonIcon />
                </Avatar>
              )}
            </Box>
          </Box>
        ))}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 1.5 }}>
              <SmartToyIcon />
            </Avatar>
            <Paper elevation={1} sx={{ p: 1.5, bgcolor: 'grey.100', borderRadius: '20px 20px 20px 5px' }}>
              <CircularProgress size={20} />
            </Paper>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message or hold mic to speak..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onMouseDown={() => setIsListening(true)}
                  onMouseUp={() => setIsListening(false)}
                  color={isListening ? 'error' : 'default'}
                  disabled={isLoading}
                  size="small"
                >
                  <MicIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Card>
  );
};

export default ChatbotPage;
