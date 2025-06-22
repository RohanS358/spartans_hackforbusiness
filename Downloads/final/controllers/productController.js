// controllers/productController.js
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create a new product
// @route   POST /api/products
// @access  Private
exports.createProduct = async (req, res, next) => {
  try {
    const { name, description,category, price, location,stock,images } = req.body;
    const { id, role } = req.user;
    
    // Add seller details
    req.body.seller = id;
    req.body.sellerModel = role === 'business' ? 'Business' : 'User';
    
    // Handle location data
    if (location && location.longitude && location.latitude) {
      req.body.location = {
        type: 'Point',
        coordinates: [parseFloat(location.longitude), parseFloat(location.latitude)]
      };
    }
    
    const product = await Product.create(req.body);
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get nearby products for map
// @route   GET /api/products/nearby
// @access  Public
exports.getNearbyProducts = async (req, res, next) => {
  try {
    const { longitude, latitude, distance = 10000 } = req.query; // distance in meters
    
    // Validate coordinates
    if (!longitude || !latitude) {
      return next(new ErrorResponse('Please provide longitude and latitude', 400));
    }
    
    // Find products using geospatial query
    const products = await Product.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(distance)
        }
      }
    });
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
exports.updateProduct = async (req, res, next) => {
    try {
        const { id, role } = req.user;
        
        let product = await Product.findById(req.params.id);
        
        if (!product) {
            return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
        }
        
        // Make sure user is product owner
        if (product.seller.toString() !== id) {
            return next(new ErrorResponse('Not authorized to update this product', 401));
        }
        
        // Check if sellerModel matches user role
        const expectedSellerModel = role === 'business' ? 'Business' : 'User';
        if (product.sellerModel !== expectedSellerModel) {
            return next(new ErrorResponse('Not authorized to update this product', 401));
        }
        
        // Extract allowed fields for update
        const { name, description, category, price, location, stock, images } = req.body;
        const updateData = {};
        
        // Only include fields that are provided
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (category !== undefined) updateData.category = category;
        if (price !== undefined) updateData.price = price;
        if (stock !== undefined) updateData.stock = stock;
        if (images !== undefined) updateData.images = images;
        
        // Handle location data
        if (location && location.longitude && location.latitude) {
            updateData.location = {
                type: 'Point',
                coordinates: [
                    parseFloat(location.longitude),
                    parseFloat(location.latitude)
                ]
            };
        }
        
        product = await Product.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });
        
        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id, role } = req.user;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }
    
    // Make sure user is product owner
    if (product.seller.toString() !== id || 
        product.sellerModel !== (role === 'business' ? 'Business' : 'User')) {
      return next(new ErrorResponse('Not authorized to delete this product', 401));
    }
    
    // Replace product.remove() with findByIdAndDelete
    await Product.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};