import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

// Icons
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const steps = ['Account Details', 'Personal Information'];

const RegisterPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { register, isAuthenticated, error, clearError } = useAuth();
  const { showNotification } = useNotification();
  
  // State
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  const { name, email, password, confirmPassword } = formData;
  
  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
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
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  // Validate form
  const validateForm = (step) => {
    const errors = {};
    
    if (step === 0) {
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
      
      if (!confirmPassword) {
        errors.confirmPassword = 'Error: Please confirm your password';
      } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Error: Passwords do not match';
      }
    } else if (step === 1) {
      if (!name) {
        errors.name = 'Error: Name is required';
      } else if (name.length < 2) {
        errors.name = 'Error: Name too short';
      }
    }
    
    return errors;
  };
  
  // Handle next step
  const handleNext = () => {
    const errors = validateForm(activeStep);
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm(activeStep);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setLoading(true);
    clearError(); // Clear any previous errors
    
    try {
      // Remove confirmPassword from the data before sending
      const { confirmPassword, ...registerData } = formData;
      const result = await register(registerData, showNotification);
      if (!result) {
        // If registration failed but no error was set in context
        setFormErrors({
          general: 'Registration failed. Please try again.'
        });
      }
      // Note: Navigation and success message are handled in AuthContext
    } catch (err) {
      console.error('Registration error:', err);
      // Set a general error if not handled by context
      setFormErrors({
        general: 'Registration failed. Please try again later.'
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
        <title>Register | Portfolio</title>
        <meta name="description" content="Create an account to book appointments and manage your bookings." />
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
                  : '0 15px 35px rgba(0, 0, 0, 0.1)'
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
                  Create an Account
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  align="center"
                  sx={{ mb: 4 }}
                >
                  Join us to book appointments and more
                </Typography>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
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
                {activeStep === 0 ? (
                  // Step 1: Account Details
                  <>
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
                    
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={handleChange}
                      margin="normal"
                      variant="outlined"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      error={!!formErrors.confirmPassword}
                      helperText={formErrors.confirmPassword}
                      sx={{ mb: 3 }}
                      FormHelperTextProps={{
                        sx: { color: theme.palette.error.main, fontWeight: 'bold' }
                      }}
                      InputProps={{
                        sx: { borderRadius: 2 },
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={toggleConfirmPasswordVisibility}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </>
                ) : (
                  // Step 2: Personal Information
                  <>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={name}
                      onChange={handleChange}
                      margin="normal"
                      variant="outlined"
                      required
                      error={!!formErrors.name}
                      helperText={formErrors.name}
                      sx={{ mb: 3 }}
                      FormHelperTextProps={{
                        sx: { color: theme.palette.error.main, fontWeight: 'bold' }
                      }}
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  {activeStep > 0 ? (
                    <Button
                      onClick={handleBack}
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                      sx={{
                        borderRadius: 2,
                        borderWidth: 2,
                        '&:hover': { borderWidth: 2 }
                      }}
                    >
                      Back
                    </Button>
                  ) : (
                    <Button
                      component={RouterLink}
                      to="/login"
                      variant="text"
                      color="primary"
                    >
                      Already have an account?
                    </Button>
                  )}
                  
                  {activeStep < steps.length - 1 ? (
                    <Button
                      onClick={handleNext}
                      variant="contained"
                      color="primary"
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        py: 1,
                        px: 3,
                        borderRadius: 2,
                        background: 'linear-gradient(45deg, #7c4dff 30%, #536dfe 90%)'
                      }}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
                      sx={{
                        py: 1,
                        px: 3,
                        borderRadius: 2,
                        background: 'linear-gradient(45deg, #7c4dff 30%, #536dfe 90%)'
                      }}
                    >
                      {loading ? 'Sending...' : 'Send Verification Link'}
                    </Button>
                  )}
                </Box>
              </motion.form>
              
              <Divider sx={{ my: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>
              
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  component={RouterLink}
                  to="/booking"
                  variant="outlined"
                  color="secondary"
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    borderWidth: 2,
                    '&:hover': { borderWidth: 2 }
                  }}
                >
                  Continue as Guest
                </Button>
                <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
                  You can still book appointments, but won't be able to manage them later
                </Typography>
              </Box>
            </Paper>
          </motion.div>
        </Container>
      </Box>
    </>
  );
};

export default RegisterPage; 