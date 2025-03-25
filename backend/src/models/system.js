const mongoose = require('mongoose');

const SystemSchema = new mongoose.Schema({
  lastScan: {
    type: Date
  },
  lastOrderCheck: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'error'],
    default: 'active'
  },
  errorLog: [{
    message: String,
    stack: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  stats: {
    totalScans: {
      type: Number,
      default: 0
    },
    totalListings: {
      type: Number,
      default: 0
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    totalProfit: {
      type: Number,
      default: 0
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
SystemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('System', SystemSchema);
