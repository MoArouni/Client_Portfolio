import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

// MUI Components
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

// Icons
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';

const LoginPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, error, clearError } = useAuth();
  const { showNotification } = useNotification();
  
  // State
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  const { email, password } = formData;
  
  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from || '/dashboard';
      navigate(from);
    }
  }, [isAuthenticated, navigate, location.state]);
  
  // Clear errors on unmount
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear field error when typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!email) {
      errors.email = 'Error: Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Error: Invalid email format';
    }
    
    if (!password) {
      errors.password = 'Error: Password is required';
    } else if (password.length < 6) {
      errors.password = 'Error: Password too short (min 6 characters)';
    }
    
    return errors;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setLoading(true);
    clearError(); // Clear any previous errors
    
    try {
      const result = await login(formData, showNotification);
      if (!result) {
        // If login failed but no error was set in context
        setFormErrors({
          general: 'Login failed. Please check your credentials.'
        });
      }
      // Note: Navigation and success message are handled in AuthContext
    } catch (err) {
      console.error('Login error:', err);
      // Set a general error if not handled by context
      setFormErrors({
        general: 'Login failed. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Login | Portfolio</title>
        <meta name="description" content="Login to your account to manage appointments and access exclusive content." />
      </Helmet>
      
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          py: 8,
          background: theme.palette.mode === 'dark' 
            ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.contrast} 100%)`
            : `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `radial-gradient(circle at 0% 0%, ${theme.palette.primary.main}10 0%, transparent 30%),
                         radial-gradient(circle at 100% 100%, ${theme.palette.secondary.main}10 0%, transparent 30%)`,
            zIndex: 0
          }
        }}
      >
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Paper
              elevation={6}
              sx={{
                p: 5,
                borderRadius: 4,
                overflow: 'hidden',
                background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, rgba(30,30,45,0.8) 0%, rgba(30,30,60,0.8) 100%)' 
                  : 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(245,250,255,0.8) 100%)',
                backdropFilter: 'blur(10px)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 15px 35px rgba(0, 0, 0, 0.3)'
                  : '0 15px 35px rgba(0, 0, 0, 0.1)',
              }}
            >
              <motion.div variants={itemVariants}>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  align="center" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 700,
                    mb: 1
                  }}
                >
                  Welcome Back
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  align="center"
                  sx={{ mb: 4 }}
                >
                  Sign in to your account to continue
                </Typography>
              </motion.div>
              
              {error && (
                <motion.div variants={itemVariants}>
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                </motion.div>
              )}
              
              {formErrors.general && (
                <motion.div variants={itemVariants}>
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {formErrors.general}
                  </Alert>
                </motion.div>
              )}
              
              <motion.form variants={itemVariants} onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  type="email"
                  required
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  sx={{ mb: 2 }}
                  FormHelperTextProps={{
                    sx: { color: theme.palette.error.main, fontWeight: 'bold' }
                  }}
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  value={password}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  type={showPassword ? 'text' : 'password'}
                  required
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  sx={{ mb: 2 }}
                  FormHelperTextProps={{
                    sx: { color: theme.palette.error.main, fontWeight: 'bold' }
                  }}
                  InputProps={{
                    sx: { borderRadius: 2 },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={togglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                  <Link 
                    component={RouterLink}
                    to="/forgot-password"
                    variant="body2"
                    color="primary"
                    sx={{ 
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    Forgot Password?
                  </Link>
                </Box>
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(45deg, #7c4dff 30%, #536dfe 90%)',
                    mb: 3
                  }}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
                
                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    OR
                  </Typography>
                </Divider>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Don't have an account?
                  </Typography>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="outlined"
                    color="primary"
                    sx={{
                      borderRadius: 2,
                      py: 1,
                      borderWidth: 2,
                      '&:hover': { borderWidth: 2 }
                    }}
                  >
                    Create account
                  </Button>
                </Box>
              </motion.form>
            </Paper>
          </motion.div>
        </Container>
      </Box>
    </>
  );
};

export default LoginPage; 