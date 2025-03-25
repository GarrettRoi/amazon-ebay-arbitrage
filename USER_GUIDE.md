# Amazon to eBay Arbitrage System - User Guide

## Overview

The Amazon to eBay Arbitrage System is a fully automated solution that helps you find profitable products on Amazon, list them on eBay, and fulfill orders automatically. This guide will walk you through the setup process and explain how to use the system effectively.

## System Requirements

- Node.js 14+ and npm
- Python 3.7+
- MongoDB database (local or Atlas)
- eBay Developer account with API credentials
- Amazon Associate account with API credentials
- Railway.com account for deployment

## Installation

### Local Development Setup

1. Clone the repository:
```
git clone https://github.com/yourusername/amazon-ebay-arbitrage.git
cd amazon-ebay-arbitrage
```

2. Install dependencies:
```
npm run install-deps
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
MONGODB_URI=mongodb://localhost:27017/amazon_ebay_arbitrage

# eBay API credentials
EBAY_APP_ID=your_ebay_app_id
EBAY_CERT_ID=your_ebay_cert_id
EBAY_DEV_ID=your_ebay_dev_id
EBAY_AUTH_TOKEN=your_ebay_auth_token

# Amazon API credentials
AMAZON_ACCESS_KEY=your_amazon_access_key
AMAZON_SECRET_KEY=your_amazon_secret_key
AMAZON_ASSOCIATE_TAG=your_amazon_associate_tag
```

4. Initialize the database:
```
node scripts/setup_db.js
```

5. Start the development server:
```
npm run dev
```

### Railway Deployment

1. Install the Railway CLI:
```
npm install -g @railway/cli
```

2. Login to Railway:
```
railway login
```

3. Initialize a new Railway project:
```
railway init
```

4. Set up environment variables in the Railway dashboard with the same variables as in the `.env` file.

5. Deploy the application:
```
node scripts/deploy_railway.js
```

## System Architecture

The system consists of the following components:

1. **Frontend Dashboard**: React-based user interface for managing the arbitrage system.
2. **Backend API**: Express.js server that handles authentication, database operations, and integration with the arbitrage scripts.
3. **Product Finder**: Python script that searches for profitable products on Amazon.
4. **eBay Lister**: Python script that lists products on eBay.
5. **Order Fulfiller**: Python script that automatically fulfills eBay orders by purchasing products on Amazon.
6. **Database**: MongoDB database that stores product, order, and system information.

## Using the System

### Dashboard Navigation

After logging in, you'll see the main dashboard with the following sections:

- **Home**: Overview of your arbitrage business with key metrics.
- **Products**: List of products found and their profitability.
- **Orders**: List of eBay orders and their fulfillment status.
- **Inventory**: Current inventory status and management.
- **Settings**: System configuration options.
- **System Status**: Health and status of the arbitrage system.

### Finding Profitable Products

1. Go to the Products page and click "Find Products".
2. Enter search keywords, category, and profitability criteria.
3. The system will search Amazon for products that meet your criteria.
4. Review the results and select products to list on eBay.

### Listing Products on eBay

1. From the Products page, select products you want to list.
2. Click "List on eBay".
3. Review and adjust the listing details if needed.
4. Confirm to create the eBay listings.

### Managing Orders

1. The Orders page shows all eBay orders.
2. New orders are automatically detected and fulfilled.
3. You can view the status of each order and tracking information.
4. Manual intervention is only required if there are issues with automatic fulfillment.

### System Configuration

In the Settings page, you can configure:

1. **eBay Settings**:
   - Markup percentage
   - Auto-listing preferences
   - Maximum listing price
   - Minimum profit margin

2. **Amazon Settings**:
   - Amazon Prime usage
   - Maximum purchase price
   - Preferred product categories

3. **System Settings**:
   - Scan frequency
   - Order check frequency
   - Notification preferences

## Monitoring and Maintenance

### System Status

The System Status page provides information about:

- API connection status (Amazon, eBay)
- Task scheduler status
- Error logs and alerts
- System performance metrics

### Logs

Logs are stored in the `logs` directory and can be accessed through the System Status page. Important log files include:

- `server.log`: Backend server logs
- `product_finder.log`: Product finder script logs
- `ebay_lister.log`: eBay lister script logs
- `order_fulfiller.log`: Order fulfiller script logs

## Troubleshooting

### Common Issues

1. **API Connection Errors**:
   - Verify your API credentials in the environment variables.
   - Check if the APIs are operational.

2. **Database Connection Issues**:
   - Verify your MongoDB connection string.
   - Ensure MongoDB is running if using a local instance.

3. **Order Fulfillment Failures**:
   - Check if the product is still available on Amazon.
   - Verify your Amazon account has valid payment methods.

### Getting Help

If you encounter issues not covered in this guide, please:

1. Check the logs for specific error messages.
2. Consult the API documentation for Amazon and eBay.
3. Contact support at support@example.com.

## Security Considerations

1. Keep your API credentials secure and never share them.
2. Regularly update your passwords.
3. Monitor your accounts for suspicious activity.
4. Use strong JWT secrets in production.

## Conclusion

The Amazon to eBay Arbitrage System automates the entire process of finding profitable products, listing them on eBay, and fulfilling orders. By following this guide, you should be able to set up and use the system effectively to build a profitable arbitrage business with minimal daily oversight.
