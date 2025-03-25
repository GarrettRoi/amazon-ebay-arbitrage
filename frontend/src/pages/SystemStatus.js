const mongoose = require('mongoose');

const SystemStatusSchema = new mongoose.Schema({
  componentName: {
    type: String,
    required: [true, 'Please provide component name'],
    trim: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['OK', 'Warning', 'Error'],
    default: 'OK'
  },
  uptime: {
    type: String,
    default: '100%'
  },
  lastCheck: {
    type: Date,
    default: Date.now
  },
  details: {
    type: String
  },
  metrics: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
});

module.exports = mongoose.model('SystemStatus', SystemStatusSchema);
