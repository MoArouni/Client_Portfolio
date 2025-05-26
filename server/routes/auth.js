const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const googleCalendar = require('../services/googleCalendar');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/default');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  authController.register
);

// @route   POST api/auth/verify-email
// @desc    Verify email address
// @access  Public
router.post('/verify-email', authController.verifyEmail);

// @route   POST api/auth/resend-verification
// @desc    Resend verification email
// @access  Public
router.post(
  '/resend-verification',
  [
    check('email', 'Please include a valid email').isEmail()
  ],
  authController.resendVerification
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.login
);

// @route   POST api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post(
  '/forgot-password',
  [
    check('email', 'Please include a valid email').isEmail()
  ],
  authController.forgotPassword
);

// @route   POST api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post(
  '/reset-password',
  [
    check('token', 'Reset token is required').not().isEmpty(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  authController.resetPassword
);

// @route   GET api/auth
// @desc    Get authenticated user
// @access  Private
router.get('/', auth, authController.getUser);

// @route   GET api/auth/google
// @desc    Get Google OAuth URL (Admin only)
// @access  Private (Admin only)
router.get('/google', auth, adminAuth, (req, res) => {
  try {
    // Create a state parameter with the user ID
    const state = jwt.sign(
      { user: { id: req.user.id } },
      config.jwtSecret,
      { expiresIn: '1h' }
    );
    
    // Get the auth URL with the state parameter
    const authUrl = googleCalendar.getAuthUrl(state);
    res.json({ url: authUrl });
  } catch (err) {
    console.error('Google auth URL error:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/google/callback
// @desc    Handle Google OAuth callback (Admin only)
// @access  Public (redirected from Google, but validates admin user)
router.get('/google/callback', authController.handleGoogleCallback);

// @route   GET api/auth/google/events
// @desc    List upcoming Google Calendar events (Admin only)
// @access  Private (Admin only)
router.get('/google/events', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user || !user.googleRefreshToken) {
      return res.status(400).json({ msg: 'Google Calendar not connected' });
    }
    
    const events = await googleCalendar.listEvents(user.googleRefreshToken);
    res.json(events);
  } catch (err) {
    console.error('Google Calendar events error:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 