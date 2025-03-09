import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import Review from "../models/Review.js";

const router = express.Router();

// Get product reviews
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort('-createdAt');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Add review
router.post("/", verifyToken, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    
    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user.id,
      product: productId
    });

    if (existingReview) {
      return res.status(400).json({ message: "You already reviewed this product" });
    }

    const review = new Review({
      user: req.user.id,
      product: productId,
      rating,
      comment
    });
    await review.save();

    res.status(201).json({ message: "Review added successfully", review });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router; 