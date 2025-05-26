import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

// MUI components
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

// Icons
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import DescriptionIcon from '@mui/icons-material/Description';

const UserProfile = () => {
  const theme = useTheme();
  const { user } = useAuth();
  
  // State variables
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelDialog, setCancelDialog] = useState({ 
    open: false, 
    appointment: null, 
    reason: '',
    confirmText: ''
  });
  const [cancelling, setCancelling] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  // Cancellation reasons
  const cancellationReasons = [
    { value: 'schedule_conflict', label: 'Schedule Conflict' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'illness', label: 'Illness' },
    { value: 'travel_issues', label: 'Travel Issues' },
    { value: 'business_priority', label: 'Business Priority Change' },
    { value: 'postpone', label: 'Need to Postpone' },
    { value: 'other', label: 'Other' }
  ];
  
  // Fetch user's appointments
  useEffect(() => {
    fetchAppointments();
  }, []);
  
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/appointments/me');
      setAppointments(response.data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle cancel appointment
  const handleCancelClick = (appointment) => {
    setCancelDialog({ 
      open: true, 
      appointment, 
      reason: '',
      confirmText: ''
    });
  };
  
  const handleCancelDialogChange = (field, value) => {
    setCancelDialog(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleCancelConfirm = async () => {
    if (!cancelDialog.appointment || !cancelDialog.reason) {
      setSnackbar({
        open: true,
        message: 'Please select a cancellation reason',
        severity: 'error'
      });
      return;
    }
    
    const requiredConfirmText = 'CANCEL';
    if (cancelDialog.confirmText !== requiredConfirmText) {
      setSnackbar({
        open: true,
        message: `Please type "${requiredConfirmText}" to confirm cancellation`,
        severity: 'error'
      });
      return;
    }
    
    setCancelling(true);
    try {
      // Send cancellation with reason
      await axios.delete(`/api/appointments/${cancelDialog.appointment.id}`, {
        data: { 
          cancellationReason: cancelDialog.reason,
          reasonLabel: cancellationReasons.find(r => r.value === cancelDialog.reason)?.label
        }
      });
      
      // Remove the appointment from the list
      setAppointments(prev => prev.filter(apt => apt.id !== cancelDialog.appointment.id));
      
      setSnackbar({
        open: true,
        message: 'Appointment cancelled successfully. A confirmation email has been sent.',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.msg || 'Failed to cancel appointment',
        severity: 'error'
      });
    } finally {
      setCancelling(false);
      setCancelDialog({ open: false, appointment: null, reason: '', confirmText: '' });
    }
  };
  
  const handleCancelDialogClose = () => {
    setCancelDialog({ open: false, appointment: null, reason: '', confirmText: '' });
  };
  
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case 'confirmed':
        return { color: 'success', icon: <CheckCircleIcon />, label: 'Confirmed' };
      case 'pending':
        return { color: 'warning', icon: <PendingIcon />, label: 'Pending' };
      case 'cancelled':
        return { color: 'error', icon: <CancelIcon />, label: 'Cancelled' };
      case 'completed':
        return { color: 'info', icon: <CheckCircleIcon />, label: 'Completed' };
      default:
        return { color: 'default', icon: <PendingIcon />, label: status };
    }
  };
  
  // Check if appointment can be cancelled
  const canCancelAppointment = (appointment) => {
    const now = new Date();
    const appointmentTime = new Date(appointment.start_time);
    const timeDiff = appointmentTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    // Can cancel if appointment is more than 24 hours away and not already cancelled/completed
    return hoursDiff > 24 && !['cancelled', 'completed'].includes(appointment.status);
  };
  
  // Render appointment card
  const renderAppointmentCard = (appointment) => {
    const statusInfo = getStatusInfo(appointment.status);
    const startTime = parseISO(appointment.start_time);
    const endTime = parseISO(appointment.end_time);
    const canCancel = canCancelAppointment(appointment);
    
    return (
      <Grid item xs={12} md={6} lg={4} key={appointment.id}>
        <Card 
          sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[8]
            }
          }}
        >
          <CardContent sx={{ flexGrow: 1 }}>
            {/* Status chip */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', mb: 2 }}>
              <Chip
                icon={statusInfo.icon}
                label={statusInfo.label}
                color={statusInfo.color}
                size="small"
                variant="outlined"
              />
            </Box>
            
            {/* Title */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {appointment.title}
            </Typography>
            
            {/* Date and time */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EventIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                {format(startTime, 'EEEE, MMMM d, yyyy')}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccessTimeIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
              </Typography>
            </Box>
            
            {/* Description */}
            {appointment.description && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <DescriptionIcon color="primary" sx={{ mr: 1, fontSize: 20, mt: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  {appointment.description}
                </Typography>
              </Box>
            )}
          </CardContent>
          
          {/* Actions */}
          <CardActions sx={{ p: 2, pt: 0 }}>
            {canCancel && (
              <Button
                size="small"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => handleCancelClick(appointment)}
              >
                Cancel
              </Button>
            )}
            {!canCancel && appointment.status !== 'cancelled' && (
              <Typography variant="caption" color="text.secondary">
                {appointment.status === 'completed' 
                  ? 'Completed' 
                  : 'Cannot cancel (less than 24h notice required)'
                }
              </Typography>
            )}
          </CardActions>
        </Card>
      </Grid>
    );
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            My Profile
          </Typography>
          
          {/* User info */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PersonIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ mr: 3 }}>
              {user?.name}
            </Typography>
            <EmailIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="body1" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            My Appointments
          </Typography>
        </Box>
        
        {/* Error state */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Appointments grid */}
        {appointments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <EventIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No appointments yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Book your first appointment to get started
            </Typography>
            <Button 
              variant="contained" 
              href="/booking"
              sx={{ borderRadius: 3 }}
            >
              Book Appointment
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {appointments.map(renderAppointmentCard)}
          </Grid>
        )}
      </Paper>
      
      {/* Cancel confirmation dialog */}
      <Dialog 
        open={cancelDialog.open} 
        onClose={handleCancelDialogClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, rgba(30,30,45,0.98) 0%, rgba(30,30,60,0.98) 100%)' 
              : 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(245,250,255,0.98) 100%)',
            backdropFilter: 'blur(10px)',
            border: theme.palette.mode === 'dark' 
              ? '1px solid rgba(255, 255, 255, 0.1)' 
              : '1px solid rgba(0, 0, 0, 0.05)',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CancelIcon color="error" sx={{ mr: 1 }} />
            Cancel Appointment
          </Box>
        </DialogTitle>
        <DialogContent>
          {cancelDialog.appointment && (
            <>
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>You are about to cancel:</strong><br />
                  {cancelDialog.appointment.title}<br />
                  {format(parseISO(cancelDialog.appointment.start_time), 'EEEE, MMMM d, yyyy')} at{' '}
                  {format(parseISO(cancelDialog.appointment.start_time), 'h:mm a')}
                </Typography>
              </Alert>

              <Typography variant="body1" gutterBottom sx={{ fontWeight: 500 }}>
                Please provide a reason for cancellation:
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Cancellation Reason *</InputLabel>
                <Select
                  value={cancelDialog.reason}
                  onChange={(e) => handleCancelDialogChange('reason', e.target.value)}
                  label="Cancellation Reason *"
                  required
                >
                  {cancellationReasons.map((reason) => (
                    <MenuItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography variant="body1" gutterBottom sx={{ fontWeight: 500 }}>
                To confirm cancellation, please type <strong>CANCEL</strong> below:
              </Typography>
              
              <TextField
                fullWidth
                value={cancelDialog.confirmText}
                onChange={(e) => handleCancelDialogChange('confirmText', e.target.value)}
                placeholder="Type CANCEL to confirm"
                variant="outlined"
                sx={{ mb: 2 }}
                error={cancelDialog.confirmText && cancelDialog.confirmText !== 'CANCEL'}
                helperText={cancelDialog.confirmText && cancelDialog.confirmText !== 'CANCEL' ? 'Please type exactly "CANCEL"' : ''}
              />

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  • A cancellation confirmation email will be sent to you<br />
                  • This action cannot be undone<br />
                  • You can book a new appointment anytime
                </Typography>
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleCancelDialogClose} variant="outlined">
            Keep Appointment
          </Button>
          <Button 
            onClick={handleCancelConfirm} 
            color="error" 
            variant="contained"
            disabled={cancelling || !cancelDialog.reason || cancelDialog.confirmText !== 'CANCEL'}
            startIcon={cancelling ? <CircularProgress size={16} /> : <CancelIcon />}
          >
            {cancelling ? 'Cancelling...' : 'Cancel Appointment'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserProfile; 