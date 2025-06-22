// models/Product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name']
  },
  category:{    
    type: String,
    required: [true, 'Please add a category'],

  },
  images:{
    type: [String],
    required: [true, 'Please add at least one image'],
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'At least one image is required'
    },
  },
  description: {
    type: String
  },
  discount:{
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'sellerModel',
    required: true
  },
  sellerModel: {
    type: String,
    required: true,
    enum: ['User', 'Business']
  },
  // Location data for map integration
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create geospatial index for location-based queries
ProductSchema.index({ location: '2dsphere' });

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);