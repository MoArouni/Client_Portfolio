const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User } = require('../models');
const googleCalendar = require('../services/googleCalendar');
const emailService = require('../services/emailService');
const config = require('../config/default');

// @desc    Register a user (send verification email)
// @access  Public
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ 
      where: { email } 
    });

    if (user) {
      if (user.isEmailVerified) {
        return res.status(400).json({ msg: 'User already exists and is verified' });
      } else {
        // User exists but not verified, resend verification email
        const verificationToken = emailService.generateVerificationToken();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        user.emailVerificationToken = verificationToken;
        user.emailVerificationExpires = verificationExpires;
        await user.save();
        
        await emailService.sendVerificationEmailSafe(user, verificationToken);
        
        return res.json({ 
          msg: 'Verification email resent. Please check your email to verify your account.',
          requiresVerification: true 
        });
      }
    }

    // Check if this is the first user (make them admin)
    const userCount = await User.count();
    const isFirstUser = userCount === 0;

    // Generate verification token
    const verificationToken = emailService.generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user (unverified)
    user = await User.create({
      name,
      email,
      password,
      role: isFirstUser ? 'admin' : 'user', // First user becomes admin
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires
    });

    // Send verification email
    await emailService.sendVerificationEmailSafe(user, verificationToken);

    const message = isFirstUser 
      ? 'Registration successful! As the first user, you will have admin privileges. Please check your email to verify your account.'
      : 'Registration successful! Please check your email to verify your account.';

    res.json({ 
      msg: message,
      requiresVerification: true,
      isFirstUser
    });
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Verify email address
// @access  Public
exports.verifyEmail = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ msg: 'Verification token is required' });
  }

  try {
    // Find user with this verification token
    const user = await User.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired verification token' });
    }

    // Verify the user
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    // Generate JWT token for immediate login
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: config.jwtExpire },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          msg: 'Email verified successfully! You are now logged in.',
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified
          }
        });
      }
    );
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Resend verification email
// @access  Public
exports.resendVerification = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ msg: 'Email is required' });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ msg: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = emailService.generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Send verification email
    await emailService.sendVerificationEmailSafe(user, verificationToken);

    res.json({ msg: 'Verification email sent. Please check your email.' });
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Authenticate user & get token
// @access  Public
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ 
      where: { email } 
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(400).json({ 
        msg: 'Please verify your email address before logging in. Check your email for the verification link.',
        requiresVerification: true,
        email: user.email
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Return jsonwebtoken
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: config.jwtExpire },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          hasGoogleCalendar: !!user.googleRefreshToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified
          }
        });
      }
    );
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get authenticated user
// @access  Private
exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json({
      ...user.toJSON(),
      hasGoogleCalendar: !!user.googleRefreshToken
    });
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Handle Google OAuth callback
// @access  Public (redirected from Google)
exports.handleGoogleCallback = async (req, res) => {
  const { code, state } = req.query;
  
  // State should contain the user ID from the JWT
  if (!code || !state) {
    console.log('Callback received with query:', req.query);
    return res.status(400).send('Invalid request: missing code or state');
  }
  
  try {
    // Verify the state contains a valid JWT
    let decoded;
    try {
      decoded = jwt.verify(state, config.jwtSecret);
    } catch (err) {
      return res.status(400).send('Invalid state parameter');
    }
    
    // Find the user and verify they are an admin
    const user = await User.findByPk(decoded.user.id);
    
    if (!user) {
      return res.status(404).send('User not found');
    }
    
    // Check if user is admin
    if (user.role !== 'admin') {
      console.log('Non-admin user attempted to connect Google Calendar:', user.email);
      return res.redirect(`${config.clientUrl}/settings?google=error&message=admin_only`);
    }
    
    // Exchange the code for tokens
    const tokens = await googleCalendar.getTokens(code);
    
    // Save the Google refresh token
    user.googleRefreshToken = tokens.refresh_token;
    await user.save();
    
    console.log('Admin user connected Google Calendar:', user.email);
    
    // Redirect to the frontend with success message
    res.redirect(`${config.clientUrl}/settings?google=success`);
  } catch (err) {
    console.error('Google auth callback error:', err);
    res.redirect(`${config.clientUrl}/settings?google=error&message=connection_failed`);
  }
};

// @desc    Request password reset
// @access  Public
exports.forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ 
        msg: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    // Check if user's email is verified
    if (!user.isEmailVerified) {
      return res.status(400).json({ 
        msg: 'Please verify your email address first before requesting a password reset.' 
      });
    }

    // Generate reset token
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save reset token and expiry to user
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // Send password reset email
    await emailService.sendPasswordResetEmail(user, resetToken);

    console.log(`✅ Password reset email sent to: ${user.email}`);

    res.json({ 
      msg: 'If an account with that email exists, a password reset link has been sent.' 
    });
  } catch (err) {
    console.error('❌ Server error in forgotPassword:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Reset password with token
// @access  Public
exports.resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { token, password } = req.body;

  try {
    // Find user with valid reset token
    const user = await User.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ 
        msg: 'Invalid or expired password reset token. Please request a new password reset.' 
      });
    }

    // Update password and clear reset token
    user.password = password; // Will be hashed by the beforeUpdate hook
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    console.log(`✅ Password reset successful for user: ${user.email}`);

    // Generate JWT token for immediate login
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: config.jwtExpire },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          msg: 'Password reset successful! You are now logged in.',
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified
          }
        });
      }
    );
  } catch (err) {
    console.error('❌ Server error in resetPassword:', err.message);
    res.status(500).send('Server error');
  }
}; 