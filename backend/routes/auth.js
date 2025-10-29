const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  toggleAvailability
} = require('../controllers/auth');

const { protect, authorize } = require('../middleware/auth');
const { validationHandler } = require('../middleware/error');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiting');
const {
  registerValidation,
  loginValidation,
  updateDetailsValidation,
  updatePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} = require('../utils/validation');

const router = express.Router();

// Public routes
router.post('/register', authLimiter, registerValidation, validationHandler, register);
router.post('/login', authLimiter, loginValidation, validationHandler, login);
router.post('/forgotpassword', passwordResetLimiter, forgotPasswordValidation, validationHandler, forgotPassword);
router.put('/resetpassword/:resettoken', resetPasswordValidation, validationHandler, resetPassword);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetailsValidation, validationHandler, updateDetails);
router.put('/updatepassword', protect, updatePasswordValidation, validationHandler, updatePassword);

// Delivery-specific routes
router.put('/toggle-availability', protect, authorize('delivery'), toggleAvailability);

module.exports = router;