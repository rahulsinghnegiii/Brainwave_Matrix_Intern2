import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Notification from "../models/Notification.js";
import { authenticateToken } from '../middleware/auth.js';
import User from "../models/User.js";
import { validate, orderValidation } from '../middleware/validation.js';
import { body } from 'express-validator';

const router = express.Router();

// Create order (checkout) with validation
router.post("/", authenticateToken, orderValidation, validate, async (req, res) => {
  try {
    const { 
      shippingAddress, 
      paymentMethod = 'credit_card',
      notes 
    } = req.body;
    
    // Validate shipping address
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({ message: "Shipping address is required" });
    }
    
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Check stock availability
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      
      if (!product) {
        return res.status(400).json({ message: `Product ${item.product._id} not found` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
        });
      }
    }
    
    // Create order products array with product information
    const orderProducts = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity
    }));
    
    // Create new order
    const order = new Order({
      user: req.user.id,
      products: orderProducts,
      totalAmount: cart.total,
      shippingAddress,
      paymentMethod,
      notes
    });
    
    // Save order
    const savedOrder = await order.save();
    
    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stock: -item.quantity } }
      );
    }
    
    // Create notification for user
    const notification = new Notification({
      user: req.user.id,
      title: 'Order Placed',
      message: `Your order #${savedOrder._id} has been placed successfully.`,
      type: 'order',
      data: { orderId: savedOrder._id }
    });
    
    await notification.save();
    
    // Create notification for admin
    const adminUsers = await User.find({ role: 'admin' });
    
    for (const admin of adminUsers) {
      const adminNotification = new Notification({
        user: admin._id,
        title: 'New Order',
        message: `New order #${savedOrder._id} has been placed by ${req.user.name}.`,
        type: 'order',
        data: { orderId: savedOrder._id }
      });
      
      await adminNotification.save();
    }
    
    // Clear the cart
    cart.items = [];
    cart.total = 0;
    await cart.save();
    
    // Return the order with populated fields
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('user', 'name email');
    
    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all orders for current user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get order by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Check if the order belongs to the current user or user is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to access this order" });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel order
router.put("/:id/cancel", authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Check if user owns this order or is admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }
    
    // Check if order can be cancelled
    if (order.status !== 'pending' && order.status !== 'processing') {
      return res.status(400).json({ 
        message: `Order cannot be cancelled. Current status: ${order.status}` 
      });
    }
    
    // Update order status
    order.status = 'cancelled';
    
    // Return items to inventory
    for (const item of order.products) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }
    
    await order.save();
    
    // Create notification
    const notification = new Notification({
      user: req.user.id,
      title: 'Order Cancelled',
      message: `Your order #${order._id} has been cancelled.`,
      type: 'order',
      data: { orderId: order._id }
    });
    
    await notification.save();
    
    res.json(order);
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get order status
router.get("/:id/status", authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .select('status isPaid isDelivered');
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Check if user owns this order or is admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }
    
    res.json({
      orderId: req.params.id,
      status: order.status,
      isPaid: order.isPaid,
      isDelivered: order.isDelivered
    });
  } catch (error) {
    console.error('Get order status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all orders (admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Regular users can only see their own orders
    if (req.user.role !== 'admin') {
      const orders = await Order.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .populate('user', 'name email');
      
      return res.json(orders);
    }
    
    // Admins can see all orders with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email');
    
    const total = await Order.countDocuments();
    
    res.json({
      orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user's orders
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    // Check if user is requesting their own orders or if admin
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view these orders' });
    }
    
    const orders = await Order.find({ user: req.params.userId })
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { products, shippingAddress, paymentMethod } = req.body;
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Products are required' });
    }
    
    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }
    
    // Calculate total and prepare order items
    let totalAmount = 0;
    const orderProducts = [];
    
    for (const item of products) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${product.name}` });
      }
      
      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;
      
      orderProducts.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal
      });
      
      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }
    
    // Create order
    const order = new Order({
      user: req.user.id,
      products: orderProducts,
      totalAmount,
      shippingAddress,
      paymentMethod
    });
    
    const savedOrder = await order.save();
    
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update order status (admin only) with validation
router.patch('/:id/status', authenticateToken, [
  body('status')
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
  validate
], async (req, res) => {
  try {
    // Admin only
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update order status'
      });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const { status } = req.body;
    order.status = status;
    
    // Update delivery status if applicable
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    
    const updatedOrder = await order.save();
    
    // Create notification for user
    const notification = new Notification({
      user: order.user,
      title: 'Order Status Updated',
      message: `Your order #${order._id} status has been updated to ${status}.`,
      type: 'order',
      data: { orderId: order._id }
    });
    
    await notification.save();
    
    res.json({
      success: true,
      data: updatedOrder,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update payment status with validation
router.patch('/:id/payment', authenticateToken, [
  body('paymentStatus')
    .isIn(['pending', 'processing', 'paid', 'failed', 'refunded'])
    .withMessage('Invalid payment status'),
  body('transactionId')
    .optional()
    .isString()
    .withMessage('Transaction ID must be a string'),
  validate
], async (req, res) => {
  try {
    const { paymentStatus, transactionId } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Only admin or the order owner can update payment
    if (req.user.id !== order.user.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }
    
    order.paymentStatus = paymentStatus;
    
    if (paymentStatus === 'paid') {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentDetails = {
        transactionId,
        paymentDate: Date.now()
      };
    }
    
    const updatedOrder = await order.save();
    
    // Create notification for payment status update
    const notification = new Notification({
      user: order.user,
      title: 'Payment Status Updated',
      message: `Payment status for order #${order._id} has been updated to ${paymentStatus}.`,
      type: 'payment',
      data: { orderId: order._id }
    });
    
    await notification.save();
    
    res.json({
      success: true,
      data: updatedOrder,
      message: 'Payment status updated successfully'
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
