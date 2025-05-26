import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, Alert, CircularProgress, Paper } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { authAPI, setAuthToken } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const GoogleCalendarConnect = ({ token, hasGoogleCalendar, onConnect }) => {
  const { user } = useAuth();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Check for success parameter in URL when redirected back from Google
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const googleStatus = urlParams.get('google');
    const message = urlParams.get('message');
    
    if (googleStatus === 'success') {
      setSuccess(true);
      if (onConnect) onConnect(true);
      
      // Remove the query parameters from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    } else if (googleStatus === 'error') {
      if (message === 'admin_only') {
        setError('Only administrators can connect Google Calendar. This feature is used to manage appointment availability for all users.');
      } else if (message === 'connection_failed') {
        setError('Failed to connect to Google Calendar. Please try again.');
      } else {
        setError('An error occurred while connecting to Google Calendar.');
      }
      
      // Remove the query parameters from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [onConnect]);

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    
    try {
      // Set auth token for the request
      setAuthToken(token);
      
      // Get Google auth URL
      const response = await authAPI.getGoogleAuthUrl();
      
      // Redirect to Google OAuth
      window.location.href = response.data.url;
    } catch (err) {
      console.error('Error connecting to Google Calendar:', err);
      
      // Check if it's an admin-only error
      if (err.response?.status === 403) {
        setError('Only administrators can connect Google Calendar. This feature is used to manage appointment availability for all users.');
      } else {
        setError('Failed to connect to Google Calendar. Please try again.');
      }
      setConnecting(false);
    }
  };

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Already connected to Google Calendar
  if (hasGoogleCalendar || success) {
    return (
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mt: 3 }}>
        <Box display="flex" alignItems="center">
          <Box 
            sx={{ 
              backgroundColor: 'success.light', 
              color: 'white',
              borderRadius: '50%',
              p: 1,
              mr: 2
            }}
          >
            <CheckCircleIcon />
          </Box>
          <Box>
            <Typography variant="h6" gutterBottom>
              Google Calendar Connected
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isAdmin 
                ? 'Your Google Calendar is connected. Appointments will be automatically managed in your calendar.'
                : 'The administrator has connected Google Calendar. Your appointments will be automatically added to their calendar.'
              }
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  }

  // Non-admin users see information only
  if (!isAdmin) {
    return (
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mt: 3 }}>
        <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
          <AdminPanelSettingsIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            Google Calendar Integration
          </Typography>
        </Box>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          Google Calendar integration is managed by administrators only. When you book an appointment, it will be automatically added to the administrator's calendar.
        </Alert>
        
        <Typography variant="body2" color="text.secondary">
          You can view and manage your appointments from your profile page. The administrator will receive your booking requests and they will appear in their Google Calendar automatically.
        </Typography>
      </Paper>
    );
  }

  // Admin users can connect
  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mt: 3 }}>
      <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
        <AdminPanelSettingsIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6">
          Connect Google Calendar (Admin)
        </Typography>
      </Box>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        As an administrator, connect your Google Calendar to automatically manage appointment availability and sync bookings. This will be used for all user appointments.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Button
        variant="contained"
        color="primary"
        startIcon={connecting ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
        endIcon={<CalendarMonthIcon />}
        onClick={handleConnect}
        disabled={connecting}
        fullWidth
        sx={{ mt: 2 }}
      >
        {connecting ? 'Connecting...' : 'Connect Google Calendar'}
      </Button>
    </Paper>
  );
};

export default GoogleCalendarConnect; 