const express = require('express');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { upload, handleMulterError, deleteFile, getFileUrl } = require('../utils/fileUpload');
const { uploadLimiter } = require('../middleware/rateLimiting');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();

// @desc    Upload avatar
// @route   POST /api/uploads/avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  const user = await User.findById(req.user.id);
  
  // Delete old avatar if exists
  if (user.avatar) {
    const oldAvatarPath = path.join(__dirname, '../uploads/avatars', path.basename(user.avatar));
    deleteFile(oldAvatarPath);
  }

  // Update user avatar
  user.avatar = getFileUrl(req.file.filename, 'avatars');
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: {
      avatar: user.avatar
    }
  });
});

// @desc    Upload order attachment
// @route   POST /api/uploads/attachment
// @access  Private
const uploadAttachment = asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded'
    });
  }

  const attachments = req.files.map(file => ({
    filename: file.filename,
    originalName: file.originalname,
    url: getFileUrl(file.filename, 'attachments'),
    size: file.size,
    mimeType: file.mimetype
  }));

  res.status(200).json({
    success: true,
    message: 'Files uploaded successfully',
    data: {
      attachments
    }
  });
});

// @desc    Serve uploaded files
// @route   GET /api/uploads/:type/:filename
// @access  Public (but could be protected if needed)
const serveFile = (req, res) => {
  const { type, filename } = req.params;
  const allowedTypes = ['avatars', 'attachments'];
  
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type'
    });
  }

  const filePath = path.join(__dirname, '../uploads', type, filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }

  // Set appropriate headers
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
  res.sendFile(filePath);
};

// @desc    Delete file
// @route   DELETE /api/uploads/:type/:filename
// @access  Private
const deleteUploadedFile = asyncHandler(async (req, res, next) => {
  const { type, filename } = req.params;
  const allowedTypes = ['avatars', 'attachments'];
  
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type'
    });
  }

  const filePath = path.join(__dirname, '../uploads', type, filename);
  
  // For avatar deletion, check if it's the user's avatar
  if (type === 'avatars') {
    const user = await User.findById(req.user.id);
    const userAvatarFilename = user.avatar ? path.basename(user.avatar) : null;
    
    if (userAvatarFilename !== filename) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this file'
      });
    }

    // Remove avatar from user record
    user.avatar = null;
    await user.save();
  }

  // Delete the file
  const deleted = deleteFile(filePath);
  
  if (deleted) {
    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }
});

// Routes
router.post('/avatar', protect, uploadLimiter, upload.single('avatar'), handleMulterError, uploadAvatar);
router.post('/attachment', protect, uploadLimiter, upload.array('attachment', 5), handleMulterError, uploadAttachment);
router.get('/:type/:filename', serveFile);
router.delete('/:type/:filename', protect, deleteUploadedFile);

module.exports = router;