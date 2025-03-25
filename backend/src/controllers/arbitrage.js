const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { spawn } = require('child_process');
const path = require('path');
const Product = require('../models/products');

// @desc    Search for profitable products
// @route   GET /api/v1/arbitrage/search
// @access  Private
exports.searchProducts = asyncHandler(async (req, res, next) => {
  const { keywords, category, minProfit, maxPrice } = req.query;
  
  // Validate required parameters
  if (!keywords) {
    return next(new ErrorResponse('Please provide search keywords', 400));
  }
  
  // Call the Python product finder script
  const scriptPath = path.join(__dirname, '../../../scripts/product_finder.py');
  const args = [
    '--keywords', keywords,
    '--min-profit', minProfit || '5',
    '--max-price', maxPrice || '100'
  ];
  
  if (category) {
    args.push('--category', category);
  }
  
  const pythonProcess = spawn('python3', [scriptPath, ...args]);
  
  let dataString = '';
  let errorString = '';
  
  pythonProcess.stdout.on('data', (data) => {
    dataString += data.toString();
  });
  
  pythonProcess.stderr.on('data', (data) => {
    errorString += data.toString();
  });
  
  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`Product finder script exited with code ${code}`);
      console.error(errorString);
      return next(new ErrorResponse('Error searching for products', 500));
    }
    
    try {
      const results = JSON.parse(dataString);
      
      res.status(200).json({
        success: true,
        count: results.length,
        data: results
      });
    } catch (err) {
      console.error('Error parsing product finder results', err);
      return next(new ErrorResponse('Error processing search results', 500));
    }
  });
});

// @desc    List a product on eBay
// @route   POST /api/v1/arbitrage/list
// @access  Private/Admin
exports.listProduct = asyncHandler(async (req, res, next) => {
  const { amazonProductId, markup, title, description } = req.body;
  
  if (!amazonProductId || !markup) {
    return next(new ErrorResponse('Please provide amazonProductId and markup', 400));
  }
  
  // Call the Python eBay lister script
  const scriptPath = path.join(__dirname, '../../../scripts/ebay_lister.py');
  const args = [
    '--product-id', amazonProductId,
    '--markup', markup
  ];
  
  if (title) args.push('--title', title);
  if (description) args.push('--description', description);
  
  const pythonProcess = spawn('python3', [scriptPath, ...args]);
  
  let dataString = '';
  let errorString = '';
  
  pythonProcess.stdout.on('data', (data) => {
    dataString += data.toString();
  });
  
  pythonProcess.stderr.on('data', (data) => {
    errorString += data.toString();
  });
  
  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`eBay lister script exited with code ${code}`);
      console.error(errorString);
      return next(new ErrorResponse('Error listing product on eBay', 500));
    }
    
    try {
      const result = JSON.parse(dataString);
      
      // Save the product to our database
      const productData = {
        amazonProductId: amazonProductId,
        ebayListingId: result.ebayListingId,
        title: result.title,
        amazonPrice: result.amazonPrice,
        ebayPrice: result.ebayPrice,
        profit: result.profit,
        user: req.user.id
      };
      
      Product.create(productData)
        .then(product => {
          res.status(201).json({
            success: true,
            data: product
          });
        })
        .catch(err => {
          console.error('Error saving product to database', err);
          return next(new ErrorResponse('Product listed but error saving to database', 500));
        });
      
    } catch (err) {
      console.error('Error parsing eBay lister results', err);
      return next(new ErrorResponse('Error processing listing results', 500));
    }
  });
});

// @desc    Check profitability of a product
// @route   POST /api/v1/arbitrage/check-profitability
// @access  Private
exports.checkProfitability = asyncHandler(async (req, res, next) => {
  const { amazonProductId, amazonPrice } = req.body;
  
  if (!amazonProductId) {
    return next(new ErrorResponse('Please provide amazonProductId', 400));
  }
  
  // Calculate eBay fees, PayPal fees, and potential profit
  const calculateProfitability = (amazonPrice) => {
    // Get settings for markup percentage
    const markupPercentage = 15; // Default, should come from settings
    
    // Calculate eBay price
    const ebayPrice = amazonPrice * (1 + markupPercentage / 100);
    
    // Calculate eBay fee (approx 10% of final value)
    const ebayFee = ebayPrice * 0.1;
    
    // Calculate PayPal fee (2.9% + $0.30)
    const paypalFee = ebayPrice * 0.029 + 0.30;
    
    // Calculate profit
    const profit = ebayPrice - amazonPrice - ebayFee - paypalFee;
    
    // Calculate ROI
    const roi = (profit / amazonPrice) * 100;
    
    return {
      amazonPrice,
      ebayPrice: parseFloat(ebayPrice.toFixed(2)),
      ebayFee: parseFloat(ebayFee.toFixed(2)),
      paypalFee: parseFloat(paypalFee.toFixed(2)),
      profit: parseFloat(profit.toFixed(2)),
      roi: parseFloat(roi.toFixed(2))
    };
  };
  
  // If amazonPrice is provided, calculate directly
  if (amazonPrice) {
    const profitability = calculateProfitability(amazonPrice);
    
    return res.status(200).json({
      success: true,
      data: profitability
    });
  }
  
  // Otherwise, fetch the price from Amazon API
  const scriptPath = path.join(__dirname, '../../../scripts/product_finder.py');
  const args = ['--product-id', amazonProductId, '--check-price-only'];
  
  const pythonProcess = spawn('python3', [scriptPath, ...args]);
  
  let dataString = '';
  let errorString = '';
  
  pythonProcess.stdout.on('data', (data) => {
    dataString += data.toString();
  });
  
  pythonProcess.stderr.on('data', (data) => {
    errorString += data.toString();
  });
  
  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`Product price check script exited with code ${code}`);
      console.error(errorString);
      return next(new ErrorResponse('Error checking product price', 500));
    }
    
    try {
      const result = JSON.parse(dataString);
      const profitability = calculateProfitability(result.price);
      
      res.status(200).json({
        success: true,
        data: {
          ...profitability,
          productDetails: result
        }
      });
    } catch (err) {
      console.error('Error parsing price check results', err);
      return next(new ErrorResponse('Error processing price data', 500));
    }
  });
});

// @desc    Get arbitrage statistics
// @route   GET /api/v1/arbitrage/stats
// @access  Private
exports.getArbitrageStats = asyncHandler(async (req, res, next) => {
  // Get statistics about arbitrage operations
  const totalProducts = await Product.countDocuments();
  
  // Get total profit
  const profitResult = await Product.aggregate([
    {
      $group: {
        _id: null,
        totalProfit: { $sum: '$profit' },
        avgProfit: { $avg: '$profit' },
        totalRevenue: { $sum: '$ebayPrice' },
        totalCost: { $sum: '$amazonPrice' }
      }
    }
  ]);
  
  // Get profit by category
  const profitByCategory = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        totalProfit: { $sum: '$profit' },
        count: { $sum: 1 }
      }
    },
    { $sort: { totalProfit: -1 } }
  ]);
  
  // Get recent listings
  const recentListings = await Product.find()
    .sort({ createdAt: -1 })
    .limit(5);
  
  const stats = {
    totalProducts,
    financials: profitResult.length > 0 ? profitResult[0] : {
      totalProfit: 0,
      avgProfit: 0,
      totalRevenue: 0,
      totalCost: 0
    },
    profitByCategory,
    recentListings
  };
  
  res.status(200).json({
    success: true,
    data: stats
  });
});
