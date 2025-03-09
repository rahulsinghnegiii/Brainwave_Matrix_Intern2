import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Notification from "../models/Notification.js";
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create Order
router.post("/", verifyToken, async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Check stock availability
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}` 
        });
      }
    }

    // Create order
    const order = new Order({
      user: req.user.id,
      items: cart.items,
      total: cart.total,
      shippingAddress,
      paymentStatus: 'pending'
    });
    await order.save();

    // Update inventory
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Create notification
    await Notification.create({
      user: req.user.id,
      type: 'order_status',
      message: `Your order #${order._id} has been placed successfully!`
    });

    // Clear cart
    await Cart.findByIdAndDelete(cart._id);

    res.status(201).json({ 
      message: "Order placed successfully!",
      order
    });
  } catch (error) {
    console.error("Order Creation Error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
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

// Get single order
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('products.product');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is authorized to view this order
    if (req.user.id !== order.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
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

// Update order status (admin only)
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    // Admin only
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update order status' });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.status = status;
    
    // Update delivery status if applicable
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    
    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update payment status
router.patch('/:id/payment', authenticateToken, async (req, res) => {
  try {
    const { paymentStatus, transactionId } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Only admin or the order owner can update payment
    if (req.user.id !== order.user.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this order' });
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
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: error.message });
  }
});

// Cancel order
router.patch('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Only admin or the order owner can cancel
    if (req.user.id !== order.user.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }
    
    // Cannot cancel if already delivered
    if (order.status === 'delivered') {
      return res.status(400).json({ message: 'Cannot cancel delivered order' });
    }
    
    order.status = 'cancelled';
    
    // Restore product stock
    for (const item of order.products) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }
    
    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
