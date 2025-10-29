const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Can be null for system notifications
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: [
      'order-created',
      'order-accepted',
      'order-picked-up',
      'order-delivered',
      'order-cancelled',
      'new-message',
      'report-submitted',
      'report-resolved',
      'rating-received',
      'payment-received',
      'system-announcement',
      'account-warning',
      'account-suspended'
    ]
  },
  category: {
    type: String,
    enum: ['order', 'message', 'report', 'payment', 'system', 'account'],
    default: 'system'
  },
  // Related entities
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  relatedReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    default: null
  },
  relatedMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  // Notification status
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
    type: Date
  },
  // Delivery methods
  deliveryMethods: {
    inApp: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: false
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: false
    }
  },
  // Priority and scheduling
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  scheduledFor: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Default expiry is 30 days from creation
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  },
  // Action buttons (for interactive notifications)
  actions: [{
    label: String,
    action: String,
    url: String,
    style: {
      type: String,
      enum: ['primary', 'secondary', 'danger'],
      default: 'primary'
    }
  }],
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Tracking
  clickedAt: {
    type: Date
  },
  actionTaken: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ relatedOrder: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware to set category based on type
notificationSchema.pre('save', function(next) {
  if (this.isNew) {
    // Set category based on type
    const typeToCategory = {
      'order-created': 'order',
      'order-accepted': 'order',
      'order-picked-up': 'order',
      'order-delivered': 'order',
      'order-cancelled': 'order',
      'new-message': 'message',
      'report-submitted': 'report',
      'report-resolved': 'report',
      'rating-received': 'order',
      'payment-received': 'payment',
      'system-announcement': 'system',
      'account-warning': 'account',
      'account-suspended': 'account'
    };
    
    this.category = typeToCategory[this.type] || 'system';
    
    // Set delivery methods based on type and priority
    if (this.priority === 'urgent' || this.priority === 'high') {
      this.deliveryMethods.email = true;
      this.deliveryMethods.push = true;
    }
    
    if (this.type.includes('account-')) {
      this.deliveryMethods.email = true;
    }
  }
  next();
});

// Method to mark notification as read
notificationSchema.methods.markAsRead = function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
  }
};

// Method to mark notification as delivered
notificationSchema.methods.markAsDelivered = function() {
  if (!this.isDelivered) {
    this.isDelivered = true;
    this.deliveredAt = new Date();
  }
};

// Method to mark notification as clicked
notificationSchema.methods.markAsClicked = function(action = null) {
  this.clickedAt = new Date();
  if (action) {
    this.actionTaken = action;
  }
  if (!this.isRead) {
    this.markAsRead();
  }
};

// Static method to create order notification
notificationSchema.statics.createOrderNotification = function(type, recipient, orderId, customMessage = null) {
  const typeMessages = {
    'order-created': 'New delivery request created',
    'order-accepted': 'Your order has been accepted by a delivery student',
    'order-picked-up': 'Your order has been picked up',
    'order-delivered': 'Your order has been delivered successfully',
    'order-cancelled': 'Your order has been cancelled'
  };
  
  return this.create({
    recipient,
    title: typeMessages[type] || 'Order Update',
    message: customMessage || typeMessages[type] || 'Order status updated',
    type,
    relatedOrder: orderId,
    priority: type === 'order-delivered' ? 'high' : 'normal'
  });
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false,
    expiresAt: { $gt: new Date() }
  });
};

// Static method to mark all as read for user
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    {
      recipient: userId,
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

// Static method to cleanup expired notifications
notificationSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

// Virtual for checking if notification is expired
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date();
});

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
});

module.exports = mongoose.model('Notification', notificationSchema);