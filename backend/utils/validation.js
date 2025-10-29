const { body } = require('express-validator');

// Register validation
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('role')
    .optional()
    .isIn(['customer', 'delivery', 'admin'])
    .withMessage('Role must be customer, delivery, or admin'),
  
  body('room')
    .if(body('role').not().equals('admin'))
    .notEmpty()
    .withMessage('Room is required for non-admin users'),
  
  body('phone')
    .if(body('role').not().equals('admin'))
    .matches(/^\d{10}$/)
    .withMessage('Phone number must be 10 digits'),
  
  body('gender')
    .if(body('role').not().equals('admin'))
    .isIn(['boys', 'girls'])
    .withMessage('Gender must be boys or girls'),
  
  body('year')
    .if(body('role').not().equals('admin'))
    .isInt({ min: 1, max: 4 })
    .withMessage('Year must be between 1 and 4'),
  
  body('hostel')
    .if(body('role').not().equals('admin'))
    .trim()
    .notEmpty()
    .withMessage('Hostel is required for non-admin users')
];

// Login validation
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  body('role')
    .optional()
    .isIn(['customer', 'delivery', 'admin'])
    .withMessage('Role must be customer, delivery, or admin')
];

// Update details validation
const updateDetailsValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('room')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Room cannot be empty'),
  
  body('phone')
    .optional()
    .matches(/^\d{10}$/)
    .withMessage('Phone number must be 10 digits'),
  
  body('hostel')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Hostel cannot be empty')
];

// Update password validation
const updatePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6, max: 128 })
    .withMessage('New password must be at least 6 characters long')
];

// Forgot password validation
const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

// Reset password validation
const resetPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be at least 6 characters long')
];

module.exports = {
  registerValidation,
  loginValidation,
  updateDetailsValidation,
  updatePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation
};