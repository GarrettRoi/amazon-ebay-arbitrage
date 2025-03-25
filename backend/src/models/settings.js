const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  ebaySettings: {
    markupPercentage: {
      type: Number,
      default: 15
    },
    autoList: {
      type: Boolean,
      default: true
    },
    maxListingPrice: {
      type: Number,
      default: 200
    },
    minProfitMargin: {
      type: Number,
      default: 10
    }
  },
  amazonSettings: {
    useAmazonPrime: {
      type: Boolean,
      default: true
    },
    maxPurchasePrice: {
      type: Number,
      default: 150
    },
    preferredCategories: {
      type: [String],
      default: ['Electronics', 'Home & Kitchen', 'Toys & Games']
    }
  },
  systemSettings: {
    scanFrequencyMinutes: {
      type: Number,
      default: 60
    },
    orderCheckFrequencyMinutes: {
      type: Number,
      default: 30
    },
    enableNotifications: {
      type: Boolean,
      default: true
    },
    notificationEmail: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
SettingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Settings', SettingsSchema);
