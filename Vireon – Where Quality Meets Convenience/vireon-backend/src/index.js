import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import morgan from "morgan";
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

// Route imports - use consistent filenames
import authRoutes from "./routes/auth.js"; // Changed to match our auth.js file
import productRoutes from "./routes/products.js"; // Changed to our products.js
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import dashboardRoutes from './routes/dashboardRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet()); // Security headers
app.use(mongoSanitize()); // Prevent NoSQL injection

// Debug logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  
  // Log the original response methods
  const originalSend = res.send;
  const originalJson = res.json;
  const originalStatus = res.status;
  
  // Override status to log status codes
  res.status = function(code) {
    console.log(`Response status: ${code}`);
    return originalStatus.apply(this, arguments);
  };
  
  // Override send to log response body
  res.send = function(body) {
    console.log(`Response body:`, body);
    return originalSend.apply(this, arguments);
  };
  
  // Override json to log response body
  res.json = function(body) {
    console.log(`Response JSON:`, body);
    return originalJson.apply(this, arguments);
  };
  
  next();
});

// MongoDB Connection with better error handling
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Basic API route
app.get("/api", (req, res) => {
  res.json({ message: "Welcome to Vireon API" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes); // This is now using our products.js file with debugAuthenticateToken
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/categories', categoryRoutes);

// Test routes to verify API is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: "Internal server error" });
});

// Print server startup information
console.log('===========================================');
console.log(`Starting server on port ${process.env.PORT}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`MongoDB URI: ${process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 15) + '...' : 'Not set'}`);
console.log('JWT Secret:', process.env.JWT_SECRET ? 'Is set' : 'Not set');
console.log('===========================================');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}/api`);
});
