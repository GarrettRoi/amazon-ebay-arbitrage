const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  amazonProductId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Please add an Amazon product ID' }
    }
  },
  ebayListingId: {
    type: DataTypes.STRING,
    unique: true
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please add a title' },
      len: { args: [1, 100], msg: 'Title cannot be more than 100 characters' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    validate: {
      len: { args: [0, 5000], msg: 'Description cannot be more than 5000 characters' }
    }
  },
  category: {
    type: DataTypes.STRING
  },
  amazonPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please add Amazon price' }
    }
  },
  ebayPrice: {
    type: DataTypes.DECIMAL(10, 2)
  },
  profit: {
    type: DataTypes.DECIMAL(10, 2)
  },
  roi: {
    type: DataTypes.DECIMAL(10, 2)
  },
  status: {
    type: DataTypes.ENUM('pending', 'listed', 'sold', 'error'),
    defaultValue: 'pending'
  },
  imageUrl: {
    type: DataTypes.STRING
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
    beforeUpdate: (product) => {
      product.updatedAt = new Date();
    }
  }
});

module.exports = Product;
