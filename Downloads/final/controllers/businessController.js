// controllers/businessController.js
const Business = require('../models/Business');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Register business
// @route   POST /api/business/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, businessType, location } = req.body;
    
    // Check for existing business
    const businessExists = await Business.findOne({ email });
    if (businessExists) {
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
    
    // Create business
    const business = await Business.create({
      name,
      email,
      password,
      phone,
      businessType,
      location: locationData
    });
    
    sendTokenResponse(business, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login business
// @route   POST /api/business/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validate email & password
    if (!email || !password) {
      return next(new ErrorResponse('Please provide email and password', 400));
    }
    
    // Check for business
    const business = await Business.findOne({ email }).select('+password');
    if (!business) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }
    
    // Check if password matches
    const isMatch = await business.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }
    
    sendTokenResponse(business, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in business
// @route   GET /api/business/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const business = await Business.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: business
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all businesses (public)
// @route   GET /api/business/all
// @access  Public
exports.getAllBusinesses = async (req, res, next) => {
  try {
    const businesses = await Business.find({})
      .select('-password -__v')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: businesses.length,
      data: businesses
    });
  } catch (error) {
    next(error);
  }
};

// Helper to send token response
const sendTokenResponse = (business, statusCode, res) => {
  // Create token
  const token = business.getSignedJwtToken();
  
  res.status(statusCode).json({
    success: true,
    token,
    business: {
      id: business._id,
      name: business.name,
      email: business.email,
      businessType: business.businessType,
      role: 'business'
    }
  });
};