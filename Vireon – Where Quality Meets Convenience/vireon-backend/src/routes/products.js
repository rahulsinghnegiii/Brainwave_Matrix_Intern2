import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { authenticateToken, authenticateAdmin } from '../middleware/auth.js';
import { validate, productValidation } from '../middleware/validation.js';

const router = express.Router();

// Get all products with filtering, sorting, and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      sortBy = 'createdAt', 
      order = 'desc',
      page = 1, 
      limit = 10,
      featured,
      format = 'simple' // Change default to 'simple' for backward compatibility
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }
    
    if (featured === 'true') {
      filter.featured = true;
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = order === 'asc' ? 1 : -1;
    
    try {
      // Execute query with all parameters
      const products = await Product.find(filter)
        .sort(sort)
        .lean() // Convert to plain JavaScript objects
        .exec();
      
      // Ensure products is always an array
      const productsArray = Array.isArray(products) ? products : [];
      
      // Return simple array format by default for backward compatibility
      if (format === 'simple') {
        return res.json(productsArray);
      }
      
      // Return extended format with pagination only when explicitly requested
      const total = await Product.countDocuments(filter);
      const skip = (Number(page) - 1) * Number(limit);
      const paginatedProducts = productsArray.slice(skip, skip + Number(limit));
      
      res.json({
        success: true,
        data: {
          products: paginatedProducts,
          pagination: {
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            limit: Number(limit)
          }
        }
      });
    } catch (dbError) {
      console.error('Database query error:', dbError);
      // Return empty array on database error for backward compatibility
      return res.json([]);
    }
  } catch (error) {
    console.error('Product listing error:', error);
    // Return empty array on any error for backward compatibility
    res.json([]);
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Product details error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Search products
router.get('/search/query', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Create a text index for better search if it doesn't exist
    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ]
    }).limit(20);
    
    res.json(products);
  } catch (error) {
    console.error('Product search error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get product categories
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete product (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    await Product.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Add a test route to check if products API works
router.get('/test', (req, res) => {
  res.json({ message: 'Products API is working' });
});

// Add this route to check all products
router.get('/debug', async (req, res) => {
  try {
    const products = await Product.find().lean();
    console.log('All products:', products);
    res.json({
      count: products.length,
      products: products
    });
  } catch (error) {
    console.error('Error fetching products for debugging:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add product (admin only)
router.post('/', authenticateAdmin, productValidation, validate, async (req, res) => {
  try {
    const productData = req.body;
    
    // Create new product instance
    const newProduct = new Product(productData);
    
    // Save to database
    const savedProduct = await newProduct.save();
    
    res.status(201).json({
      success: true,
      data: savedProduct,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Error creating product:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A product with this name already exists"
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update product (admin only)
router.put('/:id', authenticateAdmin, productValidation, validate, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    // Find and update product
    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Update product error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router; 