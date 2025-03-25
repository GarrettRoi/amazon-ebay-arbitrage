const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Settings = require('../models/settings');

// @desc    Get system settings
// @route   GET /api/v1/settings
// @access  Private
exports.getSettings = asyncHandler(async (req, res, next) => {
  // Get the settings - there should only be one document
  const settings = await Settings.findOne();

  if (!settings) {
    // If no settings exist, create default settings
    const defaultSettings = await Settings.create({
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
        notificationEmail: req.user.email
      }
    });

    return res.status(200).json({
      success: true,
      data: defaultSettings
    });
  }

  res.status(200).json({
    success: true,
    data: settings
  });
});

// @desc    Update settings
// @route   PUT /api/v1/settings
// @access  Private/Admin
exports.updateSettings = asyncHandler(async (req, res, next) => {
  let settings = await Settings.findOne();

  if (!settings) {
    // If no settings exist, create with the provided data
    settings = await Settings.create(req.body);
  } else {
    // Update existing settings
    settings = await Settings.findOneAndUpdate({}, req.body, {
      new: true,
      runValidators: true
    });
  }

  res.status(200).json({
    success: true,
    data: settings
  });
});
