#!/usr/bin/env node

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Setup logging
const logFile = path.join(logsDir, 'test.log');
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

// Test database connection
const testDatabase = async () => {
  log('Testing database connection...');
  
  try {
    await connectDB();
    log('Database connection successful');
    
    // Test models
    const User = require('../backend/src/models/User');
    const Product = require('../backend/src/models/products');
    const Order = require('../backend/src/models/orders');
    const Settings = require('../backend/src/models/settings');
    const System = require('../backend/src/models/system');
    
    log('Models loaded successfully');
    
    // Check if admin user exists
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    log(`Admin user exists: ${!!adminUser}`);
    
    // Check if settings exist
    const settings = await Settings.findOne();
    log(`Settings exist: ${!!settings}`);
    
    // Check if system status exists
    const system = await System.findOne();
    log(`System status exists: ${!!system}`);
    
    log('Database tests completed successfully');
    
    // Close database connection
    mongoose.connection.close();
    
    return true;
  } catch (error) {
    log(`Database test failed: ${error.message}`);
    return false;
  }
};

// Test API endpoints
const testAPI = async () => {
  log('Testing API endpoints...');
  
  // Start the server
  const server = spawn('node', ['../backend/src/server.js'], {
    env: { ...process.env, NODE_ENV: 'test', PORT: '5001' },
    detached: true
  });
  
  let serverStarted = false;
  
  server.stdout.on('data', (data) => {
    log(`Server: ${data.toString().trim()}`);
    if (data.toString().includes('Server running')) {
      serverStarted = true;
      
      // Wait a bit for server to fully initialize
      setTimeout(() => {
        // Test API endpoints using axios
        const axios = require('axios');
        const baseURL = 'http://localhost:5001/api/v1';
        
        // Test endpoints
        const testEndpoints = async () => {
          try {
            // Test auth endpoints
            log('Testing auth endpoints...');
            try {
              await axios.post(`${baseURL}/auth/register`, {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
              });
              log('Register endpoint working');
            } catch (error) {
              log(`Register endpoint error: ${error.message}`);
            }
            
            try {
              const loginRes = await axios.post(`${baseURL}/auth/login`, {
                email: 'test@example.com',
                password: 'password123'
              });
              const token = loginRes.data.token;
              log('Login endpoint working');
              
              // Test protected endpoints with token
              const config = {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              };
              
              try {
                await axios.get(`${baseURL}/auth/me`, config);
                log('Auth/me endpoint working');
              } catch (error) {
                log(`Auth/me endpoint error: ${error.message}`);
              }
              
              // Test products endpoint
              try {
                await axios.get(`${baseURL}/products`, config);
                log('Products endpoint working');
              } catch (error) {
                log(`Products endpoint error: ${error.message}`);
              }
              
              // Test orders endpoint
              try {
                await axios.get(`${baseURL}/orders`, config);
                log('Orders endpoint working');
              } catch (error) {
                log(`Orders endpoint error: ${error.message}`);
              }
              
              // Test settings endpoint
              try {
                await axios.get(`${baseURL}/settings`, config);
                log('Settings endpoint working');
              } catch (error) {
                log(`Settings endpoint error: ${error.message}`);
              }
              
              // Test system endpoint
              try {
                await axios.get(`${baseURL}/system/status`, config);
                log('System status endpoint working');
              } catch (error) {
                log(`System status endpoint error: ${error.message}`);
              }
              
            } catch (error) {
              log(`Login endpoint error: ${error.message}`);
            }
            
            log('API tests completed');
            
            // Kill the server
            process.kill(-server.pid);
            process.exit(0);
          } catch (error) {
            log(`API test error: ${error.message}`);
            process.kill(-server.pid);
            process.exit(1);
          }
        };
        
        testEndpoints();
      }, 3000);
    }
  });
  
  server.stderr.on('data', (data) => {
    log(`Server error: ${data.toString().trim()}`);
  });
  
  // Set a timeout in case server doesn't start
  setTimeout(() => {
    if (!serverStarted) {
      log('Server failed to start within timeout period');
      process.kill(-server.pid);
      process.exit(1);
    }
  }, 10000);
};

// Test Python scripts
const testPythonScripts = async () => {
  log('Testing Python scripts...');
  
  // Test product_finder.py
  try {
    const productFinder = spawn('python3', ['../scripts/product_finder.py', '--test']);
    
    productFinder.stdout.on('data', (data) => {
      log(`product_finder.py: ${data.toString().trim()}`);
    });
    
    productFinder.stderr.on('data', (data) => {
      log(`product_finder.py error: ${data.toString().trim()}`);
    });
    
    productFinder.on('close', (code) => {
      log(`product_finder.py exited with code ${code}`);
    });
  } catch (error) {
    log(`Error testing product_finder.py: ${error.message}`);
  }
  
  // Test ebay_lister.py
  try {
    const ebayLister = spawn('python3', ['../scripts/ebay_lister.py', '--test']);
    
    ebayLister.stdout.on('data', (data) => {
      log(`ebay_lister.py: ${data.toString().trim()}`);
    });
    
    ebayLister.stderr.on('data', (data) => {
      log(`ebay_lister.py error: ${data.toString().trim()}`);
    });
    
    ebayLister.on('close', (code) => {
      log(`ebay_lister.py exited with code ${code}`);
    });
  } catch (error) {
    log(`Error testing ebay_lister.py: ${error.message}`);
  }
  
  // Test order_fulfiller.py
  try {
    const orderFulfiller = spawn('python3', ['../scripts/order_fulfiller.py', '--test']);
    
    orderFulfiller.stdout.on('data', (data) => {
      log(`order_fulfiller.py: ${data.toString().trim()}`);
    });
    
    orderFulfiller.stderr.on('data', (data) => {
      log(`order_fulfiller.py error: ${data.toString().trim()}`);
    });
    
    orderFulfiller.on('close', (code) => {
      log(`order_fulfiller.py exited with code ${code}`);
    });
  } catch (error) {
    log(`Error testing order_fulfiller.py: ${error.message}`);
  }
};

// Main test function
const runTests = async () => {
  log('Starting system tests...');
  
  // Test database
  const dbTestResult = await testDatabase();
  
  if (!dbTestResult) {
    log('Database tests failed, aborting further tests');
    process.exit(1);
  }
  
  // Test API endpoints
  await testAPI();
  
  // Test Python scripts
  await testPythonScripts();
  
  log('All tests completed');
};

// Run tests
runTests();
