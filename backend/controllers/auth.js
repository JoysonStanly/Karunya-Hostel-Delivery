const User = require('../models/User');
const { sendTokenResponse } = require('../utils/auth');
const { asyncHandler } = require('../middleware/error');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const {
    name,
    email,
    password,
    role,
    room,
    phone,
    gender,
    year,
    hostel
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Create user
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: role || 'customer',
    room: role === 'admin' ? undefined : room,
    phone: role === 'admin' ? undefined : phone,
    gender: role === 'admin' ? undefined : gender,
    year: role === 'admin' ? undefined : year,
    hostel: role === 'admin' ? undefined : hostel
  });

  // Send token response
  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password, role } = req.body;

  // Validate email & password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an email and password'
    });
  }

  // Check for user and include password
  const user = await User.findOne({ 
    email: email.toLowerCase(),
    ...(role && { role }) // Filter by role if provided
  }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check account status
  if (!user.isActive || user.accountStatus !== 'active') {
    return res.status(401).json({
      success: false,
      message: 'Account is suspended or inactive'
    });
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Send token response
  sendTokenResponse(user, 200, res);
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user.getPublicProfile()
  });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
const updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };

  // Only allow non-admin users to update these fields
  if (req.user.role !== 'admin') {
    if (req.body.room) fieldsToUpdate.room = req.body.room;
    if (req.body.phone) fieldsToUpdate.phone = req.body.phone;
    if (req.body.hostel) fieldsToUpdate.hostel = req.body.hostel;
  }

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user.getPublicProfile()
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.comparePassword(req.body.currentPassword))) {
    return res.status(401).json({
      success: false,
      message: 'Password is incorrect'
    });
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'There is no user with that email'
    });
  }

  // For demo purposes, we'll just return a success message
  // In production, you would generate a reset token and send an email
  res.status(200).json({
    success: true,
    message: 'Password reset email sent (demo mode - check console for reset link)'
  });
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  // For demo purposes, this is simplified
  // In production, you would verify the reset token
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid reset token'
    });
  }

  // Set new password
  user.password = req.body.password;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Toggle delivery availability (delivery users only)
// @route   PUT /api/auth/toggle-availability
// @access  Private (delivery role only)
const toggleAvailability = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'delivery') {
    return res.status(403).json({
      success: false,
      message: 'Only delivery students can toggle availability'
    });
  }

  const user = await User.findById(req.user.id);
  user.deliveryStats.isAvailable = !user.deliveryStats.isAvailable;
  await user.save();

  res.status(200).json({
    success: true,
    data: {
      isAvailable: user.deliveryStats.isAvailable
    },
    message: `Availability ${user.deliveryStats.isAvailable ? 'enabled' : 'disabled'}`
  });
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  toggleAvailability
};