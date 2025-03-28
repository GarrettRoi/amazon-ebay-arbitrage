const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  ebayOrderId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Please add an eBay order ID' }
    }
  },
  amazonOrderId: {
    type: DataTypes.STRING,
    unique: true
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id'
    }
  },
  buyerName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please add a buyer name' }
    }
  },
  buyerEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please add a buyer email' },
      isEmail: { msg: 'Please add a valid email' }
    }
  },
  shippingAddress: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  orderTotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please add order total' }
    }
  },
  orderStatus: {
    type: DataTypes.ENUM('received', 'processing', 'ordered', 'shipped', 'delivered', 'cancelled', 'refunded'),
    defaultValue: 'received'
  },
  trackingNumber: {
    type: DataTypes.STRING
  },
  carrier: {
    type: DataTypes.STRING
  },
  fulfillmentStatus: {
    type: DataTypes.ENUM('pending', 'fulfilled', 'failed'),
    defaultValue: 'pending'
  },
  profit: {
    type: DataTypes.DECIMAL(10, 2)
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  hooks: {
    beforeUpdate: (order) => {
      order.updatedAt = new Date();
    }
  }
});

module.exports = Order;
