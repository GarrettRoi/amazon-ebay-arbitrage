const express = require('express');
const {
  getSystemStatus,
  getSystemLogs
} = require('../controllers/system');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.get('/status', protect, getSystemStatus);
router.get('/logs', protect, authorize('admin'), getSystemLogs);

module.exports = router;
