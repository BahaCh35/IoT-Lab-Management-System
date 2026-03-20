import React, { useState } from 'react';
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
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[];
}

const mockInitialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hello! I\'m your SmartLab AI Assistant. I can help you find equipment, check availability, make reservations, and answer questions about lab inventory.',
    timestamp: new Date(Date.now() - 60000).toLocaleTimeString(),
    suggestions: [
      'Where is the Arduino Uno?',
      'What equipment is available?',
      'I need a voltage measurement tool',
      'Reserve an oscilloscope for tomorrow',
    ],
  },
  {
    id: '2',
    role: 'assistant',
    content: 'Try asking me things like:\n• "Where can I find the Raspberry Pi?"\n• "What oscilloscopes are available?"\n• "I need a soldering tool"\n• "Reserve a multimeter for Friday"',
    timestamp: new Date(Date.now() - 30000).toLocaleTimeString(),
  },
];

const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(mockInitialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages([...messages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response with timeout
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: generateResponse(inputValue),
        timestamp: new Date().toLocaleTimeString(),
        suggestions:
          inputValue.toLowerCase().includes('where') ?
            ['Check cabinet A', 'Check room 102', 'Ask lab manager'] :
            undefined,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 800);
  };

  const generateResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('arduino')) {
      return '📍 I found 3 Arduino Uno boards:\n\n1. **Cabinet A, Drawer 3** - 2 available\n2. **Cabinet B, Shelf 1** - 1 available\n\nWould you like me to reserve one for you?';
    }

    if (lowerInput.includes('where') || lowerInput.includes('find')) {
      return 'Could you specify which equipment you\'re looking for? I can help you locate:' +
        '\n• Microcontrollers (Arduino, Raspberry Pi)\n• Tools (Oscilloscope, Multimeter)\n• Components (Resistors, Capacitors)\n• Other equipment';
    }

    if (lowerInput.includes('available') || lowerInput.includes('availability')) {
      return '✅ **Available Equipment Summary:**\n\n• Arduino Uno: 3/5 available\n• Raspberry Pi 4: 1/3 available\n• Oscilloscope: 2/2 available\n• Digital Multimeter: 6/8 available\n• Soldering Iron: 0/1 (In Maintenance)\n\nWould you like details on any specific item?';
    }

    if (lowerInput.includes('reserve') || lowerInput.includes('book')) {
      return '📅 I can help you reserve equipment. Which equipment would you like to reserve and for what dates?';
    }

    if (lowerInput.includes('voltage') || lowerInput.includes('measure')) {
      return '🔧 For voltage measurement, I recommend:\n\n1. **Digital Multimeter** (Easy to use, 6 available)\n   - Location: Tool Cabinet A, Drawer 2\n2. **Oscilloscope** (Advanced measurements, 2 available)\n   - Location: Lab Bench 3\n\nWhich would you prefer?';
    }

    return 'I\'ll help you with that! Could you provide more details? You can ask me about:\n• Equipment location and availability\n• Equipment specifications\n• Making reservations\n• Checking out items';
  };

  const handleSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // In a real app, this would trigger the Web Speech API
    alert('Voice input (demo): In production, this will use Web Speech API');
  };

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToyIcon sx={{ fontSize: 32 }} />
          AI Assistant
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7280' }}>
          Ask me anything about equipment availability, locations, and reservations.
        </Typography>
      </Box>

      {/* Chat Messages */}
      <Card sx={{ flex: 1, overflowY: 'auto', mb: 2, display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto' }}>
          {messages.map((message) => (
            <Box key={message.id} sx={{ display: 'flex', gap: 2, justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {message.role === 'assistant' && (
                <Avatar sx={{ backgroundColor: '#7c3aed', flexShrink: 0 }}>
                  <SmartToyIcon />
                </Avatar>
              )}

              <Box
                sx={{
                  maxWidth: '70%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: message.role === 'user' ? '#1a73e8' : '#f3f4f6',
                    color: message.role === 'user' ? 'white' : 'inherit',
                    borderRadius: 2,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  <Typography variant="body2">{message.content}</Typography>
                </Paper>

                <Typography variant="caption" sx={{ color: '#6b7280', px: 1 }}>
                  {message.timestamp}
                </Typography>

                {message.suggestions && message.suggestions.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                    {message.suggestions.slice(0, 2).map((suggestion, idx) => (
                      <Chip
                        key={idx}
                        label={suggestion}
                        size="small"
                        onClick={() => handleSuggestion(suggestion)}
                        sx={{ cursor: 'pointer', backgroundColor: '#f0f4ff', color: '#1a73e8' }}
                      />
                    ))}
                  </Box>
                )}
              </Box>

              {message.role === 'user' && (
                <Avatar sx={{ backgroundColor: '#1a73e8', flexShrink: 0 }}>
                  <PersonIcon />
                </Avatar>
              )}
            </Box>
          ))}

          {isLoading && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Avatar sx={{ backgroundColor: '#7c3aed' }}>
                <SmartToyIcon />
              </Avatar>
              <Paper sx={{ p: 2, backgroundColor: '#f3f4f6' }}>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#6b7280', animation: 'pulse 1.5s infinite' }} />
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#6b7280', animation: 'pulse 1.5s infinite 0.2s' }} />
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#6b7280', animation: 'pulse 1.5s infinite 0.4s' }} />
                </Box>
              </Paper>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Input Area */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Ask me about equipment, availability, or reservations..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleVoiceInput}
                      color={isListening ? 'primary' : 'default'}
                      disabled={isLoading}
                      size="small"
                    >
                      <MicIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              endIcon={<SendIcon />}
              sx={{ minWidth: 100 }}
            >
              Send
            </Button>
          </Box>

          {/* Quick Suggestions */}
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ width: '100%', color: '#6b7280', fontWeight: 600 }}>
              Quick suggestions:
            </Typography>
            {[
              'Where is the Arduino?',
              'What\'s available now?',
              'Reserve equipment',
              'Equipment details',
            ].map((suggestion, idx) => (
              <Chip
                key={idx}
                label={suggestion}
                size="small"
                onClick={() => handleSuggestion(suggestion)}
                variant="outlined"
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ChatbotPage;
