const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  amazonProductId: {
    type: String,
    required: [true, 'Please add an Amazon product ID'],
    unique: true,
    trim: true
  },
  ebayListingId: {
    type: String,
    unique: true,
    sparse: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [5000, 'Description cannot be more than 5000 characters']
  },
  category: {
    type: String,
    trim: true
  },
  amazonPrice: {
    type: Number,
    required: [true, 'Please add Amazon price']
  },
  ebayPrice: {
    type: Number
  },
  profit: {
    type: Number
  },
  roi: {
    type: Number
  },
  status: {
    type: String,
    enum: ['pending', 'listed', 'sold', 'error'],
    default: 'pending'
  },
  imageUrl: {
    type: String
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
ProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
