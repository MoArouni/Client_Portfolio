import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  useTheme
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { loginDirect } = useContext(AuthContext);
  
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('Verifying your email address...');
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        const response = await axios.post('/api/auth/verify-email', { token });
        
        if (response.data.token && response.data.user) {
          // Store the token and user info
          localStorage.setItem('token', response.data.token);
          
          // Update auth context
          loginDirect(response.data.token, response.data.user);
          
          setStatus('success');
          setMessage(response.data.msg || 'Email verified successfully! You are now logged in.');
          setUserInfo(response.data.user);
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            if (response.data.user.role === 'admin') {
              navigate('/dashboard');
            } else {
              navigate('/');
            }
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Verification successful but login failed. Please try logging in manually.');
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setStatus('error');
        setMessage(
          error.response?.data?.msg || 
          'Email verification failed. The link may be expired or invalid.'
        );
      }
    };

    verifyEmail();
  }, [searchParams, loginDirect, navigate]);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper 
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 4,
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, rgba(30,30,45,0.95) 0%, rgba(30,30,60,0.95) 100%)' 
            : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(245,250,255,0.95) 100%)',
          backdropFilter: 'blur(10px)',
          border: theme.palette.mode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.1)' 
            : '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.4)'
            : '0 8px 32px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Box textAlign="center">
          {/* Icon based on status */}
          <Box sx={{ mb: 3 }}>
            {status === 'verifying' && (
              <CircularProgress size={60} color="primary" />
            )}
            {status === 'success' && (
              <CheckCircleIcon 
                sx={{ 
                  fontSize: 60, 
                  color: 'success.main',
                  animation: 'pulse 2s infinite'
                }} 
              />
            )}
            {status === 'error' && (
              <ErrorIcon 
                sx={{ 
                  fontSize: 60, 
                  color: 'error.main' 
                }} 
              />
            )}
          </Box>

          {/* Title */}
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            {status === 'verifying' && 'Verifying Email'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </Typography>

          {/* Message */}
          <Alert 
            severity={
              status === 'verifying' ? 'info' : 
              status === 'success' ? 'success' : 'error'
            }
            sx={{ mb: 3, textAlign: 'left' }}
          >
            {message}
          </Alert>

          {/* User info on success */}
          {status === 'success' && userInfo && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Welcome, {userInfo.name}!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <EmailIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                {userInfo.email}
              </Typography>
              {userInfo.role === 'admin' && (
                <Typography variant="body2" sx={{ mt: 1, color: 'primary.main', fontWeight: 600 }}>
                  🎉 You have administrator privileges!
                </Typography>
              )}
              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                Redirecting you to {userInfo.role === 'admin' ? 'dashboard' : 'homepage'} in a few seconds...
              </Typography>
            </Box>
          )}

          {/* Action buttons */}
          <Box sx={{ mt: 3 }}>
            {status === 'success' && (
              <Button
                variant="contained"
                color="primary"
                onClick={userInfo?.role === 'admin' ? () => navigate('/dashboard') : handleGoHome}
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #7c4dff 30%, #536dfe 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #651fff 30%, #3f51b5 90%)',
                  }
                }}
              >
                {userInfo?.role === 'admin' ? 'Go to Dashboard' : 'Go to Homepage'}
              </Button>
            )}
            
            {status === 'error' && (
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleGoToLogin}
                  sx={{
                    py: 1.5,
                    px: 3,
                    borderRadius: 2,
                  }}
                >
                  Go to Login
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleGoHome}
                  sx={{
                    py: 1.5,
                    px: 3,
                    borderRadius: 2,
                  }}
                >
                  Go to Homepage
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default EmailVerificationPage; 