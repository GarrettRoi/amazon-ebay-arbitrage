const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Settings = sequelize.define('Settings', {
  ebaySettings: {
    type: DataTypes.JSON,
    defaultValue: {
      markupPercentage: 15,
      autoList: true,
      maxListingPrice: 200,
      minProfitMargin: 10
    }
  },
  amazonSettings: {
    type: DataTypes.JSON,
    defaultValue: {
      useAmazonPrime: true,
      maxPurchasePrice: 150,
      preferredCategories: ['Electronics', 'Home & Kitchen', 'Toys & Games']
    }
  },
  systemSettings: {
    type: DataTypes.JSON,
    defaultValue: {
      scanFrequencyMinutes: 60,
      orderCheckFrequencyMinutes: 30,
      enableNotifications: true,
      notificationEmail: null
    }
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  hooks: {
    beforeUpdate: (settings) => {
      settings.updatedAt = new Date();
    }
  }
});

module.exports = Settings;
