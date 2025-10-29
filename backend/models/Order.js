const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Order title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  type: {
    type: String,
    enum: ['parcel', 'food'],
    required: [true, 'Order type is required']
  },
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative']
  },
  from: {
    type: String,
    required: [true, 'Pickup location is required'],
    trim: true
  },
  room: {
    type: String,
    required: [true, 'Delivery room is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer is required']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'picked-up', 'in-transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  // Timing fields
  estimatedDeliveryTime: {
    type: Date
  },
  acceptedAt: {
    type: Date
  },
  pickedUpAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  // Location tracking
  pickupLocation: {
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
  deliveryLocation: {
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
  // Additional details
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  specialInstructions: {
    type: String,
    maxlength: [300, 'Special instructions cannot exceed 300 characters']
  },
  // Payment and ratings
  deliveryFee: {
    type: Number,
    default: 15 // Default delivery fee
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  // OTP for delivery verification
  deliveryOTP: {
    type: String,
    default: null
  },
  otpGeneratedAt: {
    type: Date,
    default: null
  },
  customerRating: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    ratedAt: Date
  },
  deliveryRating: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    ratedAt: Date
  },
  // System fields
  cancelReason: {
    type: String,
    trim: true
  },
  adminNotes: {
    type: String,
    trim: true
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  notificationsSent: {
    orderCreated: { type: Boolean, default: false },
    orderAccepted: { type: Boolean, default: false },
    orderPickedUp: { type: Boolean, default: false },
    orderDelivered: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ assignedTo: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ type: 1, status: 1 });
orderSchema.index({ 'pickupLocation': '2dsphere' });
orderSchema.index({ 'deliveryLocation': '2dsphere' });

// Pre-save middleware to set delivery fee based on type
orderSchema.pre('save', function(next) {
  if (this.isNew && this.price === 0) {
    // Set default delivery fees
    this.deliveryFee = this.type === 'food' ? 20 : 15;
  }
  next();
});

// Method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
  return ['pending', 'accepted'].includes(this.status);
};

// Method to check if order can be accepted
orderSchema.methods.canBeAccepted = function() {
  return this.status === 'pending';
};

// Method to update status with timestamp
orderSchema.methods.updateStatus = function(newStatus, userId = null) {
  this.status = newStatus;
  
  switch (newStatus) {
    case 'accepted':
      this.acceptedAt = new Date();
      this.assignedTo = userId;
      // Generate OTP when order is accepted
      this.deliveryOTP = this.generateOTP();
      this.otpGeneratedAt = new Date();
      break;
    case 'picked-up':
      this.pickedUpAt = new Date();
      break;
    case 'delivered':
      this.deliveredAt = new Date();
      this.paymentStatus = 'paid';
      // Clear OTP after delivery
      this.deliveryOTP = null;
      this.otpGeneratedAt = null;
      break;
    case 'cancelled':
      this.assignedTo = null;
      // Clear OTP if order is cancelled
      this.deliveryOTP = null;
      this.otpGeneratedAt = null;
      break;
  }
};

// Method to generate 4-digit OTP
orderSchema.methods.generateOTP = function() {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Method to verify OTP
orderSchema.methods.verifyOTP = function(otp) {
  if (!this.deliveryOTP) {
    return { valid: false, message: 'No OTP generated for this order' };
  }
  
  // Check if OTP is expired (valid for 24 hours)
  const otpAge = Date.now() - this.otpGeneratedAt;
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  if (otpAge > maxAge) {
    return { valid: false, message: 'OTP has expired' };
  }
  
  if (this.deliveryOTP === otp.toString()) {
    return { valid: true, message: 'OTP verified successfully' };
  }
  
  return { valid: false, message: 'Invalid OTP' };
};

// Calculate order duration
orderSchema.methods.getDuration = function() {
  if (!this.deliveredAt || !this.acceptedAt) return null;
  return Math.round((this.deliveredAt - this.acceptedAt) / (1000 * 60)); // in minutes
};

// Get order timeline
orderSchema.methods.getTimeline = function() {
  const timeline = [];
  
  timeline.push({
    status: 'pending',
    timestamp: this.createdAt,
    message: 'Order created'
  });
  
  if (this.acceptedAt) {
    timeline.push({
      status: 'accepted',
      timestamp: this.acceptedAt,
      message: 'Order accepted by delivery student'
    });
  }
  
  if (this.pickedUpAt) {
    timeline.push({
      status: 'picked-up',
      timestamp: this.pickedUpAt,
      message: 'Order picked up'
    });
  }
  
  if (this.deliveredAt) {
    timeline.push({
      status: 'delivered',
      timestamp: this.deliveredAt,
      message: 'Order delivered successfully'
    });
  }
  
  return timeline;
};

module.exports = mongoose.model('Order', orderSchema);