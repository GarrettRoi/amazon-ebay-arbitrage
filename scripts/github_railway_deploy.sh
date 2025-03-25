#!/bin/bash

# Amazon to eBay Arbitrage System GitHub + Railway Deployment Script
# This script automates the setup of GitHub repository and Railway deployment

echo "=== Amazon to eBay Arbitrage System GitHub + Railway Deployment ==="
echo "This script will set up a GitHub repository and connect it to Railway for automatic deployment"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git not found. Please install git and try again."
    exit 1
else
    echo "Git is installed."
fi

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "Railway CLI not found. Installing..."
    npm install -g @railway/cli
else
    echo "Railway CLI already installed."
fi

# Initialize git repository
echo "Initializing git repository..."
git init
git add .
git commit -m "Initial commit of Amazon to eBay Arbitrage System"

# Connect to GitHub
echo "Connecting to GitHub..."
echo "Please enter your GitHub information:"
read -p "GitHub Username: " github_username
read -p "GitHub Repository Name (e.g., amazon-ebay-arbitrage): " github_repo

# Create GitHub repository (requires GitHub CLI or you can create manually)
echo "Please create a new repository on GitHub named '$github_repo'"
read -p "Press Enter once you've created the repository... " -n1 -s
echo ""

# Add GitHub remote
echo "Adding GitHub remote..."
git remote add origin https://github.com/$github_username/$github_repo.git

# Push to GitHub
echo "Pushing code to GitHub..."
git push -u origin master || git push -u origin main

# Login to Railway
echo "Logging in to Railway..."
echo "A browser window will open. Please complete the authentication process."
railway login

# Create new Railway project from GitHub
echo "Creating new Railway project from GitHub repository..."
railway link

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
echo "Triggering initial deployment to Railway..."
railway up

echo "Deployment setup complete!"
echo "Your Amazon to eBay Arbitrage System is now connected to GitHub and Railway."
echo "Any changes you push to your GitHub repository will automatically be deployed to Railway."
echo "You can access your project in the Railway dashboard to find the URL."
