#!/bin/bash

# Amazon to eBay Arbitrage System Deployment Script
# This script automates the deployment of the Amazon to eBay Arbitrage System to Railway.com

echo "=== Amazon to eBay Arbitrage System Deployment ==="
echo "This script will deploy your system to Railway.com"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "Railway CLI not found. Installing..."
    npm install -g @railway/cli
else
    echo "Railway CLI already installed."
fi

# Login to Railway
echo "Logging in to Railway..."
echo "A browser window will open. Please complete the authentication process."
railway login

# Initialize Railway project
echo "Initializing Railway project..."
railway init

# Set environment variables
echo "Setting up environment variables..."
echo "Please enter the following information:"

read -p "MongoDB URI: " mongodb_uri
read -p "JWT Secret: " jwt_secret
read -p "eBay App ID: " ebay_app_id
read -p "eBay Cert ID: " ebay_cert_id
read -p "eBay Dev ID: " ebay_dev_id
read -p "eBay Auth Token: " ebay_auth_token
read -p "Amazon Access Key: " amazon_access_key
read -p "Amazon Secret Key: " amazon_secret_key
read -p "Amazon Associate Tag: " amazon_associate_tag

echo "Setting environment variables in Railway..."
railway variables set MONGODB_URI=$mongodb_uri
railway variables set JWT_SECRET=$jwt_secret
railway variables set JWT_EXPIRE=30d
railway variables set JWT_COOKIE_EXPIRE=30
railway variables set EBAY_APP_ID=$ebay_app_id
railway variables set EBAY_CERT_ID=$ebay_cert_id
railway variables set EBAY_DEV_ID=$ebay_dev_id
railway variables set EBAY_AUTH_TOKEN=$ebay_auth_token
railway variables set AMAZON_ACCESS_KEY=$amazon_access_key
railway variables set AMAZON_SECRET_KEY=$amazon_secret_key
railway variables set AMAZON_ASSOCIATE_TAG=$amazon_associate_tag
railway variables set NODE_ENV=production

# Deploy the application
echo "Deploying application to Railway..."
railway up

echo "Deployment complete!"
echo "Your Amazon to eBay Arbitrage System is now deployed to Railway.com"
echo "You can access your project in the Railway dashboard to find the URL."
