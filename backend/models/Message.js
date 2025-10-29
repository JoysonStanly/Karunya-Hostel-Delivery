const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order is required']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required']
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'location', 'system'],
    default: 'text'
  },
  // File/Image specific fields
  attachment: {
    filename: String,
    url: String,
    fileSize: Number,
    mimeType: String
  },
  // Location specific fields
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    address: String
  },
  // Message status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date,
    default: Date.now
  },
  // System message fields
  systemMessageType: {
    type: String,
    enum: [
      'order-accepted',
      'order-picked-up',
      'order-in-transit',
      'order-delivered',
      'order-cancelled',
      'delivery-delayed',
      'location-update'
    ]
  },
  // Message metadata
  editedAt: {
    type: Date
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  // Moderation
  isFlagged: {
    type: Boolean,
    default: false
  },
  flagReason: {
    type: String,
    enum: ['spam', 'inappropriate', 'harassment', 'other']
  },
  isModerated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
messageSchema.index({ order: 1, createdAt: 1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ order: 1, isRead: 1 });
messageSchema.index({ order: 1, type: 1 });

// Pre-save middleware
messageSchema.pre('save', function(next) {
  if (this.isNew) {
    this.isDelivered = true;
    this.deliveredAt = new Date();
  }
  next();
});

// Method to mark message as read
messageSchema.methods.markAsRead = function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
  }
};

// Method to edit message content
messageSchema.methods.edit = function(newContent) {
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
};

// Method to flag message
messageSchema.methods.flag = function(reason) {
  this.isFlagged = true;
  this.flagReason = reason;
};

// Static method to create system message
messageSchema.statics.createSystemMessage = function(orderId, senderId, type, content) {
  return this.create({
    order: orderId,
    sender: senderId,
    content,
    type: 'system',
    systemMessageType: type,
    isRead: false
  });
};

// Static method to get unread count for user in order
messageSchema.statics.getUnreadCount = function(orderId, userId) {
  return this.countDocuments({
    order: orderId,
    sender: { $ne: userId },
    isRead: false
  });
};

// Static method to mark all messages as read for user in order
messageSchema.statics.markAllAsRead = function(orderId, userId) {
  return this.updateMany(
    {
      order: orderId,
      sender: { $ne: userId },
      isRead: false
    },
    {
      $set: {
        isRead: true,
        readAt: new Date()
      }
    }
  );
};

// Static method to get conversation between users for an order
messageSchema.statics.getConversation = function(orderId, limit = 50, page = 1) {
  const skip = (page - 1) * limit;
  
  return this.find({ order: orderId })
    .populate('sender', 'name role avatar')
    .populate('replyTo', 'content sender type')
    .sort({ createdAt: 1 })
    .limit(limit)
    .skip(skip);
};

// Virtual for formatted timestamp
messageSchema.virtual('formattedTime').get(function() {
  return this.createdAt.toLocaleTimeString();
});

// Virtual for formatted date
messageSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString();
});

module.exports = mongoose.model('Message', messageSchema);