const express = require('express');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder
} = require('../controllers/orders');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getOrders)
  .post(protect, createOrder);

router
  .route('/:id')
  .get(protect, getOrder)
  .put(protect, updateOrder)
  .delete(protect, authorize('admin'), deleteOrder);

module.exports = router;
