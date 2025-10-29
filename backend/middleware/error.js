const { validationResult } = require('express-validator');

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.log(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Validation error handler
const validationHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  next();
};

// 404 handler
const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = {
  errorHandler,
  validationHandler,
  notFound,
  asyncHandler
};