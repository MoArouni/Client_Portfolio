import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { format, startOfMonth, getDay, getDate, parseISO, isAfter, isBefore, isSameDay } from 'date-fns';
import ReCAPTCHA from 'react-google-recaptcha';

// MUI components
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';

// Icons
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PublicIcon from '@mui/icons-material/Public';
import MyLocationIcon from '@mui/icons-material/MyLocation';

// Common timezones
const COMMON_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
  { value: 'UTC', label: 'UTC' }
];

const steps = ['Select Date', 'Choose Time', 'Confirm Details'];

// Meeting reasons
const meetingReasons = [
  { value: 'consultation', label: 'Business Consultation' },
  { value: 'project_discussion', label: 'Project Discussion' },
  { value: 'technical_support', label: 'Technical Support' },
  { value: 'strategy_planning', label: 'Strategy Planning' },
  { value: 'coaching_session', label: 'Coaching Session' },
  { value: 'follow_up', label: 'Follow-up Meeting' },
  { value: 'initial_meeting', label: 'Initial Meeting' },
  { value: 'other', label: 'Other' }
];

// Business types
const businessTypes = [
  { value: 'startup', label: 'Startup' },
  { value: 'small_business', label: 'Small Business' },
  { value: 'medium_business', label: 'Medium Business' },
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'nonprofit', label: 'Non-profit Organization' },
  { value: 'freelancer', label: 'Freelancer/Individual' },
  { value: 'agency', label: 'Agency' },
  { value: 'other', label: 'Other' }
];

const BookingCalendar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // State variables
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedTimezone, setSelectedTimezone] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    title: '',
    description: '',
    meetingReason: '',
    businessName: '',
    businessType: '',
    additionalNotes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  
  // Auto-detect user's timezone on component mount
  useEffect(() => {
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('🌍 Detected timezone:', detectedTimezone);
    
    // Check if detected timezone is in our common list, otherwise default to Eastern
    const isCommonTimezone = COMMON_TIMEZONES.some(tz => tz.value === detectedTimezone);
    setSelectedTimezone(isCommonTimezone ? detectedTimezone : 'America/New_York');
  }, []);
  
  // Fetch available time slots when date or timezone changes
  const fetchAvailableSlots = useCallback(async () => {
    if (!selectedDate || !selectedTimezone) return;
    
    setLoading(true);
    setError(null);
    try {
      // Format dates for API
      const startDate = format(selectedDate, 'yyyy-MM-dd');
      const endDate = format(selectedDate, 'yyyy-MM-dd');
      
      console.log('🔍 Fetching slots for:', { startDate, endDate, timezone: selectedTimezone });
      
      const response = await axios.get(`/api/appointments/availability`, {
        params: {
          startDate,
          endDate,
          timezone: selectedTimezone
        }
      });
      
      console.log('📅 Received slots:', response.data);
      
      // Sort slots by start time
      const sortedSlots = response.data.sort((a, b) => {
        return new Date(a.start) - new Date(b.start);
      });
      
      setAvailableSlots(sortedSlots);
    } catch (err) {
      console.error('Error fetching available slots:', err);
      setError('Failed to load available time slots. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedTimezone]);
  
  useEffect(() => {
    fetchAvailableSlots();
  }, [fetchAvailableSlots]);
  
  // Handle timezone change
  const handleTimezoneChange = (event) => {
    const newTimezone = event.target.value;
    setSelectedTimezone(newTimezone);
    console.log('🌍 Timezone changed to:', newTimezone);
    
    // Clear selected time when timezone changes
    setSelectedTime(null);
    if (activeStep > 1) {
      setActiveStep(1);
    }
  };
  
  // Auto-detect timezone button
  const handleAutoDetectTimezone = () => {
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setSelectedTimezone(detectedTimezone);
  };
  
  // Generate month grid
  const generateCalendarGrid = () => {
    const monthStart = startOfMonth(currentDate);
    const startWeekday = getDay(monthStart); // 0 = Sunday, 1 = Monday, etc.
    
    // Generate blank days for the start of the month
    const blankDays = Array(startWeekday).fill(null);
    
    // Generate actual days of the month
    const daysInMonth = Array.from(
      { length: 31 }, // Max days
      (_, i) => {
        const day = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
        // Check if the date is valid (in case the month has fewer than 31 days)
        return day.getMonth() === currentDate.getMonth() ? day : null;
      }
    ).filter(Boolean); // Remove null values for invalid dates
    
    return [...blankDays, ...daysInMonth];
  };
  
  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };
  
  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };
  
  // Date selection handler
  const handleDateSelect = (date) => {
    if (isAfter(date, new Date()) || isSameDay(date, new Date())) {
      setSelectedDate(date);
      setActiveStep(1); // Move to time selection
    }
  };
  
  // Time selection handler
  const handleTimeSelect = (slot) => {
    setSelectedTime(slot);
    setActiveStep(2); // Move to confirmation
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Navigate between steps
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const handleNext = () => {
    if (activeStep === 2) {
      if (!isAuthenticated) {
        setOpenDialog(true);
      } else {
        submitBooking();
      }
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };
  
  // Dialog handlers
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const handleLoginRedirect = () => {
    setOpenDialog(false);
    navigate('/login', { state: { from: '/booking' } });
  };
  
  // Submit booking
  const submitBooking = async () => {
    if (!selectedDate || !selectedTime || !bookingDetails.title || !bookingDetails.description || !bookingDetails.meetingReason || !bookingDetails.businessType) {
      setSnackbarMessage('Please fill in all required fields');
      setOpenSnackbar(true);
      return;
    }
    
    if (!recaptchaValue) {
      setSnackbarMessage('Please complete the reCAPTCHA verification');
      setOpenSnackbar(true);
      return;
    }
    
    setSubmitting(true);
    try {
      const bookingData = {
        title: bookingDetails.title,
        description: `Meeting Reason: ${meetingReasons.find(r => r.value === bookingDetails.meetingReason)?.label}\n` +
                    `Business Type: ${businessTypes.find(b => b.value === bookingDetails.businessType)?.label}\n` +
                    (bookingDetails.businessName ? `Business/Organization: ${bookingDetails.businessName}\n` : '') +
                    `\nDescription: ${bookingDetails.description}` +
                    (bookingDetails.additionalNotes ? `\n\nAdditional Notes: ${bookingDetails.additionalNotes}` : ''),
        start_time: selectedTime.start,
        end_time: selectedTime.end,
        timezone: selectedTimezone,
        meetingReason: bookingDetails.meetingReason,
        businessName: bookingDetails.businessName,
        businessType: bookingDetails.businessType
      };
      
      console.log('📤 Sending booking request:', bookingData);
      
      await axios.post('/api/appointments', bookingData);
      
      setSuccess(true);
      setSnackbarMessage('Your booking receipt has been sent by mail');
      setOpenSnackbar(true);
      
      // Reset form after success
      setTimeout(() => {
        setSelectedDate(null);
        setSelectedTime(null);
        setBookingDetails({
          title: '',
          description: '',
          meetingReason: '',
          businessName: '',
          businessType: '',
          additionalNotes: ''
        });
        setActiveStep(0);
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error booking appointment:', err);
      setSnackbarMessage(err.response?.data?.msg || 'Failed to book appointment');
      setOpenSnackbar(true);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };
  
  // Format the time slot for display
  const formatTimeSlot = (slot) => {
    if (!slot || !selectedTimezone) return '';
    
    try {
      const start = new Date(slot.start);
      const end = new Date(slot.end);
      
      // Use toLocaleString with timezone options for more reliable formatting
      const startFormatted = start.toLocaleString('en-US', {
        timeZone: selectedTimezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      
      const endFormatted = end.toLocaleString('en-US', {
        timeZone: selectedTimezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      
      return `${startFormatted} - ${endFormatted}`;
    } catch (error) {
      console.error('Error formatting time slot:', error);
      // Fallback to basic formatting
      const start = new Date(slot.start);
      const end = new Date(slot.end);
      return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };
  
  // Render calendar days
  const renderCalendarGrid = () => {
    const days = generateCalendarGrid();
    
    // Calendar header (days of week)
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        {/* Days of week */}
        <Grid container>
          {weekDays.map((day, index) => (
            <Grid item xs={12/7} key={`header-${index}`}>
              <Box 
                sx={{ 
                  p: 1, 
                  textAlign: 'center',
                  fontWeight: 600,
                  color: 'text.secondary'
                }}
              >
                {day}
              </Box>
            </Grid>
          ))}
        </Grid>
        
        {/* Calendar grid */}
        <Grid container>
          {days.map((day, index) => {
            // For empty cells at the beginning of the month
            if (day === null) {
              return (
                <Grid item xs={12/7} key={`empty-${index}`}>
                  <Box sx={{ p: 2 }} />
                </Grid>
              );
            }
            
            const dayNum = getDate(day);
            const isToday = isSameDay(day, new Date());
            const isPast = isBefore(day, new Date()) && !isToday;
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            
            return (
              <Grid item xs={12/7} key={`day-${index}`}>
                <Box
                  onClick={() => !isPast && handleDateSelect(day)}
                  sx={{
                    p: 2,
                    m: 0.5,
                    borderRadius: 2,
                    cursor: isPast ? 'default' : 'pointer',
                    textAlign: 'center',
                    position: 'relative',
                    background: isSelected 
                      ? 'linear-gradient(45deg, #7c4dff 30%, #3949ab 90%)'
                      : 'transparent',
                    color: isSelected 
                      ? '#fff' 
                      : isPast 
                        ? 'text.disabled' 
                        : 'text.primary',
                    border: isToday 
                      ? `2px solid ${theme.palette.primary.main}` 
                      : '2px solid transparent',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: !isPast && !isSelected 
                        ? 'action.hover' 
                        : undefined,
                      transform: !isPast ? 'translateY(-2px)' : undefined
                    },
                  }}
                >
                  {dayNum}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };
  
  // Render time slots
  const renderTimeSlots = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress size={40} />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      );
    }
    
    if (availableSlots.length === 0) {
      return (
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            No available slots for this date.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please select another date or check back later.
          </Typography>
        </Box>
      );
    }
    
    return (
      <Box sx={{ mt: 2 }}>
        {/* Timezone Selector */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center'
          }}>
            <PublicIcon sx={{ mr: 1, color: 'primary.main' }} />
            Select Timezone
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 250 }}>
              <InputLabel>Timezone</InputLabel>
              <Select
                value={selectedTimezone}
                onChange={handleTimezoneChange}
                label="Timezone"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <MenuItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Tooltip title="Auto-detect your timezone">
              <Button
                variant="outlined"
                size="small"
                startIcon={<MyLocationIcon />}
                onClick={handleAutoDetectTimezone}
              >
                Auto-detect
              </Button>
            </Tooltip>
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Current timezone: {selectedTimezone}
          </Typography>
        </Box>

        <Typography variant="subtitle1" gutterBottom sx={{ 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center'
        }}>
          <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
          Available Time Slots
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Times shown in {COMMON_TIMEZONES.find(tz => tz.value === selectedTimezone)?.label || selectedTimezone}
        </Typography>
        
        <Grid container spacing={1}>
          {availableSlots.map((slot, index) => {
            const startTime = parseISO(slot.start);
            const endTime = parseISO(slot.end);
            const isSelected = selectedTime && selectedTime.start === slot.start;
            
            // Format time in selected timezone
            const formattedStartTime = (() => {
              try {
                return startTime.toLocaleString('en-US', {
                  timeZone: selectedTimezone,
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                });
              } catch (error) {
                console.error('Error formatting start time:', error);
                return startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              }
            })();
            
            const formattedEndTime = (() => {
              try {
                return endTime.toLocaleString('en-US', {
                  timeZone: selectedTimezone,
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                });
              } catch (error) {
                console.error('Error formatting end time:', error);
                return endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              }
            })();
            
            return (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <Button
                  variant={isSelected ? "contained" : "outlined"}
                  fullWidth
                  onClick={() => handleTimeSelect(slot)}
                  sx={{
                    mb: 1,
                    borderRadius: 2,
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    py: 1.5,
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: isSelected ? 'primary.main' : 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formattedStartTime}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formattedStartTime} - {formattedEndTime}
                    </Typography>
                  </Box>
                </Button>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };
  
  // Render booking confirmation form
  const renderBookingForm = () => {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Appointment Details
        </Typography>
        
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EventIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1" fontWeight={500}>
                  Date:
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1" fontWeight={500}>
                  Time:
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {formatTimeSlot(selectedTime)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {COMMON_TIMEZONES.find(tz => tz.value === selectedTimezone)?.label || selectedTimezone}
              </Typography>
            </Grid>
          </Grid>
        </Box>
        
        <Grid container spacing={2}>
          {/* Appointment Title */}
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="title"
              name="title"
              label="Appointment Title"
              variant="outlined"
              value={bookingDetails.title}
              onChange={handleInputChange}
              error={submitting && !bookingDetails.title}
              helperText={submitting && !bookingDetails.title ? "Title is required" : "Brief title for your appointment"}
            />
          </Grid>

          {/* Meeting Reason */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={submitting && !bookingDetails.meetingReason}>
              <InputLabel>Meeting Reason</InputLabel>
              <Select
                name="meetingReason"
                value={bookingDetails.meetingReason}
                onChange={handleInputChange}
                label="Meeting Reason"
              >
                {meetingReasons.map((reason) => (
                  <MenuItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </MenuItem>
                ))}
              </Select>
              {submitting && !bookingDetails.meetingReason && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  Please select a meeting reason
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Business Type */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={submitting && !bookingDetails.businessType}>
              <InputLabel>Business Type</InputLabel>
              <Select
                name="businessType"
                value={bookingDetails.businessType}
                onChange={handleInputChange}
                label="Business Type"
              >
                {businessTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
              {submitting && !bookingDetails.businessType && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  Please select your business type
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Business Name */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="businessName"
              name="businessName"
              label="Business/Organization Name"
              variant="outlined"
              value={bookingDetails.businessName}
              onChange={handleInputChange}
              helperText="Name of your business or organization (optional)"
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="description"
              name="description"
              label="Meeting Description"
              variant="outlined"
              value={bookingDetails.description}
              onChange={handleInputChange}
              multiline
              rows={3}
              error={submitting && !bookingDetails.description}
              helperText={submitting && !bookingDetails.description ? "Please describe what you'd like to discuss" : "Describe the purpose and agenda for this meeting"}
            />
          </Grid>

          {/* Additional Notes */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="additionalNotes"
              name="additionalNotes"
              label="Additional Notes"
              variant="outlined"
              value={bookingDetails.additionalNotes}
              onChange={handleInputChange}
              multiline
              rows={2}
              placeholder="Any additional information, special requirements, or questions..."
              helperText="Optional: Share any specific requirements or questions you have"
            />
          </Grid>
        </Grid>
        
        {/* reCAPTCHA */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <ReCAPTCHA
            sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Test key - replace with your actual site key
            onChange={(value) => setRecaptchaValue(value)}
            onExpired={() => setRecaptchaValue(null)}
            onError={() => setRecaptchaValue(null)}
          />
        </Box>
        
        {!isAuthenticated && (
          <Alert severity="info" sx={{ mt: 3 }}>
            Please note: You'll need to log in or create an account to complete your booking.
          </Alert>
        )}
      </Box>
    );
  };
  
  // Render success state
  const renderSuccess = () => {
    if (!success) return null;
    
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          textAlign: 'center'
        }}
      >
        <CheckCircleOutlineIcon 
          color="primary" 
          sx={{ fontSize: 64, mb: 2 }} 
        />
        <Typography variant="h5" gutterBottom>
          Booking Successful!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your appointment has been scheduled. You'll receive a confirmation email shortly.
        </Typography>
        <Button 
          variant="contained" 
          sx={{ mt: 3 }}
          onClick={() => {
            setSelectedDate(null);
            setSelectedTime(null);
            setBookingDetails({
              title: '',
              description: '',
              meetingReason: '',
              businessName: '',
              businessType: '',
              additionalNotes: ''
            });
            setActiveStep(0);
            setSuccess(false);
          }}
        >
          Book Another Appointment
        </Button>
      </Box>
    );
  };
  
  // Main render
  return (
    <Paper 
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 4,
        overflow: 'hidden',
        position: 'relative',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(30,30,45,0.95) 0%, rgba(30,30,60,0.95) 100%)' 
          : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(245,250,255,0.95) 100%)',
        backdropFilter: 'blur(10px)',
        boxShadow: theme.palette.mode === 'dark'
          ? '0 8px 32px rgba(0, 0, 0, 0.4)'
          : '0 8px 32px rgba(0, 0, 0, 0.15)',
        border: theme.palette.mode === 'dark' 
          ? '1px solid rgba(255, 255, 255, 0.1)' 
          : '1px solid rgba(0, 0, 0, 0.05)',
      }}
    >
      {success ? (
        renderSuccess()
      ) : (
        <>
          {/* Stepper */}
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {/* Step content */}
          <Box sx={{ mt: 2 }}>
            {activeStep === 0 ? (
              // Date selection step
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <IconButton onClick={goToPreviousMonth}>
                    <ChevronLeftIcon />
                  </IconButton>
                  <Typography variant="h6" align="center">
                    {format(currentDate, 'MMMM yyyy')}
                  </Typography>
                  <IconButton onClick={goToNextMonth}>
                    <ChevronRightIcon />
                  </IconButton>
                </Box>
                {renderCalendarGrid()}
              </>
            ) : activeStep === 1 ? (
              // Time selection step
              renderTimeSlots()
            ) : (
              // Confirmation step
              renderBookingForm()
            )}
          </Box>
          
          {/* Navigation buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={(activeStep === 1 && !selectedTime) || 
                       (activeStep === 2 && (!bookingDetails.title || !bookingDetails.description || !bookingDetails.meetingReason || !bookingDetails.businessType || !recaptchaValue)) || 
                       submitting}
            >
              {activeStep === steps.length - 1 ? (
                submitting ? <CircularProgress size={24} /> : 'Book Appointment'
              ) : (
                'Next'
              )}
            </Button>
          </Box>
        </>
      )}
      
      {/* Login dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
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
        <DialogTitle>Login Required</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You need to be logged in to complete your booking. Would you like to log in now?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleLoginRedirect} variant="contained" color="primary">
            Go to Login
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Paper>
  );
};

export default BookingCalendar; 