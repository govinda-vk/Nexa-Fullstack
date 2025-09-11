const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken, authenticateToken } = require('../middleware/auth');
const passport = require('../config/passport');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email, password, and name are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'A user with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      provider: 'local'
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Return user data (without password)
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Email already exists',
        message: 'A user with this email already exists'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Validation error',
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      error: 'Registration failed',
      message: 'Internal server error during registration'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account deactivated',
        message: 'Your account has been deactivated'
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.stats.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Return user data (without password)
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'Internal server error during login'
    });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      message: 'Internal server error'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const allowedUpdates = ['name', 'avatar', 'preferences'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({
        error: 'Invalid updates',
        message: `Allowed updates: ${allowedUpdates.join(', ')}`
      });
    }

    updates.forEach(update => {
      if (update === 'preferences' && req.body[update]) {
        // Merge preferences
        req.user.preferences = { ...req.user.preferences.toObject(), ...req.body[update] };
      } else {
        req.user[update] = req.body[update];
      }
    });

    await req.user.save();

    res.json({
      message: 'Profile updated successfully',
      user: req.user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Validation error',
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      error: 'Failed to update profile',
      message: 'Internal server error'
    });
  }
});

// Google OAuth routes
router.get('/google', (req, res, next) => {
  // Check if Google OAuth is configured
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET ||
      process.env.GOOGLE_CLIENT_ID === 'your-google-client-id-get-from-console' ||
      process.env.GOOGLE_CLIENT_SECRET === 'your-google-client-secret-get-from-console' ||
      !process.env.GOOGLE_CLIENT_ID.includes('apps.googleusercontent.com')) {
    return res.status(501).json({
      error: 'Google OAuth not configured',
      message: 'Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file'
    });
  }
  
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  // Check if Google OAuth is configured
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET ||
      process.env.GOOGLE_CLIENT_ID === 'your-google-client-id-get-from-console' ||
      process.env.GOOGLE_CLIENT_SECRET === 'your-google-client-secret-get-from-console' ||
      !process.env.GOOGLE_CLIENT_ID.includes('apps.googleusercontent.com')) {
    return res.redirect('http://localhost:3001/auth/error?reason=not_configured');
  }
  
  passport.authenticate('google', { session: false }, async (err, user, info) => {
    if (err) {
      console.error('Google callback error:', err);
      return res.redirect('http://localhost:3001/auth/error');
    }
    
    if (!user) {
      return res.redirect('http://localhost:3001/auth/error?reason=no_user');
    }
    
    try {
      // Generate JWT token
      const token = generateToken(user._id);
      
      // Update last login
      user.stats.lastLogin = new Date();
      await user.save();

      // Redirect to frontend with token
      const redirectUrl = process.env.NODE_ENV === 'production' 
        ? `https://yourapp.com/auth/success?token=${token}`
        : `http://localhost:3001/auth/success?token=${token}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google callback error:', error);
      const errorUrl = process.env.NODE_ENV === 'production'
        ? 'https://yourapp.com/auth/error'
        : 'http://localhost:3001/auth/error';
      
      res.redirect(errorUrl);
    }
  })(req, res, next);
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Missing passwords',
        message: 'Current password and new password are required'
      });
    }

    if (req.user.provider === 'google') {
      return res.status(400).json({
        error: 'Not allowed',
        message: 'Cannot change password for Google OAuth users'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    
    // Check current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid password',
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Validation error',
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      error: 'Failed to change password',
      message: 'Internal server error'
    });
  }
});

module.exports = router;
