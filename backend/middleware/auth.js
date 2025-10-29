const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken } = require('../utils/auth');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = verifyToken(token);

    // Get user from token
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (!req.user.isActive || req.user.accountStatus !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is suspended or inactive'
      });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Optional auth - user may or may not be authenticated
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = verifyToken(token);
      req.user = await User.findById(decoded.id);
    } catch (error) {
      // Token is invalid, but that's okay for optional auth
      req.user = null;
    }
  }

  next();
};

// Check if user is the owner of the resource or admin
const ownerOrAdmin = (resourceField = 'user') => {
  return (req, res, next) => {
    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceOwnerId = req.resource ? req.resource[resourceField] : req.params.userId;
    
    if (resourceOwnerId && resourceOwnerId.toString() === req.user._id.toString()) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this resource'
    });
  };
};

// Check if user can access order (customer, assigned delivery, or admin)
const canAccessOrder = async (req, res, next) => {
  try {
    const Order = require('../models/Order');
    const order = await Order.findById(req.params.id || req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Admin can access all orders
    if (req.user.role === 'admin') {
      req.order = order;
      return next();
    }

    // Customer can access their own orders
    if (order.customer.toString() === req.user._id.toString()) {
      req.order = order;
      return next();
    }

    // Delivery student can access assigned orders
    if (order.assignedTo && order.assignedTo.toString() === req.user._id.toString()) {
      req.order = order;
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this order'
    });
  } catch (error) {
    console.error('Order access middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Check if user can access chat (customer or assigned delivery student)
const canAccessChat = async (req, res, next) => {
  try {
    const Order = require('../models/Order');
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is customer or assigned delivery student
    const isCustomer = order.customer.toString() === req.user._id.toString();
    const isDelivery = order.assignedTo && order.assignedTo.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isDelivery && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this chat'
      });
    }

    req.order = order;
    next();
  } catch (error) {
    console.error('Chat access middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
  ownerOrAdmin,
  canAccessOrder,
  canAccessChat
};