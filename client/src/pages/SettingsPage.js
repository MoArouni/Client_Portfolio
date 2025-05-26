import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GoogleCalendarConnect from '../components/settings/GoogleCalendarConnect';

// Attempt to import react-helmet or handle its absence
let Helmet;
try {
  Helmet = require('react-helmet').Helmet;
} catch (e) {
  // Create a dummy Helmet component if the package is not available
  Helmet = ({ children }) => <>{children}</>;
}

const SettingsPage = () => {
  const theme = useTheme();
  const location = useLocation();
  const { user } = useAuth();
  
  return (
    <>
      <Helmet>
        <title>Settings | Professional Portfolio</title>
      </Helmet>
      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
          fontWeight: 'bold',
          textAlign: 'center',
          color: theme.palette.primary.main,
          mb: 4
        }}>
          Settings
        </Typography>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ 
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 3
          }}>
            Account Settings
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Name:</strong> {user?.name}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Email:</strong> {user?.email}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Role:</strong> {user?.role}
            </Typography>
          </Box>

          {/* Google Calendar Integration - Admin Only */}
          <GoogleCalendarConnect 
            token={localStorage.getItem('token')}
            hasGoogleCalendar={user?.googleRefreshToken}
          />
        </Paper>
      </Container>
    </>
  );
};

export default SettingsPage; 