// controllers/authController.js
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, location } = req.body;
    
    // Check for existing user
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new ErrorResponse('Email already registered', 400));
    }
    
    // Convert location data if provided
    let locationData = undefined;
    if (location && location.longitude && location.latitude) {
      locationData = {
        type: 'Point',
        coordinates: [parseFloat(location.longitude), parseFloat(location.latitude)]
      };
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      location: locationData
    });
    
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validate email & password
    if (!email || !password) {
      return next(new ErrorResponse('Please provide email and password', 400));
    }
    
    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }
    
    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }
    
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Helper to send token response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();
    res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: 'user'
    }
  });
};