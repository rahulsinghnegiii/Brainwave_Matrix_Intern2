import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token - User not found'
        });
      }

      // Add user info to request
      req.user = {
        id: user._id,
        email: user.email,
        role: user.role || 'user'
      };

      next();
    } catch (err) {
      console.error('Token verification error:', err);
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Middleware to check if user is admin
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Combined middleware for admin routes
export const authenticateAdmin = [authenticateToken, isAdmin];

// Debug version of authenticate token for development
export const debugAuthenticateToken = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    // For development, set a mock admin user
    req.user = {
      id: 'debug-admin-id',
      email: 'admin@example.com',
      role: 'admin'
    };
    return next();
  }
  
  // In production, use normal authentication
  return authenticateToken(req, res, next);
}; 