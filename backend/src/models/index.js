const { sequelize } = require('./config/database');
const User = require('./models/User.model');
const Product = require('./models/Product.model');
const Order = require('./models/Order.model');
const Settings = require('./models/Settings.model');
const System = require('./models/System.model');

// Define associations
User.hasMany(Product, { foreignKey: 'userId' });
Product.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(Order, { foreignKey: 'productId' });
Order.belongsTo(Product, { foreignKey: 'productId' });

// Initialize models
const initializeModels = async () => {
  try {
    // Sync all models with database
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized');
    
    // Create default settings if none exist
    const settingsCount = await Settings.count();
    if (settingsCount === 0) {
      await Settings.create({});
      console.log('Default settings created');
    }
    
    // Create system record if none exists
    const systemCount = await System.count();
    if (systemCount === 0) {
      await System.create({});
      console.log('System record created');
    }
    
    console.log('Database initialization complete');
  } catch (error) {
    console.error(`Database initialization error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = {
  User,
  Product,
  Order,
  Settings,
  System,
  initializeModels
};
