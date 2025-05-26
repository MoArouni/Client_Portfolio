import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const AttendanceConfirmationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    confirmAttendance();
  }, [token]);

  const confirmAttendance = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/appointments/confirm-attendance/${token}`);
      
      if (response.data.success) {
        setConfirmed(true);
        setAppointment(response.data.appointment);
      } else {
        setError(response.data.message || 'Failed to confirm attendance');
      }
    } catch (err) {
      console.error('Error confirming attendance:', err);
      setError(
        err.response?.data?.msg || 
        err.response?.data?.message || 
        'Failed to confirm attendance. The link may be invalid or expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Box textAlign="center">
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Confirming your attendance...
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {confirmed ? (
          <Box textAlign="center">
            <CheckCircleIcon 
              sx={{ 
                fontSize: 80, 
                color: 'success.main', 
                mb: 2 
              }} 
            />
            
            <Typography variant="h4" gutterBottom color="success.main">
              Attendance Confirmed!
            </Typography>
            
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              Thank you for confirming your attendance. We look forward to meeting with you!
            </Typography>

            {appointment && (
              <Card sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <EventIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Appointment Details
                  </Typography>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Title:</strong> {appointment.title}
                    </Typography>
                    
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Date:</strong> {formatDate(appointment.start_time)}
                    </Typography>
                    
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Time:</strong> {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                    </Typography>
                    
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                      <Typography variant="body2" color="success.dark">
                        ✅ <strong>Status:</strong> Attendance Confirmed
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}

            <Box sx={{ mt: 4 }}>
              <Typography variant="body1" sx={{ mb: 3 }}>
                What happens next?
              </Typography>
              
              <Box sx={{ textAlign: 'left', maxWidth: 400, mx: 'auto' }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • You'll receive a reminder email 1 hour before your appointment
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Please arrive on time for your scheduled appointment
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • If you need to cancel, please do so at least 24 hours in advance
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/profile')}
                sx={{ mr: 2 }}
              >
                View My Appointments
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => navigate('/')}
              >
                Return to Home
              </Button>
            </Box>
          </Box>
        ) : (
          <Box textAlign="center">
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            
            <Typography variant="h5" gutterBottom>
              Unable to Confirm Attendance
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              The confirmation link may be invalid, expired, or already used.
            </Typography>

            <Box>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/profile')}
                sx={{ mr: 2 }}
              >
                View My Appointments
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => navigate('/contact')}
              >
                Contact Support
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default AttendanceConfirmationPage; 