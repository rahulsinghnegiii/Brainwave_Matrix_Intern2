import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const router = express.Router();

// Get user's cart
router.get("/", verifyToken, async (req, res) => {
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
    
    res.json(cart);
  } catch (error) {
    console.error("Get Cart Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Add to cart
router.post("/add", verifyToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: [],
        total: 0
      });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity: quantity
      });
    }

    // Calculate total
    let total = 0;
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      total += product.price * item.quantity;
    }
    cart.total = total;

    // Save cart
    await cart.save();

    // Populate product details before sending response
    await cart.populate('items.product');

    res.json(cart);
  } catch (error) {
    console.error("Cart Add Error:", error);
    res.status(500).json({ 
      error: "Server error", 
      details: error.message 
    });
  }
});

export default router; 