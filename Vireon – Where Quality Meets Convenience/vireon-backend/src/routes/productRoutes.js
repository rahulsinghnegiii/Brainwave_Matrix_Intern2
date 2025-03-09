import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import Product from "../models/Product.js";
import cacheService from '../config/redis.js';

const router = express.Router();

// 🔹 Get All Products
router.get("/", async (req, res) => {
  try {
    // Try to get from cache first
    const cachedProducts = await cacheService.get('all_products');
    if (cachedProducts) {
      return res.json(JSON.parse(cachedProducts));
    }

    // If not in cache, get from DB
    const products = await Product.find();
    
    // Store in cache for 5 minutes
    await cacheService.set('all_products', JSON.stringify(products), 300);
    
    res.json(products);
  } catch (error) {
    console.error('Product Fetch Error:', error);
    res.status(500).json({ error: "Server error" });
  }
});

// 🔹 Get Single Product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// 🔹 Add a New Product (Admin Only)
router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, description, price, category, stock, image } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({ 
        error: "All fields except image are required.",
        received: { name, description, price, category, stock }
      });
    }

    // Log the request data
    console.log("📩 Received Product Data:", {
      name, description, price, category, stock, image
    });

    // Create and save the product
    const newProduct = new Product({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      image
    });

    // Save with error handling
    try {
      const savedProduct = await newProduct.save();
      console.log("✅ Product Saved Successfully:", savedProduct);

      // Clear products cache after new product is added
      await cacheService.del('all_products');

      res.status(201).json({ 
        message: "Product added successfully!", 
        product: savedProduct 
      });
    } catch (saveError) {
      console.error("❌ Product Save Error:", saveError);
      res.status(400).json({ 
        error: "Invalid product data", 
        details: saveError.message 
      });
    }

  } catch (error) {
    console.error("❌ Product Creation Error:", error);
    res.status(500).json({ 
      error: "Server error", 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});


// 🔹 Update Product (Protected)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ message: "Product updated!", product: updatedProduct });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// 🔹 Delete Product (Protected)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ message: "Product deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
