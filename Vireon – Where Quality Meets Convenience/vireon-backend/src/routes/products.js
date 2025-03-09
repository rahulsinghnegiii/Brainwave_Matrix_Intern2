import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { authenticateToken, debugAuthenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all products (no auth required)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete product (auth required)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Delete request for product ID:', id);
    
    // Validate that ID exists
    if (!id || id === 'undefined') {
      console.log('Invalid product ID detected');
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    // Validate that ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('Invalid ObjectId format:', id);
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    
    // Log before finding the product
    console.log('Looking for product with ID:', id);
    
    const product = await Product.findById(id);
    
    // Log the found product
    console.log('Product found:', product);
    
    if (!product) {
      console.log('Product not found with ID:', id);
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await Product.findByIdAndDelete(id);
    console.log('Product successfully deleted');
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: error.message });
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

// Improve the add product endpoint
router.post('/', debugAuthenticateToken, async (req, res) => {
  try {
    console.log('Add product request received:', req.body);
    
    // Validate the request body has all required fields
    const { name, price, category, stock } = req.body;
    
    // Check required fields
    if (!name || !price || !category || !stock) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        message: "Please provide all required fields: name, price, category, and stock" 
      });
    }
    
    // Validate field types
    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ message: "Name must be a non-empty string" });
    }
    
    if (isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ message: "Price must be a positive number" });
    }
    
    if (typeof category !== 'string' || category.trim() === '') {
      return res.status(400).json({ message: "Category must be a non-empty string" });
    }
    
    if (isNaN(Number(stock)) || Number(stock) < 0) {
      return res.status(400).json({ message: "Stock must be a positive number" });
    }
    
    // Convert to proper types
    const productData = {
      ...req.body,
      price: Number(price),
      stock: Number(stock)
    };
    
    // Create a new product instance
    const newProduct = new Product(productData);
    
    // Save to database
    const savedProduct = await newProduct.save();
    console.log('Product saved successfully:', savedProduct);
    
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    
    // Better error handling with detailed messages
    if (error.name === 'ValidationError') {
      // Get all validation error messages
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    
    if (error.code === 11000) {
      // Duplicate key error
      return res.status(400).json({ message: "A product with this name already exists" });
    }
    
    res.status(500).json({ 
      message: "Failed to create product", 
      error: error.message 
    });
  }
});

// Search products
router.get('/search', async (req, res) => {
  try {
    const { query, category, minPrice, maxPrice, sort } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (query) {
      filter.name = { $regex: query, $options: 'i' };
    }
    
    if (category) {
      filter.category = category;
    }
    
    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    // Build sort object
    let sortOption = {};
    if (sort) {
      switch (sort) {
        case 'priceAsc':
          sortOption = { price: 1 };
          break;
        case 'priceDesc':
          sortOption = { price: -1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        case 'nameAsc':
          sortOption = { name: 1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    } else {
      sortOption = { createdAt: -1 }; // Default sort
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);
    
    const total = await Product.countDocuments(filter);
    
    res.json({
      products,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get product categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router; 