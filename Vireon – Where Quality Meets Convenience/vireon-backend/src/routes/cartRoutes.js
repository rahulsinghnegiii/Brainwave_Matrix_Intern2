import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { validate, cartValidation } from '../middleware/validation.js';
import { body } from 'express-validator';

const router = express.Router();

// Get user's cart
router.get("/", authenticateToken, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product');
    
    if (!cart) {
      cart = new Cart({ 
        user: req.user.id, 
        items: [],
        total: 0 
      });
      await cart.save();
    }
    
    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error("Get Cart Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Add item to cart with validation
router.post("/", authenticateToken, cartValidation, validate, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    // Check if product exists and has enough stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock available"
      });
    }
    
    // Find user's cart or create a new one
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [], total: 0 });
    }
    
    // Check if item already in cart
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );
    
    if (itemIndex > -1) {
      // Item exists, update quantity
      cart.items[itemIndex].quantity += Number(quantity);
    } else {
      // Item doesn't exist, add new item
      cart.items.push({
        product: productId,
        quantity: Number(quantity)
      });
    }
    
    // Calculate new cart total
    await cart.populate('items.product');
    cart.total = cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
    
    // Save cart
    await cart.save();
    
    res.json({
      success: true,
      data: cart,
      message: "Item added to cart successfully"
    });
  } catch (error) {
    console.error("Add to Cart Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update cart item quantity with validation
router.put("/:itemId", authenticateToken, [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  validate
], async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    
    // Find user's cart
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }
    
    // Find item in cart
    const itemIndex = cart.items.findIndex(
      item => item._id.toString() === itemId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart"
      });
    }
    
    // Get product to check stock
    const productId = cart.items[itemIndex].product;
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock available"
      });
    }
    
    // Update quantity
    cart.items[itemIndex].quantity = Number(quantity);
    
    // Recalculate cart total
    await cart.populate('items.product');
    cart.total = cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
    
    // Save cart
    await cart.save();
    
    res.json({
      success: true,
      data: cart,
      message: "Cart updated successfully"
    });
  } catch (error) {
    console.error("Update Cart Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Remove item from cart
router.delete("/:itemId", authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    
    // Find user's cart
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }
    
    // Remove item from cart
    cart.items = cart.items.filter(
      item => item._id.toString() !== itemId
    );
    
    // Recalculate cart total
    await cart.populate('items.product');
    cart.total = cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
    
    // Save cart
    await cart.save();
    
    res.json({
      success: true,
      data: cart,
      message: "Item removed from cart successfully"
    });
  } catch (error) {
    console.error("Remove from Cart Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Clear entire cart
router.delete("/", authenticateToken, async (req, res) => {
  try {
    // Find user's cart
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }
    
    // Clear cart items and reset total
    cart.items = [];
    cart.total = 0;
    
    // Save cart
    await cart.save();
    
    res.json({
      success: true,
      data: cart,
      message: "Cart cleared successfully"
    });
  } catch (error) {
    console.error("Clear Cart Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router; 