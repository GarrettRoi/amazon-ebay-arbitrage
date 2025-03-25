const express = require('express');
const {
  getSettings,
  updateSettings
} = require('../controllers/settings');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getSettings)
  .put(protect, authorize('admin'), updateSettings);

module.exports = router;
