const express = require('express');
const {
  searchProducts,
  listProduct,
  checkProfitability,
  getArbitrageStats
} = require('../controllers/arbitrage');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.get('/search', protect, searchProducts);
router.post('/list', protect, authorize('admin'), listProduct);
router.post('/check-profitability', protect, checkProfitability);
router.get('/stats', protect, getArbitrageStats);

module.exports = router;
