const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const System = sequelize.define('System', {
  lastScan: {
    type: DataTypes.DATE
  },
  lastOrderCheck: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.ENUM('active', 'paused', 'error'),
    defaultValue: 'active'
  },
  errorLog: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  stats: {
    type: DataTypes.JSON,
    defaultValue: {
      totalScans: 0,
      totalListings: 0,
      totalOrders: 0,
      totalProfit: 0
    }
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  hooks: {
    beforeUpdate: (system) => {
      system.updatedAt = new Date();
    }
  }
});

module.exports = System;
