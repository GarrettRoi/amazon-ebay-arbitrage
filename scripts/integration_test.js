#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Setup logging
const logFile = path.join(logsDir, 'integration_test.log');
const logger = fs.createWriteStream(logFile, { flags: 'a' });

const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  logger.write(logMessage);
};

// Run a command and return a promise
const runCommand = (command, cwd = process.cwd()) => {
  return new Promise((resolve, reject) => {
    log(`Running command: ${command}`);
    
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        log(`Error: ${error.message}`);
        log(`stderr: ${stderr}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        log(`stderr: ${stderr}`);
      }
      
      log(`stdout: ${stdout}`);
      resolve(stdout);
    });
  });
};

// Test the entire system end-to-end
const runIntegrationTest = async () => {
  log('Starting integration test...');
  
  try {
    // 1. Start the backend server
    log('Starting backend server...');
    const serverProcess = exec('node ../backend/src/server.js', {
      env: { ...process.env, NODE_ENV: 'test', PORT: '5001' }
    });
    
    let serverPid = serverProcess.pid;
    log(`Server started with PID: ${serverPid}`);
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 2. Test the API endpoints
    log('Testing API endpoints...');
    
    try {
      // Install axios if not already installed
      await runCommand('npm install axios --no-save');
      
      const axios = require('axios');
      const baseURL = 'http://localhost:5001/api/v1';
      
      // Register a test user
      log('Testing user registration...');
      const registerRes = await axios.post(`${baseURL}/auth/register`, {
        name: 'Integration Test User',
        email: 'integration@test.com',
        password: 'password123'
      });
      
      if (registerRes.data.success) {
        log('User registration successful');
        
        // Login with the test user
        log('Testing user login...');
        const loginRes = await axios.post(`${baseURL}/auth/login`, {
          email: 'integration@test.com',
          password: 'password123'
        });
        
        if (loginRes.data.success) {
          log('User login successful');
          
          // Set token for authenticated requests
          const token = loginRes.data.token;
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Test authenticated endpoints
          log('Testing authenticated endpoints...');
          
          // Get current user
          const meRes = await axios.get(`${baseURL}/auth/me`);
          log(`Get current user: ${meRes.data.success ? 'Success' : 'Failed'}`);
          
          // Get products
          const productsRes = await axios.get(`${baseURL}/products`);
          log(`Get products: ${productsRes.data.success ? 'Success' : 'Failed'}`);
          
          // Get settings
          const settingsRes = await axios.get(`${baseURL}/settings`);
          log(`Get settings: ${settingsRes.data.success ? 'Success' : 'Failed'}`);
          
          // Get system status
          const systemRes = await axios.get(`${baseURL}/system/status`);
          log(`Get system status: ${systemRes.data.success ? 'Success' : 'Failed'}`);
          
          // Test arbitrage functionality
          log('Testing arbitrage functionality...');
          
          // Check profitability
          const profitabilityRes = await axios.post(`${baseURL}/arbitrage/check-profitability`, {
            amazonPrice: 50
          });
          log(`Check profitability: ${profitabilityRes.data.success ? 'Success' : 'Failed'}`);
          
          // Get arbitrage stats
          const statsRes = await axios.get(`${baseURL}/arbitrage/stats`);
          log(`Get arbitrage stats: ${statsRes.data.success ? 'Success' : 'Failed'}`);
          
          // Logout
          log('Testing user logout...');
          const logoutRes = await axios.get(`${baseURL}/auth/logout`);
          log(`User logout: ${logoutRes.data.success ? 'Success' : 'Failed'}`);
        } else {
          log('User login failed');
        }
      } else {
        log('User registration failed');
      }
    } catch (error) {
      log(`API test error: ${error.message}`);
      if (error.response) {
        log(`Status: ${error.response.status}`);
        log(`Data: ${JSON.stringify(error.response.data)}`);
      }
    }
    
    // 3. Kill the server process
    log('Stopping backend server...');
    process.kill(serverPid);
    
    // 4. Test Python scripts
    log('Testing Python scripts...');
    
    try {
      // Test product_finder.py
      log('Testing product_finder.py...');
      await runCommand('python3 product_finder.py --test', __dirname);
      
      // Test ebay_lister.py
      log('Testing ebay_lister.py...');
      await runCommand('python3 ebay_lister.py --test', __dirname);
      
      // Test order_fulfiller.py
      log('Testing order_fulfiller.py...');
      await runCommand('python3 order_fulfiller.py --test', __dirname);
    } catch (error) {
      log(`Python script test error: ${error.message}`);
    }
    
    log('Integration test completed');
  } catch (error) {
    log(`Integration test error: ${error.message}`);
  }
};

// Run the integration test
runIntegrationTest();
