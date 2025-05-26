import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Typography, Grid, Box, Button, 
  CircularProgress, Chip, Fab, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton, Pagination, FormControlLabel, Switch,
  Avatar, Badge, Tooltip, Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

// Icons
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

// Attempt to import react-helmet or handle its absence
let Helmet;
try {
  Helmet = require('react-helmet').Helmet;
} catch (e) {
  // Create a dummy Helmet component if the package is not available
  Helmet = ({ children }) => <>{children}</>;
}

const EventsPage = () => {
  const theme = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [upcomingOnly, setUpcomingOnly] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    location: '',
    start_time: new Date(),
    end_time: new Date()
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [registering, setRegistering] = useState({});

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '6',
        upcoming: upcomingOnly.toString()
      });
      
      const res = await axios.get(`/api/events?${params}`);
      setEvents(res.data.events);
      setTotalPages(res.data.totalPages);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
      setLoading(false);
    }
  }, [page, upcomingOnly]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleRegister = async (eventId) => {
    if (!isAuthenticated) {
      showWarning('Please log in to register for events');
      return;
    }

    setRegistering(prev => ({ ...prev, [eventId]: true }));
    
    try {
      const config = {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      };
      
      await axios.post(`/api/events/${eventId}/register`, {}, config);
      showSuccess('Successfully registered for event!');
      fetchEvents(); // Refresh events to update registration count
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to register for event';
      showError(errorMsg);
    } finally {
      setRegistering(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const handleUnregister = async (eventId) => {
    setRegistering(prev => ({ ...prev, [eventId]: true }));
    
    try {
      const config = {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      };
      
      await axios.delete(`/api/events/${eventId}/register`, config);
      showSuccess('Successfully unregistered from event');
      fetchEvents(); // Refresh events to update registration count
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to unregister from event';
      showError(errorMsg);
    } finally {
      setRegistering(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const isUserRegistered = (event) => {
    if (!isAuthenticated || !event.registrations) return false;
    return event.registrations.some(reg => reg.user.id === user?.id);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleOpenDialog = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setEventForm({
        title: event.title,
        description: event.description || '',
        location: event.location || '',
        start_time: new Date(event.start_time),
        end_time: new Date(event.end_time)
      });
      setImagePreview(event.image);
      setSelectedImage(null);
    } else {
      setEditingEvent(null);
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      setEventForm({
        title: '',
        description: '',
        location: '',
        start_time: now,
        end_time: oneHourLater
      });
      setImagePreview(null);
      setSelectedImage(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEvent(null);
    setEventForm({
      title: '',
      description: '',
      location: '',
      start_time: new Date(),
      end_time: new Date()
    });
    setImagePreview(null);
    setSelectedImage(null);
  };

  const handleFormChange = (e) => {
    setEventForm({
      ...eventForm,
      [e.target.name]: e.target.value
    });
  };

  const handleDateChange = (field, value) => {
    setEventForm({
      ...eventForm,
      [field]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('title', eventForm.title);
      formData.append('description', eventForm.description);
      formData.append('location', eventForm.location);
      formData.append('start_time', eventForm.start_time.toISOString());
      formData.append('end_time', eventForm.end_time.toISOString());
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const config = {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      };

      if (editingEvent) {
        await axios.put(`/api/events/${editingEvent.id}`, formData, config);
      } else {
        await axios.post('/api/events', formData, config);
      }
      
      handleCloseDialog();
      fetchEvents();
    } catch (err) {
      console.error('Error saving event:', err);
      setError('Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const config = {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        };
        
        await axios.delete(`/api/events/${eventId}`, config);
        fetchEvents();
      } catch (err) {
        console.error('Error deleting event:', err);
        setError('Failed to delete event');
      }
    }
  };

  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const isEventPast = (endTime) => {
    return new Date(endTime) < new Date();
  };

  if (loading && events.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Group events by month for better organization
  const groupEventsByMonth = () => {
    const grouped = {};
    
    events.forEach(event => {
      const date = new Date(event.start_time);
      const monthYear = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      
      grouped[monthYear].push(event);
    });
    
    return grouped;
  };

  const groupedEvents = groupEventsByMonth();

  return (
    <>
      <Helmet>
        <title>Events | Professional Portfolio</title>
      </Helmet>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Container sx={{ mt: 4, mb: 8 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ 
            fontWeight: 'bold',
            textAlign: 'center',
            color: theme.palette.primary.main,
            mb: 3
          }}>
            Events
          </Typography>

          {/* Filter Controls */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={upcomingOnly}
                  onChange={(e) => {
                    setUpcomingOnly(e.target.checked);
                    setPage(1);
                  }}
                  color="primary"
                />
              }
              label="Show upcoming events only"
            />
          </Box>

          {error && (
            <Typography color="error" sx={{ textAlign: 'center', my: 3 }}>
              {error}
            </Typography>
          )}

          {events.length === 0 && !error && !loading ? (
            <Typography sx={{ textAlign: 'center', my: 5, color: theme.palette.text.secondary }}>
              {upcomingOnly ? 'No upcoming events scheduled.' : 'No events found.'} Check back soon!
            </Typography>
          ) : (
            <>
              {Object.entries(groupedEvents).map(([monthYear, monthEvents]) => (
                <Box key={monthYear} sx={{ mb: 5 }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      mb: 3, 
                      fontWeight: 500,
                      color: theme.palette.text.primary,
                      position: 'relative',
                      '&:after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -8,
                        left: 0,
                        width: 60,
                        height: 4,
                        backgroundColor: theme.palette.primary.main,
                        borderRadius: 2
                      }
                    }}
                  >
                    {monthYear}
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {monthEvents.map((event) => {
                      const isPast = isEventPast(event.end_time);
                      const userRegistered = isUserRegistered(event);
                      const registrationCount = event.registrationCount || 0;
                      
                      return (
                        <Grid item xs={12} lg={6} key={event.id}>
                          <Paper 
                            elevation={6} 
                            sx={{ 
                              height: '100%',
                              borderRadius: 3,
                              overflow: 'hidden',
                              transition: 'all 0.3s ease-in-out',
                              '&:hover': {
                                transform: 'translateY(-8px)',
                                boxShadow: theme.shadows[12]
                              },
                              position: 'relative',
                              background: isPast 
                                ? 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 100%)'
                                : 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(248,250,252,1) 100%)',
                              border: userRegistered ? `2px solid ${theme.palette.success.main}` : 'none'
                            }}
                          >
                            {/* Registration Status Badge */}
                            {userRegistered && (
                              <Chip
                                icon={<ConfirmationNumberIcon />}
                                label="Registered"
                                color="success"
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  top: 12,
                                  left: 12,
                                  zIndex: 2,
                                  fontWeight: 'bold'
                                }}
                              />
                            )}

                            {/* Admin Actions */}
                            {user?.role === 'admin' && (
                              <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleOpenDialog(event);
                                  }}
                                  sx={{ 
                                    bgcolor: 'rgba(255,255,255,0.95)', 
                                    mr: 1,
                                    boxShadow: 2,
                                    '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleDelete(event.id);
                                  }}
                                  sx={{ 
                                    bgcolor: 'rgba(255,255,255,0.95)',
                                    boxShadow: 2,
                                    '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" color="error" />
                                </IconButton>
                              </Box>
                            )}

                            {/* Event Image with Overlay */}
                            <Box sx={{ position: 'relative', height: 200 }}>
                              {event.image ? (
                                <Box
                                  component="img"
                                  src={event.image.startsWith('/uploads') ? `http://localhost:5000${event.image}` : event.image}
                                  alt={event.title}
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    objectPosition: 'center',
                                    maxHeight: '200px'
                                  }}
                                />
                              ) : (
                                <Box
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <EventIcon sx={{ fontSize: 60, color: 'white', opacity: 0.7 }} />
                                </Box>
                              )}
                              
                              {/* Date Badge */}
                              <Paper
                                elevation={3}
                                sx={{
                                  position: 'absolute',
                                  bottom: 16,
                                  left: 16,
                                  p: 1.5,
                                  textAlign: 'center',
                                  minWidth: 70,
                                  background: 'rgba(255,255,255,0.95)',
                                  backdropFilter: 'blur(10px)'
                                }}
                              >
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                                  {new Date(event.start_time).getDate()}
                                </Typography>
                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                  {new Date(event.start_time).toLocaleDateString('en-US', { month: 'short' })}
                                </Typography>
                              </Paper>

                              {/* Attendance Badge */}
                              <Tooltip title={`${registrationCount} people registered`}>
                                <Badge
                                  badgeContent={registrationCount}
                                  color="primary"
                                  sx={{
                                    position: 'absolute',
                                    bottom: 16,
                                    right: 16,
                                    '& .MuiBadge-badge': {
                                      fontSize: '0.75rem',
                                      fontWeight: 'bold'
                                    }
                                  }}
                                >
                                  <Avatar
                                    sx={{
                                      bgcolor: 'rgba(255,255,255,0.95)',
                                      color: theme.palette.primary.main,
                                      backdropFilter: 'blur(10px)'
                                    }}
                                  >
                                    <PeopleIcon />
                                  </Avatar>
                                </Badge>
                              </Tooltip>
                            </Box>

                            {/* Event Content */}
                            <Box sx={{ p: 3 }}>
                              <Typography 
                                variant="h5" 
                                component="h3" 
                                gutterBottom
                                sx={{ 
                                  fontWeight: 'bold',
                                  color: theme.palette.text.primary,
                                  mb: 2
                                }}
                              >
                                {event.title}
                              </Typography>

                              {isPast && (
                                <Chip 
                                  label="Event Ended" 
                                  size="small" 
                                  color="default"
                                  sx={{ mb: 2 }}
                                />
                              )}
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <AccessTimeIcon sx={{ color: theme.palette.text.secondary, mr: 1.5, fontSize: 20 }} />
                                <Typography variant="body2" color="textSecondary">
                                  {formatTime(event.start_time)} - {formatTime(event.end_time)}
                                </Typography>
                              </Box>
                              
                              {event.location && (
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                  <LocationOnIcon sx={{ color: theme.palette.text.secondary, mr: 1.5, fontSize: 20 }} />
                                  <Typography variant="body2" color="textSecondary">
                                    {event.location}
                                  </Typography>
                                </Box>
                              )}
                              
                              {event.description && (
                                <Typography 
                                  variant="body1" 
                                  sx={{ 
                                    mt: 2, 
                                    color: theme.palette.text.primary,
                                    lineHeight: 1.6
                                  }}
                                >
                                  {event.description}
                                </Typography>
                              )}
                            </Box>
                            
                            {/* Action Buttons */}
                            <Box sx={{ p: 3, pt: 0 }}>
                              <Grid container spacing={2}>
                                <Grid item xs={6}>
                                  <Button 
                                    size="small" 
                                    variant="outlined" 
                                    color="primary"
                                    startIcon={<CalendarTodayIcon />}
                                    disabled={isPast}
                                    fullWidth
                                    sx={{ borderRadius: 2 }}
                                  >
                                    Add to Calendar
                                  </Button>
                                </Grid>
                                <Grid item xs={6}>
                                  {userRegistered ? (
                                    <Button 
                                      size="small" 
                                      variant="contained" 
                                      color="error"
                                      startIcon={registering[event.id] ? <CircularProgress size={16} /> : <PersonRemoveIcon />}
                                      disabled={isPast || registering[event.id]}
                                      onClick={() => handleUnregister(event.id)}
                                      fullWidth
                                      sx={{ borderRadius: 2 }}
                                    >
                                      {registering[event.id] ? 'Processing...' : 'Unregister'}
                                    </Button>
                                  ) : (
                                    <Button 
                                      size="small" 
                                      variant="contained" 
                                      color="primary"
                                      startIcon={registering[event.id] ? <CircularProgress size={16} /> : <PersonAddIcon />}
                                      disabled={isPast || registering[event.id]}
                                      onClick={() => handleRegister(event.id)}
                                      fullWidth
                                      sx={{ borderRadius: 2 }}
                                    >
                                      {registering[event.id] ? 'Processing...' : 'Register'}
                                    </Button>
                                  )}
                                </Grid>
                              </Grid>
                            </Box>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}

          {/* Add Event FAB for Admin */}
          {user?.role === 'admin' && (
            <Fab
              color="primary"
              aria-label="add event"
              onClick={() => handleOpenDialog()}
              sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
              }}
            >
              <AddIcon />
            </Fab>
          )}

          {/* Event Form Dialog */}
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
            <DialogTitle>
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </DialogTitle>
            <DialogContent>
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <TextField
                  required
                  fullWidth
                  name="title"
                  label="Event Title"
                  value={eventForm.title}
                  onChange={handleFormChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  name="description"
                  label="Description"
                  value={eventForm.description}
                  onChange={handleFormChange}
                  margin="normal"
                  multiline
                  rows={3}
                />
                <TextField
                  fullWidth
                  name="location"
                  label="Location"
                  value={eventForm.location}
                  onChange={handleFormChange}
                  margin="normal"
                />
                
                {/* Date and Time Pickers */}
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Event Schedule
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <DateTimePicker
                        label="Start Date & Time"
                        value={eventForm.start_time}
                        onChange={(value) => handleDateChange('start_time', value)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            margin: "normal"
                          }
                        }}
                        ampm={true}
                        minDateTime={new Date()}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DateTimePicker
                        label="End Date & Time"
                        value={eventForm.end_time}
                        onChange={(value) => handleDateChange('end_time', value)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            margin: "normal"
                          }
                        }}
                        ampm={true}
                        minDateTime={eventForm.start_time}
                      />
                    </Grid>
                  </Grid>
                </Box>
                
                {/* Image Upload Section */}
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Event Image
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    Choose Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Button>
                  
                  {/* Image Preview */}
                  {imagePreview && (
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <img
                        src={imagePreview.startsWith('/uploads') ? `http://localhost:5000${imagePreview}` : imagePreview}
                        alt="Preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: 200,
                          objectFit: 'cover',
                          borderRadius: 8
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button 
                onClick={handleSubmit} 
                variant="contained" 
                disabled={submitting || !eventForm.title || !eventForm.start_time || !eventForm.end_time}
              >
                {submitting ? <CircularProgress size={24} /> : (editingEvent ? 'Update' : 'Create')}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </LocalizationProvider>
    </>
  );
};

export default EventsPage; 