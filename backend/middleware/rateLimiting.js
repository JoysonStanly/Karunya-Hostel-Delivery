const rateLimit = require('express-rate-limit');

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'development' ? 1000 : 100), // Higher limit for development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => process.env.NODE_ENV === 'development' && (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip === '::ffff:127.0.0.1'), // Skip rate limiting for localhost in development
});

// Auth endpoints rate limiting (more strict)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 100 : 5, // Higher limit for development
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  skip: (req) => process.env.NODE_ENV === 'development' && (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip === '::ffff:127.0.0.1'),
});

// Password reset rate limiting
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'development' ? 50 : 3, // Higher limit for development
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' && (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip === '::ffff:127.0.0.1'),
});

// File upload rate limiting
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 100 : 10, // Higher limit for development
  message: {
    success: false,
    message: 'Too many file upload attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' && (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip === '::ffff:127.0.0.1'),
});

// Message sending rate limiting
const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'development' ? 200 : 30, // Higher limit for development
  message: {
    success: false,
    message: 'Too many messages sent, please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' && (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip === '::ffff:127.0.0.1'),
});

module.exports = {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  uploadLimiter,
  messageLimiter
};