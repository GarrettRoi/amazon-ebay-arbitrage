#!/usr/bin/env node

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Setup logging
const logFile = path.join(logsDir, 'setup.log');
const logger = fs.createWriteStream(logFile, { flags: 'a' });

const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  logger.write(logMessage);
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    log(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Import models
const User = require('../backend/src/models/User');
const Settings = require('../backend/src/models/settings');
const System = require('../backend/src/models/system');

// Create admin user
const createAdminUser = async () => {
  try {
    // Check if admin user exists
    const adminExists = await User.findOne({ email: 'admin@example.com' });

    if (adminExists) {
      log('Admin user already exists');
      return;
    }

    // Create admin user
    await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    log('Admin user created');
  } catch (error) {
    log(`Error creating admin user: ${error.message}`);
  }
};

// Create default settings
const createDefaultSettings = async () => {
  try {
    // Check if settings exist
    const settingsExist = await Settings.findOne();

    if (settingsExist) {
      log('Settings already exist');
      return;
    }

    // Create default settings
    await Settings.create({
      ebaySettings: {
        markupPercentage: 15,
        autoList: true,
        maxListingPrice: 200,
        minProfitMargin: 10
      },
      amazonSettings: {
        useAmazonPrime: true,
        maxPurchasePrice: 150,
        preferredCategories: ['Electronics', 'Home & Kitchen', 'Toys & Games']
      },
      systemSettings: {
        scanFrequencyMinutes: 60,
        orderCheckFrequencyMinutes: 30,
        enableNotifications: true,
        notificationEmail: 'admin@example.com'
      }
    });

    log('Default settings created');
  } catch (error) {
    log(`Error creating default settings: ${error.message}`);
  }
};

// Create system status
const createSystemStatus = async () => {
  try {
    // Check if system status exists
    const systemExists = await System.findOne();

    if (systemExists) {
      log('System status already exists');
      return;
    }

    // Create system status
    await System.create({
      status: 'active',
      stats: {
        totalScans: 0,
        totalListings: 0,
        totalOrders: 0,
        totalProfit: 0
      }
    });

    log('System status created');
  } catch (error) {
    log(`Error creating system status: ${error.message}`);
  }
};

// Main setup function
const setup = async () => {
  log('Starting database setup...');
  
  // Connect to database
  await connectDB();
  
  // Create admin user
  await createAdminUser();
  
  // Create default settings
  await createDefaultSettings();
  
  // Create system status
  await createSystemStatus();
  
  log('Database setup completed successfully');
  
  // Close database connection
  mongoose.connection.close();
  process.exit(0);
};

// Run setup
setup();
