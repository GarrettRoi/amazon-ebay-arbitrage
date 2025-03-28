const { Order, Product, User } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Private
exports.getOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.findAll({
    where: { userId: req.user.id },
    include: [
      { model: Product, attributes: ['title', 'amazonProductId', 'ebayListingId'] },
      { model: User, attributes: ['name', 'email'] }
    ]
  });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// @desc    Get single order
// @route   GET /api/v1/orders/:id
// @access  Private
exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findOne({
    where: { 
      id: req.params.id,
      userId: req.user.id
    },
    include: [
      { model: Product, attributes: ['title', 'amazonProductId', 'ebayListingId'] },
      { model: User, attributes: ['name', 'email'] }
    ]
  });

  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.userId = req.user.id;

  // Check if product exists
  const product = await Product.findByPk(req.body.productId);
  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.body.productId}`, 404)
    );
  }

  const order = await Order.create(req.body);

  res.status(201).json({
    success: true,
    data: order
  });
});

// @desc    Update order
// @route   PUT /api/v1/orders/:id
// @access  Private
exports.updateOrder = asyncHandler(async (req, res, next) => {
  let order = await Order.findOne({
    where: { 
      id: req.params.id,
      userId: req.user.id
    }
  });

  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.id}`, 404)
    );
  }

  order = await order.update(req.body);

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Delete order
// @route   DELETE /api/v1/orders/:id
// @access  Private
exports.deleteOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findOne({
    where: { 
      id: req.params.id,
      userId: req.user.id
    }
  });

  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.id}`, 404)
    );
  }

  await order.destroy();

  res.status(200).json({
    success: true,
    data: {}
  });
});
