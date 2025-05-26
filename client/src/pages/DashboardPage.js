import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Paper, Box, Button, CircularProgress, Tabs, Tab, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// Icons
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';

// Attempt to import react-helmet or handle its absence
let Helmet;
try {
  Helmet = require('react-helmet').Helmet;
} catch (e) {
  // Create a dummy Helmet component if the package is not available
  Helmet = ({ children }) => <>{children}</>;
}

const DashboardPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!isAuthenticated) {
          navigate('/login');
          return;
        }

        const config = {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          }
        };

        // Fetch user appointments
        const url = user?.role === 'admin' 
          ? '/api/appointments' // Admin sees all appointments
          : '/api/appointments/me'; // Regular users see only their appointments
          
        const appointmentsRes = await axios.get(url, config);
        setAppointments(appointmentsRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, isAuthenticated, user]);

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        }
      };

      await axios.delete(`/api/appointments/${appointmentId}`, config);
      
      // Remove the canceled appointment from state
      setAppointments(appointments.filter(app => app.id !== appointmentId));
    } catch (err) {
      console.error('Error canceling appointment:', err);
      setError('Failed to cancel appointment');
    }
  };

  // Filter appointments based on status
  const upcomingAppointments = appointments.filter(
    app => new Date(app.start_time) > new Date() && app.status !== 'cancelled'
  );
  
  const pastAppointments = appointments.filter(
    app => new Date(app.start_time) <= new Date() || app.status === 'cancelled'
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render appointment card
  const renderAppointmentCard = (appointment) => {
    return (
      <Grid item xs={12} sm={6} md={4} key={appointment.id}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            borderRadius: 2,
            borderLeft: `4px solid ${theme.palette.primary.main}`,
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>
              {appointment.title || 'Consultation'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {formatDate(appointment.start_time)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {new Date(appointment.end_time) - new Date(appointment.start_time) === 3600000
                ? '1 hour'
                : `${Math.round((new Date(appointment.end_time) - new Date(appointment.start_time)) / 60000)} minutes`}
            </Typography>
          </Box>
          
          {user?.role === 'admin' && appointment.user && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PersonIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                {appointment.user.name || 'Client'}
              </Typography>
            </Box>
          )}
          
          {appointment.description && (
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2, mt: 1 }}>
              {appointment.description}
            </Typography>
          )}
          
          <Box sx={{ mt: 'auto', pt: 2 }}>
            {new Date(appointment.start_time) > new Date() && (
              <Button 
                variant="outlined" 
                color="error" 
                size="small"
                onClick={() => handleCancelAppointment(appointment.id)}
                fullWidth
              >
                Cancel Appointment
              </Button>
            )}
          </Box>
        </Paper>
      </Grid>
    );
  };

  return (
    <>
      <Helmet>
        <title>Dashboard | Professional Portfolio</title>
      </Helmet>
      <Container sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
          fontWeight: 'bold',
          textAlign: 'center',
          color: theme.palette.primary.main,
          mb: 4
        }}>
          {user?.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}
        </Typography>

        <Box sx={{ width: '100%', mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            centered
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab 
              icon={<EventIcon />} 
              label="Upcoming" 
              iconPosition="start"
            />
            <Tab 
              icon={<CalendarTodayIcon />} 
              label="Past" 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <Box sx={{ mt: 2 }}>
          {error && (
            <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
              {error}
            </Typography>
          )}

          {/* Tab panels */}
          <Box role="tabpanel" hidden={tabValue !== 0}>
            {upcomingAppointments.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                  {user?.role === 'admin'
                    ? 'No upcoming appointments scheduled.'
                    : 'You don\'t have any upcoming appointments.'}
                </Typography>
                {user?.role !== 'admin' && (
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => navigate('/booking')}
                  >
                    Book Appointment
                  </Button>
                )}
              </Box>
            ) : (
              <Grid container spacing={3}>
                {upcomingAppointments.map(renderAppointmentCard)}
              </Grid>
            )}
          </Box>

          <Box role="tabpanel" hidden={tabValue !== 1}>
            {pastAppointments.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography sx={{ color: theme.palette.text.secondary }}>
                  No past appointments.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {pastAppointments.map(renderAppointmentCard)}
              </Grid>
            )}
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default DashboardPage; 