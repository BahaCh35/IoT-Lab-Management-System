import React, { useState } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Card,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { authService } from '../services/api';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.login(email, password);
      const user = response.user;

      // Determine where to navigate based on role
      let redirectPath = '/analytics';
      if (user.role === 'admin') {
        redirectPath = '/admin';
      } else if (user.role === 'technician') {
        redirectPath = '/technician';
      } else if (user.role === 'guest') {
        redirectPath = '/guest/equipment';
      }

      // Store user in localStorage for App.tsx to pick up
      localStorage.setItem('user', JSON.stringify(user));

      // Give a brief moment for the App component to detect the change, then navigate
      setTimeout(() => {
        setLoading(false);
        navigate(redirectPath);
      }, 300);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            p: 4,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            borderRadius: 3,
          }}
        >
          {/* Logo */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                background: 'linear-gradient(135deg, #1a73e8 0%, #7c3aed 100%)',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.8rem',
              }}
            >
              SL
            </Box>
          </Box>

          {/* Title */}
          <Typography variant="h4" sx={{ textAlign: 'center', mb: 1, fontWeight: 700 }}>
            SmartLab
          </Typography>
          <Typography
            variant="body2"
            sx={{ textAlign: 'center', color: '#6b7280', mb: 3 }}
          >
            AI-Powered Laboratory Management Platform
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
            />

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ mt: 2, height: 48 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>

          {/* Demo Credentials */}
          <Box sx={{ mt: 3, p: 2, backgroundColor: '#f0f4ff', borderRadius: 2, mb: 2 }}>
            <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 600, color: '#1a73e8' }}>
              Demo Credentials (Development)
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: '#374151', mb: 0.5 }}>
              <strong>Admin:</strong> admin@novation.com
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: '#374151', mb: 0.5 }}>
              <strong>Engineer:</strong> engineer@novation.com
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: '#374151', mb: 0.5 }}>
              <strong>Technician:</strong> technician@novation.com
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: '#374151', mb: 0.5 }}>
              <strong>Guest:</strong> contractor@company.com 
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: '#6b7280', fontSize: '0.7rem' }}>
            </Typography>
          </Box>

          {/* Sign Up Link */}
          <Typography variant="body2" sx={{ textAlign: 'center', color: '#6b7280' }}>
            Don't have an account?{' '}
            <Link
              href="/register"
              sx={{
                color: '#1a73e8',
                textDecoration: 'none',
                fontWeight: 600,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Sign Up
            </Link>
          </Typography>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginPage;
