// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Business = require('../models/Business');
const ErrorResponse = require('../utils/errorResponse');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }  // Also check for token in cookies (if cookie parser is available)
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role === 'business') {
      req.user = await Business.findById(decoded.id);
    } else {
      // Treat 'individual' role as 'user' for consistency
      req.user = await User.findById(decoded.id);
      // Normalize role to make sure 'individual' is treated as 'user'
      if (decoded.role === 'individual') {
        decoded.role = 'user';
      }
    }
    
    if (!req.user) {
      return next(new ErrorResponse('User not found', 401));
    }
    
    // Add role to req.user
    req.user.role = decoded.role;
    
    next();
  } catch (error) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Normalize 'individual' role to be treated as 'user' for authorization
    const userRole = req.user.role === 'individual' ? 'user' : req.user.role;
    
    if (!roles.includes(userRole) && !roles.includes(req.user.role)) {
      return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403));
    }
    next();
  };
};