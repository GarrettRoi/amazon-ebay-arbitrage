const { Settings } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get settings
// @route   GET /api/v1/settings
// @access  Private
exports.getSettings = asyncHandler(async (req, res, next) => {
  // Get the first settings record or create default if none exists
  let [settings] = await Settings.findOrCreate({
    where: {},
    defaults: {}
  });

  res.status(200).json({
    success: true,
    data: settings
  });
});

// @desc    Update settings
// @route   PUT /api/v1/settings
// @access  Private
exports.updateSettings = asyncHandler(async (req, res, next) => {
  // Get the first settings record or create default if none exists
  let [settings] = await Settings.findOrCreate({
    where: {},
    defaults: {}
  });

  // Update settings
  settings = await settings.update(req.body);

  res.status(200).json({
    success: true,
    data: settings
  });
});
