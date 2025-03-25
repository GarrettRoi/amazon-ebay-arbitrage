const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// @desc    Get system status
// @route   GET /api/v1/system/status
// @access  Private
exports.getSystemStatus = asyncHandler(async (req, res, next) => {
  // Check if Python scripts are running
  const checkProcesses = () => {
    return new Promise((resolve, reject) => {
      exec('ps aux | grep python | grep -v grep', (error, stdout, stderr) => {
        if (error && error.code !== 1) {
          return reject(error);
        }
        
        const runningScripts = stdout.split('\n')
          .filter(line => line.includes('python') && line.length > 0)
          .map(line => {
            const parts = line.trim().split(/\s+/);
            return {
              pid: parts[1],
              cpu: parts[2],
              mem: parts[3],
              command: parts.slice(10).join(' ')
            };
          });
          
        resolve(runningScripts);
      });
    });
  };
  
  // Get database status
  const checkDatabase = () => {
    return new Promise((resolve, reject) => {
      try {
        const dbStatus = {
          connected: mongoose.connection.readyState === 1,
          host: mongoose.connection.host || 'Not connected',
          name: mongoose.connection.name || 'Not connected'
        };
        resolve(dbStatus);
      } catch (err) {
        reject(err);
      }
    });
  };
  
  // Get API status
  const checkAPIs = () => {
    return {
      ebay: process.env.EBAY_AUTH_TOKEN ? 'Configured' : 'Not configured',
      amazon: process.env.AMAZON_ACCESS_KEY ? 'Configured' : 'Not configured'
    };
  };
  
  try {
    const [processes, dbStatus] = await Promise.all([
      checkProcesses(),
      checkDatabase()
    ]);
    
    const apiStatus = checkAPIs();
    
    const systemStatus = {
      timestamp: new Date(),
      processes,
      database: dbStatus,
      apis: apiStatus,
      environment: process.env.NODE_ENV
    };
    
    res.status(200).json({
      success: true,
      data: systemStatus
    });
  } catch (err) {
    return next(new ErrorResponse('Error fetching system status', 500));
  }
});

// @desc    Get system logs
// @route   GET /api/v1/system/logs
// @access  Private/Admin
exports.getSystemLogs = asyncHandler(async (req, res, next) => {
  const logDir = path.join(__dirname, '../../../logs');
  
  // Check if logs directory exists
  if (!fs.existsSync(logDir)) {
    return res.status(200).json({
      success: true,
      data: {
        logs: [],
        message: 'No logs directory found'
      }
    });
  }
  
  // Read log files
  fs.readdir(logDir, (err, files) => {
    if (err) {
      return next(new ErrorResponse('Error reading log files', 500));
    }
    
    // Filter for .log files and sort by modified time (newest first)
    const logFiles = files
      .filter(file => file.endsWith('.log'))
      .map(file => {
        const filePath = path.join(logDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          size: stats.size,
          modified: stats.mtime
        };
      })
      .sort((a, b) => b.modified - a.modified);
    
    // Get the latest log content if requested
    const latestLog = req.query.latest === 'true' && logFiles.length > 0
      ? fs.readFileSync(logFiles[0].path, 'utf8')
      : null;
    
    res.status(200).json({
      success: true,
      data: {
        logs: logFiles,
        latestLog
      }
    });
  });
});
