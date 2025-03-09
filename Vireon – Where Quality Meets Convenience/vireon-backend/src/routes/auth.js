import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// You'll need a User model - if you don't have one already, let's create a basic one
import User from '../models/User.js';

const router = express.Router();

// Update your token generation to use a consistent approach
const generateToken = (user) => {
  // Create payload
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role || 'user'
  };

  console.log('Generating token with payload:', payload);
  console.log('Using JWT secret:', process.env.JWT_SECRET ? 'Secret exists' : 'No secret found');
  
  try {
    // Sign the token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { 
      expiresIn: '7d' 
    });
    
    // Test verification immediately
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verified immediately after creation:', verified);
    } catch (verifyErr) {
      console.error('Could not verify the token we just created!', verifyErr);
    }
    
    return token;
  } catch (err) {
    console.error('Error generating token:', err);
    throw err;
  }
};

// Login route
router.post("/login", async (req, res) => {
  try {
    console.log('Login attempt with:', req.body);
    const { email, password } = req.body;

    // Validate request
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create and sign JWT
    const token = generateToken(user);

    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('User logged in successfully:', user.email);
    
    // Return token and user info (without password)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'user'
    };

    res.json({
      token,
      refreshToken,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Registration route
router.post("/register", async (req, res) => {
  try {
    console.log('Registration attempt with:', req.body);
    const { name, email, password } = req.body;

    // Validate request
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    // Save user
    const savedUser = await newUser.save();
    console.log('User registered successfully:', savedUser.email);

    // Create and sign JWT
    const token = generateToken(savedUser);

    // Return token and user info (without password)
    const userResponse = {
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role || 'user'
    };

    res.status(201).json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Verify token route - keep the one you already have
router.post("/verify", async (req, res) => {
  try {
    console.log('Verify endpoint called');
    console.log('Headers:', req.headers);
    
    const token = req.headers.authorization?.split(" ")[1] || req.body.token;
    
    console.log('Token to verify:', token ? `${token.substring(0, 10)}...` : 'No token');
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verification successful. User:', decoded);
      
      // If we get here, token is valid
      res.status(200).json({ valid: true, user: decoded });
    } catch (verifyError) {
      console.error('JWT verification error:', verifyError.message);
      
      // For development - you can make this more permissive if needed
      if (process.env.NODE_ENV === 'development') {
        // Option 1: Trust the token anyway for development
        try {
          // Just decode without verification for debugging
          const decodedAnyway = jwt.decode(token);
          console.log('Token decode (without verification):', decodedAnyway);
          
          // Uncomment the next lines to bypass verification in development
          // console.log('DEVELOPMENT MODE: Bypassing token verification');
          // return res.status(200).json({ 
          //   valid: true, 
          //   user: decodedAnyway,
          //   warning: 'Token accepted in dev mode only' 
          // });
        } catch (decodeError) {
          console.error('Token could not even be decoded:', decodeError);
        }
      }
      
      // Normal flow - token is invalid
      return res.status(401).json({ 
        message: "Invalid token", 
        error: verifyError.message 
      });
    }
  } catch (error) {
    console.error('Verify endpoint error:', error);
    res.status(500).json({ message: "Server error during verification" });
  }
});

// Add a test endpoint to verify the route is registered
router.get("/test", (req, res) => {
  res.json({ message: "Auth API is working" });
});

// Add a debug endpoint to test token verification
router.get("/debug-token", (req, res) => {
  try {
    // Create a test token that should definitely work
    const testPayload = {
      id: "test-user-id",
      email: "test@example.com",
      role: "admin"
    };
    
    // Generate a test token using the same secret
    const testToken = jwt.sign(testPayload, process.env.JWT_SECRET, { 
      expiresIn: '1h' 
    });
    
    res.json({ 
      message: "Debug token info",
      token: testToken,
      secret: process.env.JWT_SECRET ? `${process.env.JWT_SECRET.substring(0, 5)}...` : "Not set",
      test: "Try verifying this token"
    });
  } catch (error) {
    console.error('Debug token error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Token refresh endpoint
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // Find the user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a new access token
    const accessToken = generateToken(user);
    
    res.json({ 
      token: accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
});

// Logout endpoint
router.post("/logout", (req, res) => {
  // In a more complete implementation, you would add the token to a blacklist
  // or remove it from a whitelist. For now, we'll rely on the client to remove the token.
  res.json({ message: "Logged out successfully" });
});

export default router; 