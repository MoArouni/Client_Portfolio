import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';

// MUI components
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Slide from '@mui/material/Slide';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Navbar = () => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { showNotification } = useNotification();
  
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isTransparent, setIsTransparent] = useState(location.pathname === '/');
  
  // Handle logout with notification - moved up before usage
  const handleLogout = () => {
    logout(showNotification);
  };
  
  // Update navbar transparency based on route
  useEffect(() => {
    setIsTransparent(location.pathname === '/');
  }, [location.pathname]);
  
  // Make navbar solid on scroll
  useEffect(() => {
    if (!isTransparent) return;
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Add a class to the navbar when scrolled
      if (scrollY > 50) {
        setIsTransparent(false);
      } else {
        setIsTransparent(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isTransparent]);
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };
  
  const pages = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Blog', path: '/blog' },
    { name: 'Events', path: '/events' },
    { name: 'Book Appointment', path: '/booking' }
  ];
  
  const authLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Settings', path: '/settings' },
    { name: 'Profile', path: '/profile' }
  ];
  
  const userEmail = user?.email || 'User';
  const userInitial = userEmail.charAt(0).toUpperCase();
  
  // Mobile drawer content
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography
        variant="h6"
        noWrap
        component={RouterLink}
        to="/"
        sx={{
          my: 2,
          fontWeight: 700,
          background: 'linear-gradient(45deg, #7c4dff 30%, #00e5ff 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textDecoration: 'none',
        }}
      >
        PORTFOLIO
      </Typography>
      <Divider />
      <List>
        {pages.map((page) => (
          <ListItem key={page.name} disablePadding>
            <ListItemButton 
              component={RouterLink} 
              to={page.path}
              sx={{ 
                textAlign: 'center',
                color: location.pathname === page.path ? 'primary.main' : 'text.primary'
              }}
            >
              <ListItemText primary={page.name} />
            </ListItemButton>
          </ListItem>
        ))}
        {isAuthenticated && (
          <>
            <Divider />
            {authLinks.map((link) => (
              <ListItem key={link.name} disablePadding>
                <ListItemButton 
                  component={RouterLink} 
                  to={link.path}
                  sx={{ 
                    textAlign: 'center',
                    color: location.pathname === link.path ? 'primary.main' : 'text.primary'
                  }}
                >
                  <ListItemText primary={link.name} />
                </ListItemButton>
              </ListItem>
            ))}
            <ListItem disablePadding>
              <ListItemButton 
                onClick={handleLogout}
                sx={{ textAlign: 'center' }}
              >
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </>
        )}
        {!isAuthenticated && (
          <>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton 
                component={RouterLink} 
                to="/login"
                sx={{ 
                  textAlign: 'center',
                  color: location.pathname === '/login' ? 'primary.main' : 'text.primary'
                }}
              >
                <ListItemText primary="Login" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton 
                component={RouterLink} 
                to="/register"
                sx={{ 
                  textAlign: 'center',
                  color: location.pathname === '/register' ? 'primary.main' : 'text.primary'
                }}
              >
                <ListItemText primary="Register" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <HideOnScroll>
        <AppBar 
          position="fixed" 
          elevation={0}
          sx={{
            backgroundColor: isTransparent ? 'transparent' : (darkMode ? 'rgba(18, 18, 32, 0.8)' : 'rgba(255, 255, 255, 0.8)'),
            transition: 'background-color 0.3s ease-in-out',
          }}
        >
          <Container maxWidth="xl">
            <Toolbar disableGutters>
              {/* Logo - Desktop */}
              <Typography
                variant="h6"
                noWrap
                component={RouterLink}
                to="/"
                sx={{
                  mr: 2,
                  display: { xs: 'none', md: 'flex' },
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #7c4dff 30%, #00e5ff 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textDecoration: 'none',
                }}
              >
                Khalil Arouni
              </Typography>

              {/* Mobile menu button */}
              <Box sx={{ flexGrow: 0, display: { xs: 'flex', md: 'none' } }}>
                <IconButton
                  size="large"
                  aria-label="navigation menu"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleDrawerToggle}
                  color="inherit"
                >
                  <MenuIcon />
                </IconButton>
              </Box>

              {/* Logo - Mobile */}
              <Typography
                variant="h6"
                noWrap
                component={RouterLink}
                to="/"
                sx={{
                  mr: 2,
                  display: { xs: 'flex', md: 'none' },
                  flexGrow: 1,
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #7c4dff 30%, #00e5ff 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textDecoration: 'none',
                }}
              >
                Khalil Arouni
              </Typography>

              {/* Desktop navigation links */}
              <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 4 }}>
                {pages.map((page) => (
                  <Button
                    key={page.name}
                    component={RouterLink}
                    to={page.path}
                    sx={{
                      my: 2,
                      mx: 1,
                      color: location.pathname === page.path 
                        ? 'primary.main' 
                        : darkMode ? '#fff' : '#2d2d2d',
                      display: 'block',
                      fontWeight: location.pathname === page.path ? 700 : 500,
                      position: 'relative',
                      '&::after': location.pathname === page.path ? {
                        content: '""',
                        position: 'absolute',
                        width: '100%',
                        height: '2px',
                        bottom: '5px',
                        left: 0,
                        background: 'linear-gradient(45deg, #7c4dff 30%, #00e5ff 90%)',
                        borderRadius: '2px'
                      } : {}
                    }}
                  >
                    {page.name}
                  </Button>
                ))}
              </Box>

              {/* Theme toggle */}
              <Box sx={{ mr: 2 }}>
                <IconButton onClick={toggleDarkMode} color={darkMode ? 'primary' : 'secondary'}>
                  {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Box>

              {/* User menu */}
              <Box sx={{ flexGrow: 0 }}>
                {isAuthenticated ? (
                  <>
                    <Tooltip title="Open settings">
                      <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: 'primary.main',
                            background: 'linear-gradient(45deg, #7c4dff 30%, #00e5ff 90%)'
                          }}
                        >
                          {userInitial}
                        </Avatar>
                      </IconButton>
                    </Tooltip>
                    <Menu
                      sx={{ mt: '45px' }}
                      id="menu-appbar"
                      anchorEl={anchorElUser}
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      keepMounted
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      open={Boolean(anchorElUser)}
                      onClose={handleCloseUserMenu}
                    >
                      {authLinks.map((link) => (
                        <MenuItem 
                          key={link.name} 
                          component={RouterLink}
                          to={link.path}
                          onClick={handleCloseUserMenu}
                        >
                          <Typography textAlign="center">{link.name}</Typography>
                        </MenuItem>
                      ))}
                      <MenuItem onClick={() => {handleCloseUserMenu(); handleLogout();}}>
                        <Typography textAlign="center">Logout</Typography>
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                    <Button
                      component={RouterLink}
                      to="/login"
                      sx={{ 
                        px: 3, 
                        color: darkMode ? '#fff' : '#2d2d2d',
                        mr: 1
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      component={RouterLink}
                      to="/register"
                      variant="contained"
                      color="primary"
                      sx={{ px: 3 }}
                    >
                      Register
                    </Button>
                  </Box>
                )}
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      </HideOnScroll>
      
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            background: darkMode ? 'rgba(18, 18, 32, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Toolbar spacer */}
      <Toolbar />
    </>
  );
};

export default Navbar; 