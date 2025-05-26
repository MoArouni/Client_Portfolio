import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';

// MUI Components
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

// Icons
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import EventNoteIcon from '@mui/icons-material/EventNote';

// Components
import BookingCalendar from '../components/booking/BookingCalendar';

// Animations
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.6 } 
  }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6,
      delay: 0.3
    } 
  }
};

const BookingPage = () => {
  const theme = useTheme();
  
  // List of services offered
  const services = [
    {
      icon: <CalendarMonthIcon color="primary" />,
      title: 'Flexible Scheduling',
      description: 'Choose from a range of available time slots that fit your schedule.'
    },
    {
      icon: <AccessTimeIcon color="primary" />,
      title: '1-Hour Sessions',
      description: 'Each appointment is a full hour to ensure we have enough time to discuss your needs.'
    },
    {
      icon: <VideoCallIcon color="primary" />,
      title: 'Virtual Options',
      description: 'Appointments available via Zoom, Google Meet, or other video conferencing platforms.'
    },
    {
      icon: <LocationOnIcon color="primary" />,
      title: 'In-Person Meetings',
      description: 'For local clients, in-person meetings can be arranged at a convenient location.'
    },
    {
      icon: <PeopleIcon color="primary" />,
      title: 'One-on-One Focus',
      description: 'Dedicated attention to your specific requirements and questions.'
    },
    {
      icon: <EventNoteIcon color="primary" />,
      title: 'Follow-up Notes',
      description: 'Receive a summary of our discussion and next steps after the appointment.'
    }
  ];
  
  return (
    <>
      <Helmet>
        <title>Book an Appointment</title>
        <meta name="description" content="Schedule a one-on-one appointment to discuss your project needs." />
      </Helmet>
      
      <Box
        component="section"
        sx={{
          pt: 10,
          pb: 12,
          backgroundColor: 'background.default',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `radial-gradient(circle at 20% 30%, ${theme.palette.primary.main}0A 0%, transparent 20%),
                         radial-gradient(circle at 80% 60%, ${theme.palette.secondary.main}0A 0%, transparent 20%)`,
            zIndex: 0
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <Box textAlign="center" mb={6} component={motion.div} variants={fadeIn} initial="hidden" animate="visible">
            <Typography 
              variant="overline" 
              color="primary" 
              component="p"
              sx={{ fontWeight: 500, letterSpacing: 1.5 }}
            >
              Schedule Your Appointment
            </Typography>
            <Typography 
              variant="h2" 
              component="h1"
              sx={{ 
                mb: 2,
                fontWeight: 700,
                background: 'linear-gradient(45deg, #7c4dff 30%, #00e5ff 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Book a Consultation
            </Typography>
            <Divider 
              sx={{ 
                width: 100, 
                mx: 'auto', 
                my: 3, 
                borderColor: 'primary.main',
                borderWidth: 2,
                borderRadius: 1
              }} 
            />
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ 
                maxWidth: 700, 
                mx: 'auto',
                fontWeight: 400 
              }}
            >
              Select a date and time for your appointment. I look forward to discussing your project and how I can help you achieve your goals.
            </Typography>
          </Box>
          
          <Grid container spacing={5} alignItems="flex-start">
            {/* Calendar Column */}
            <Grid item xs={12} md={7} component={motion.div} variants={slideUp} initial="hidden" animate="visible">
              <BookingCalendar />
            </Grid>
            
            {/* Information Column */}
            <Grid item xs={12} md={5}>
              <Paper 
                elevation={4}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  background: theme.palette.mode === 'dark' 
                    ? 'linear-gradient(135deg, rgba(40,40,60,0.95) 0%, rgba(60,60,85,0.95) 100%)' 
                    : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(245,250,255,0.95) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: theme.palette.mode === 'dark' 
                    ? '1px solid rgba(255, 255, 255, 0.1)' 
                    : '1px solid rgba(0, 0, 0, 0.05)',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                    : '0 8px 32px rgba(0, 0, 0, 0.15)',
                  position: 'sticky',
                  top: 100
                }}
                component={motion.div}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
                  About Our Appointments
                </Typography>
                <Typography variant="body1" paragraph color="text.secondary">
                  During our consultation, we'll discuss your project needs, goals, and any questions you might have. I'll provide expert advice and recommendations tailored to your specific situation.
                </Typography>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Services Offered
                </Typography>
                
                <List>
                  {services.map((service, index) => (
                    <ListItem 
                      key={index} 
                      disableGutters 
                      sx={{ 
                        mb: 2,
                        transition: 'transform 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateX(5px)'
                        }
                      }}
                    >
                      <ListItemIcon>
                        {service.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Typography variant="subtitle1" fontWeight={600}>
                            {service.title}
                          </Typography>
                        } 
                        secondary={service.description} 
                      />
                    </ListItem>
                  ))}
                </List>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="body2" color="text.secondary">
                  Need to make changes to your appointment? You can manage your bookings from your dashboard after logging in.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default BookingPage; 