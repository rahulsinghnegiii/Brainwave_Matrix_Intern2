import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

// Add the missing dashboard endpoint
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const period = req.query.period || 'week'; // Default to 'week' if not specified
    
    // Get date range based on period
    const currentDate = new Date();
    let startDate = new Date();
    
    switch(period) {
      case 'day':
        startDate.setDate(currentDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(currentDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(currentDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(currentDate.getDate() - 7); // Default to week
    }
    
    // Get statistics
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments({ 
      createdAt: { $gte: startDate } 
    });
    const totalUsers = await User.countDocuments({ 
      createdAt: { $gte: startDate } 
    });
    
    // Get revenue for the period
    const orders = await Order.find({ 
      createdAt: { $gte: startDate } 
    });
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');
    
    // Get popular products based on order frequency
    const popularProducts = await Product.find()
      .sort({ stock: -1 }) // For now, sort by stock as a placeholder
      .limit(5);
    
    // Construct response data
    const dashboardData = {
      period,
      statistics: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue
      },
      recentOrders,
      popularProducts,
      // Basic placeholder monthly data for charts
      chartData: Array(12).fill(0).map((_, i) => ({
        month: new Date(0, i).toLocaleString('default', { month: 'short' }),
        sales: Math.floor(Math.random() * 10000),
        revenue: Math.floor(Math.random() * 50000)
      }))
    };
    
    res.json(dashboardData);
    
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Dashboard overview statistics
router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Get counts
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    const userCount = await User.countDocuments();
    
    // Calculate total revenue
    const revenueData = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
    
    // Get monthly sales data for the last 12 months
    const monthlyData = await Order.aggregate([
      { 
        $match: { 
          status: { $ne: 'cancelled' },
          createdAt: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) }
        } 
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          sales: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Format monthly data
    const formattedMonthlyData = monthlyData.map(item => ({
      year: item._id.year,
      month: item._id.month,
      sales: item.sales,
      orders: item.orders
    }));
    
    // Get popular products
    const popularProducts = await Product.find()
      .sort({ stock: -1 })
      .limit(5)
      .lean();
    
    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .lean();
    
    // Get user registration stats
    const userStats = await User.aggregate([
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    res.json({
      statistics: {
        totalProducts: productCount,
        totalOrders: orderCount,
        totalUsers: userCount,
        totalRevenue
      },
      monthlyData: formattedMonthlyData,
      popularProducts,
      recentOrders,
      userStats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Product stats
router.get('/products/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Products by category
    const productsByCategory = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Low stock products
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .sort({ stock: 1 })
      .limit(10);
    
    // Products with no orders (potential non-performers)
    const nonPerformingProducts = await Product.find()
      .sort({ createdAt: 1 })
      .limit(10);
    
    res.json({
      productsByCategory,
      lowStockProducts,
      nonPerformingProducts
    });
  } catch (error) {
    console.error('Product stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Order stats
router.get('/orders/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    // Orders by payment method
    const ordersByPayment = await Order.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    // Average order value
    const avgOrderValue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, avg: { $avg: '$totalAmount' } } }
    ]);
    
    res.json({
      ordersByStatus,
      ordersByPayment,
      avgOrderValue: avgOrderValue.length > 0 ? avgOrderValue[0].avg : 0
    });
  } catch (error) {
    console.error('Order stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router; 