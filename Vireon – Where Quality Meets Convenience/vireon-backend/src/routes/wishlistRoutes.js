import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

const router = express.Router();

// Get wishlist
router.get("/", verifyToken, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate('products');
    
    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.user.id,
        products: []
      });
      await wishlist.save();
    }

    res.json(wishlist.products);
  } catch (error) {
    console.error("Get Wishlist Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Add to wishlist
router.post("/add/:productId", verifyToken, async (req, res) => {
  try {
    const productId = req.params.productId;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.user.id,
        products: []
      });
    }

    // Check if product already in wishlist
    if (wishlist.products.includes(productId)) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    // Add product to wishlist
    wishlist.products.push(productId);
    await wishlist.save();

    // Populate product details
    await wishlist.populate('products');

    res.json(wishlist);
  } catch (error) {
    console.error("Wishlist Add Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Remove from wishlist
router.delete("/remove/:productId", verifyToken, async (req, res) => {
  try {
    const productId = req.params.productId;
    
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.products = wishlist.products.filter(
      id => id.toString() !== productId
    );
    
    await wishlist.save();
    await wishlist.populate('products');

    res.json(wishlist);
  } catch (error) {
    console.error("Wishlist Remove Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router; 