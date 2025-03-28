const { System } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get system status
// @route   GET /api/v1/system
// @access  Private
exports.getSystemStatus = asyncHandler(async (req, res, next) => {
  // Get the first system record or create default if none exists
  let [system] = await System.findOrCreate({
    where: {},
    defaults: {}
  });

  res.status(200).json({
    success: true,
    data: system
  });
});

// @desc    Update system status
// @route   PUT /api/v1/system
// @access  Private/Admin
exports.updateSystemStatus = asyncHandler(async (req, res, next) => {
  // Get the first system record or create default if none exists
  let [system] = await System.findOrCreate({
    where: {},
    defaults: {}
  });

  // Update system
  system = await system.update(req.body);

  res.status(200).json({
    success: true,
    data: system
  });
});

// @desc    Add error to log
// @route   POST /api/v1/system/error
// @access  Private
exports.logError = asyncHandler(async (req, res, next) => {
  const { message, stack } = req.body;
  
  // Get the first system record or create default if none exists
  let [system] = await System.findOrCreate({
    where: {},
    defaults: {}
  });
  
  // Get current error log
  let errorLog = system.errorLog || [];
  
  // Add new error
  errorLog.push({
    message,
    stack,
    date: new Date()
  });
  
  // Limit error log to last 100 entries
  if (errorLog.length > 100) {
    errorLog = errorLog.slice(-100);
  }
  
  // Update system with new error log
  system = await system.update({ errorLog });

  res.status(200).json({
    success: true,
    data: system
  });
});
