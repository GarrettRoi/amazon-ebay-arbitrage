const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  ebayOrderId: {
    type: String,
    required: [true, 'Please add an eBay order ID'],
    unique: true,
    trim: true
  },
  amazonOrderId: {
    type: String,
    unique: true,
    sparse: true
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  buyerName: {
    type: String,
    required: [true, 'Please add a buyer name']
  },
  buyerEmail: {
    type: String,
    required: [true, 'Please add a buyer email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  shippingAddress: {
    name: String,
    street1: String,
    street2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  orderTotal: {
    type: Number,
    required: [true, 'Please add order total']
  },
  orderStatus: {
    type: String,
    enum: ['received', 'processing', 'ordered', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'received'
  },
  trackingNumber: {
    type: String
  },
  carrier: {
    type: String
  },
  fulfillmentStatus: {
    type: String,
    enum: ['pending', 'fulfilled', 'failed'],
    default: 'pending'
  },
  profit: {
    type: Number
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
OrderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
