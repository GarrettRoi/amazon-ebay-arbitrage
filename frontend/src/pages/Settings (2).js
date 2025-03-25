const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Please provide settings category'],
    enum: ['general', 'api', 'notification', 'system'],
    default: 'general'
  },
  key: {
    type: String,
    required: [true, 'Please provide settings key'],
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Please provide settings value']
  },
  description: {
    type: String
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index to ensure key uniqueness within a category
SettingsSchema.index({ category: 1, key: 1 }, { unique: true });

// Update the updatedAt field on save
SettingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Settings', SettingsSchema);
