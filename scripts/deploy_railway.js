#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Setup logging
const logFile = path.join(logsDir, 'deploy.log');
const logger = fs.createWriteStream(logFile, { flags: 'a' });

const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  logger.write(logMessage);
};

// Deploy to Railway
const deployToRailway = async () => {
  log('Starting deployment to Railway...');
  
  // Check if Railway CLI is installed
  const checkRailway = spawn('railway', ['--version']);
  
  checkRailway.on('error', (error) => {
    log(`Error: Railway CLI not found. Please install it with: npm install -g @railway/cli`);
    process.exit(1);
  });
  
  checkRailway.stdout.on('data', (data) => {
    log(`Railway CLI version: ${data.toString().trim()}`);
    
    // Login to Railway (in a real scenario, this would be done manually or via CI/CD)
    log('Please login to Railway manually using: railway login');
    
    // Create a new project (if needed)
    log('To create a new Railway project, run: railway init');
    
    // Deploy the application
    log('To deploy the application, run: railway up');
    
    // Set environment variables
    log('Make sure to set all environment variables in the Railway dashboard:');
    log('- NODE_ENV=production');
    log('- JWT_SECRET=your_jwt_secret_key_here');
    log('- JWT_EXPIRE=30d');
    log('- JWT_COOKIE_EXPIRE=30');
    log('- MONGODB_URI=your_mongodb_atlas_uri');
    log('- EBAY_APP_ID=your_ebay_app_id');
    log('- EBAY_CERT_ID=your_ebay_cert_id');
    log('- EBAY_DEV_ID=your_ebay_dev_id');
    log('- EBAY_AUTH_TOKEN=your_ebay_auth_token');
    log('- AMAZON_ACCESS_KEY=your_amazon_access_key');
    log('- AMAZON_SECRET_KEY=your_amazon_secret_key');
    log('- AMAZON_ASSOCIATE_TAG=your_amazon_associate_tag');
  });
};

// Main deploy function
const deploy = async () => {
  log('Starting deployment process...');
  
  // Build frontend
  log('Building frontend...');
  const buildFrontend = spawn('npm', ['run', 'build'], { 
    cwd: path.join(__dirname, '../frontend'),
    shell: true
  });
  
  buildFrontend.stdout.on('data', (data) => {
    log(`Frontend build: ${data.toString().trim()}`);
  });
  
  buildFrontend.stderr.on('data', (data) => {
    log(`Frontend build error: ${data.toString().trim()}`);
  });
  
  buildFrontend.on('close', (code) => {
    if (code !== 0) {
      log(`Frontend build failed with code ${code}`);
      process.exit(1);
    }
    
    log('Frontend build completed successfully');
    
    // Deploy to Railway
    deployToRailway();
  });
};

// Run deployment
deploy();
