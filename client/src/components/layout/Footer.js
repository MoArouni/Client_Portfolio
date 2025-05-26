import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useTheme } from '../../contexts/ThemeContext';

// MUI components
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';

// Icons
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import SendIcon from '@mui/icons-material/Send';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

const Footer = () => {
  const muiTheme = useMuiTheme();
  const { darkMode } = useTheme();
  
  const footerLinks = [
    {
      title: 'Quick Links',
      items: [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Blog', path: '/blog' },
        { name: 'Events', path: '/events' },
        { name: 'Book a Session', path: '/booking' }
      ]
    },
    {
      title: 'Resources',
      items: [
        { name: 'TRIUMPH Model', path: '/about#triumph' },
        { name: 'Speaking Services', path: '/about#services' },
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Contact', path: '/contact' }
      ]
    }
  ];
  
  return (
    <Box
      component="footer"
      sx={{
        mt: 12,
        py: 8,
        backgroundColor: darkMode ? 'background.contrast' : 'background.paper',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle at 100% 150%, ${muiTheme.palette.primary.main}22 20%, ${muiTheme.palette.primary.main}11 20.5%, transparent 21%),
                       radial-gradient(circle at 25% 75%, ${muiTheme.palette.secondary.main}22 24%, transparent 25%)`,
          backgroundSize: '60px 60px',
          opacity: 0.3,
          zIndex: 0
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4}>
          {/* Brand/Logo */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h5"
              component={RouterLink}
              to="/"
              sx={{
                fontWeight: 700,
                mb: 2,
                display: 'inline-block',
                background: 'linear-gradient(45deg, #7c4dff 30%, #00e5ff 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textDecoration: 'none',
              }}
            >
              KHALIL AROUNI
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 300 }}>
              Resilience coach, author, and keynote speaker helping individuals and organizations 
              navigate adversity and achieve lasting positive transformation through the TRIUMPH model.
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
              <AutoStoriesIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2" fontWeight="medium">
                Author of "My Best Friend" and "Transformational Change"
              </Typography>
            </Box>
            
            {/* Social Icons */}
            <Box sx={{ mt: 3 }}>
              <IconButton 
                aria-label="Facebook"
                component="a"
                href="https://www.facebook.com/alkarouni"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  mr: 1, 
                  transition: 'all 0.3s',
                  '&:hover': { 
                    transform: 'translateY(-3px)',
                    color: '#1877F2'
                  } 
                }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton 
                aria-label="Instagram"
                component="a"
                href="https://www.instagram.com/alkarouni/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  mr: 1, 
                  transition: 'all 0.3s',
                  '&:hover': { 
                    transform: 'translateY(-3px)',
                    color: '#E1306C'
                  } 
                }}
              >
                <InstagramIcon />
              </IconButton>
              <IconButton 
                aria-label="LinkedIn"
                component="a"
                href="https://www.linkedin.com/in/khalilarouni/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  mr: 1, 
                  transition: 'all 0.3s',
                  '&:hover': { 
                    transform: 'translateY(-3px)',
                    color: '#0077B5'
                  } 
                }}
              >
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>
          
          {/* Links */}
          {footerLinks.map((section) => (
            <Grid item xs={6} md={2} key={section.title}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                {section.title}
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                {section.items.map((item) => (
                  <Box component="li" key={item.name} sx={{ mb: 1 }}>
                    <Link
                      component={RouterLink}
                      to={item.path}
                      color="text.secondary"
                      sx={{ 
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                        '&:hover': { 
                          color: 'primary.main',
                          pl: 0.5
                        }
                      }}
                    >
                      {item.name}
                    </Link>
                  </Box>
                ))}
              </Box>
            </Grid>
          ))}
          
          {/* Newsletter */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Stay Updated
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Subscribe to my newsletter for updates on events, workshops, new blog posts, and resources on resilience and personal growth.
            </Typography>
            <Paper
              component="form"
              sx={{ 
                p: '2px 4px', 
                display: 'flex', 
                alignItems: 'center',
                borderRadius: 4,
                border: `1px solid ${muiTheme.palette.divider}`,
                boxShadow: 'none',
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Your email address"
                inputProps={{ 'aria-label': 'subscribe to newsletter' }}
              />
              <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
              <IconButton color="primary" sx={{ p: '10px' }} aria-label="send">
                <SendIcon />
              </IconButton>
            </Paper>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4 }} />
        
        {/* Copyright */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Khalil Arouni. All rights reserved.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Resilience Coach • Author • Speaker
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 