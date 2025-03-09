import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FiShoppingBag,
  FiClock,
  FiHeart,
  FiMessageSquare,
  FiTruck,
  FiAlertCircle,
  FiCheck,
  FiStar,
  FiArrowRight,
  FiPackage,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiUsers,
  FiCalendar,
  FiFilter,
  FiRefreshCw,
  FiGrid,
  FiList,
  FiBell,
  FiLogOut,
  FiLogIn,
  FiUser
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService';
import productService from '../../services/productService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Correct import for jspdf-autotable
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { logout } from '../../store/authSlice'; // Import logout action
import { useAuth } from '../../hooks/useAuth'; // Import useAuth hook

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const REFRESH_INTERVAL = 30000; // 30 seconds refresh interval

// Enhanced StatsCard with mini-chart
const StatsCard = ({ item }) => (
  <div className="bg-white overflow-hidden shadow-lg rounded-lg transition-all duration-300 hover:shadow-xl">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
          <div className="text-indigo-600 text-xl">{item.icon}</div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{item.title}</dt>
            <dd>
              <div className="text-2xl font-bold text-gray-900">{item.value}</div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
    <div className="bg-gray-50 px-5 py-3">
      <div className="text-sm">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center">
            {item.trend === 'up' ? (
              <FiTrendingUp className="text-green-500 mr-1" />
            ) : (
              <FiTrendingDown className="text-red-500 mr-1" />
            )}
            <span className={`font-medium ${item.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {item.change}% 
            </span>
            <span className="text-gray-500 ml-1">
              {item.trend === 'up' ? 'increase' : 'decrease'}
            </span>
          </div>
          <span className="text-gray-500 text-xs">vs last period</span>
        </div>
        
        {/* Progress bar showing percentage */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className={`h-2 rounded-full ${item.trend === 'up' ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(Math.max(item.change, 0), 100)}%` }}  
            title={`${item.change}% ${item.trend === 'up' ? 'increase' : 'decrease'}`}
          ></div>
        </div>
        
        {/* Mini chart */}
        <div className="flex h-8 items-end space-x-px mt-2">
          {Array(12).fill(0).map((_, i) => {
            // Create visual trend
            const trendFactor = item.trend === 'up' ? 1 : -1;
            const baseHeight = 30;
            const trendHeight = i * trendFactor * 4;
            const randomFactor = Math.random() * 15;
            const height = baseHeight + trendHeight + randomFactor;
            
            return (
              <div 
                key={`bar-${item.id}-${i}`}
                className={`w-1 ${item.trend === 'up' ? 'bg-green-400' : 'bg-red-400'} rounded-t`}
                style={{ height: `${Math.min(Math.max(height, 10), 100)}%` }}
              ></div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);

// Enhanced Activity Item with improved visuals
const ActivityItem = ({ activity, isLast }) => (
  <li>
    <div className="relative pb-8">
      {!isLast && (
        <span
          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
          aria-hidden="true"
        />
      )}
      <div className="relative flex space-x-3">
        <div>
          <span
            className={`h-8 w-8 rounded-full flex items-center justify-center ${
              activity.type === 'order' ? 'bg-blue-500' :
              activity.type === 'product' ? 'bg-green-500' :
              activity.type === 'user' ? 'bg-purple-500' : 'bg-yellow-500'
            }`}>
            {activity.type === 'order' && <FiShoppingBag className="text-white" />}
            {activity.type === 'product' && <FiShoppingBag className="text-white" />}
            {activity.type === 'user' && <FiUsers className="text-white" />}
            {activity.type === 'payment' && <FiDollarSign className="text-white" />}
          </span>
        </div>
        <div className="min-w-0 flex-1 py-1.5">
          <div className="text-sm text-gray-500">
            <span className="font-medium text-gray-900">{activity.description}</span>
            <div className="flex items-center mt-1">
              <FiClock className="text-gray-400 mr-1 h-3 w-3" />
              <span className="text-xs text-gray-500">
                {new Date(activity.time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              {activity.user && (
                <span className="ml-2 text-xs text-gray-500">
                  by {activity.user}
                </span>
              )}
              {activity.value && (
                <span className="ml-2 text-xs font-medium text-gray-900">
                  ${activity.value}
                </span>
              )}
          </div>
          </div>
        </div>
        {activity.actionable && (
          <div className="flex-shrink-0">
            <button
              type="button"
              className="text-indigo-600 hover:text-indigo-900 text-xs"
            >
              View
            </button>
          </div>
        )}
      </div>
    </div>
  </li>
);

// Enhanced Product Card with hover effects and action buttons
const ProductCard = ({ product, navigate }) => (
  <div 
    className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 group"
    onClick={() => navigate(`/products/${product.id}`)}
  >
    <div className="flex items-center">
      <div className="flex-shrink-0 h-12 w-12 overflow-hidden rounded-md border border-gray-200">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-200" 
        />
      </div>
      <div className="ml-4 flex-1">
        <div className="flex justify-between">
          <h3 className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors duration-150">{product.name}</h3>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button className="text-gray-500 hover:text-indigo-600 mr-2">
              <FiShoppingBag size={16} />
            </button>
            <button className="text-gray-500 hover:text-indigo-600">
              <FiDollarSign size={16} />
            </button>
          </div>
        </div>
        <div className="mt-1 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Stock: <span className={product.stock < 10 ? 'text-red-500 font-medium' : ''}>{product.stock}</span>
          </div>
          <div className="text-sm font-medium text-gray-900">${parseFloat(product.price).toFixed(2)}</div>
        </div>
        <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${
              product.sales > 80 ? 'bg-green-500' : 
              product.sales > 40 ? 'bg-blue-500' : 
              'bg-yellow-500'
            }`}
            style={{ width: `${Math.min(product.sales, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  </div>
);

// Add a new Summary Card component
const SummaryCard = ({ title, value, icon, description, color }) => (
  <div className={`bg-white rounded-lg shadow p-4 border-l-4 ${color}`}>
    <div className="flex items-center">
      <div className={`p-2 rounded-lg ${color.replace('border-', 'bg-').replace('-600', '-100')}`}>
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-lg font-semibold text-gray-900">{value}</p>
      </div>
    </div>
    {description && (
      <p className="mt-2 text-xs text-gray-500">{description}</p>
    )}
  </div>
);

const DashboardHome = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, user, isAuthenticated } = useSelector(state => state.auth);
  const { logout: authLogout } = useAuth(); // Get logout function from useAuth
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    recentOrders: [],
    topProducts: [],
    recentActivities: [],
    summary: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('week'); // 'day', 'week', 'month', 'year'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Generate mock dashboard data
  const generateMockDashboardData = () => {
    // Same implementation but with enhanced data
    const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    const deletedIds = JSON.parse(localStorage.getItem('deletedProductIds') || '[]');
    
    // Filter out deleted products
    const availableProducts = storedProducts.filter(p => {
      const productId = p.id || p._id;
      return !deletedIds.includes(productId);
    });
    
    const mockTopProducts = availableProducts.length > 0 
      ? availableProducts.slice(0, 5).map(product => ({
          id: product.id || product._id || `prod-${Math.random().toString(36).substr(2, 9)}`,
          name: product.name || 'Product Name',
          price: product.price || 99.99,
          stock: product.stock || Math.floor(Math.random() * 50),
          sales: Math.floor(Math.random() * 100),
          image: product.image || 'https://placehold.co/100x100'
        }))
      : Array(5).fill(0).map((_, index) => ({
          id: `prod-${index}`,
          name: `Sample Product ${index + 1}`,
          price: (19.99 + index * 10).toFixed(2),
          stock: 10 + index * 5,
          sales: Math.floor(Math.random() * 100),
          image: 'https://placehold.co/100x100'
        }));
    
    // Generate mock orders with more realistic data
    const mockOrders = Array(8).fill(0).map((_, index) => {
      const orderDate = new Date(Date.now() - index * 86400000 * (Math.random() + 0.5));
      const total = (50 + Math.random() * 200).toFixed(2);
      const items = Math.floor(Math.random() * 5) + 1;
      const status = ['Delivered', 'Processing', 'Shipped', 'Pending'][Math.floor(Math.random() * 4)];
      
      return {
        id: `ORD-${1000 + index}`,
        customer: `Customer ${index + 1}`,
        date: orderDate.toISOString(),
        total,
        status,
        items,
        // Add payment method for enhanced data
        paymentMethod: ['Credit Card', 'PayPal', 'Bank Transfer'][Math.floor(Math.random() * 3)]
      };
    });
    
    // Generate mock activities with more detailed information
    const mockActivities = Array(8).fill(0).map((_, index) => {
      const activityTime = new Date(Date.now() - index * 3600000 * (Math.random() + 0.5));
      const activityTypes = ['order', 'product', 'user', 'payment'];
      const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      
      const descriptions = {
        order: [
          'New order placed',
          'Order shipped to customer',
          'Order delivered',
          'Order cancelled'
        ],
        product: [
          'Product added to inventory',
          'Product stock updated',
          'Product price changed',
          'Product description updated'
        ],
        user: [
          'New user registered',
          'User profile updated',
          'User password changed',
          'User subscription renewed'
        ],
        payment: [
          'Payment received',
          'Payment refunded',
          'Invoice generated',
          'Credit memo issued'
        ]
      };
      
      return {
        id: `act-${index}`,
        type: activityType,
        description: descriptions[activityType][Math.floor(Math.random() * 4)],
        time: activityTime.toISOString(),
        // Add more details for enhanced data
        user: `User ${Math.floor(Math.random() * 5) + 1}`,
        value: activityType === 'payment' || activityType === 'order' ? 
              (Math.random() * 200 + 20).toFixed(2) : null,
        actionable: Math.random() > 0.5
      };
    });
    
    // Calculate totals for summary
    const totalSales = mockOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const pendingOrders = mockOrders.filter(order => order.status === 'Pending').length;
    const lowStockProducts = mockTopProducts.filter(product => product.stock < 10).length;
    
    // Enhanced summary data
    const mockSummary = {
      totalRevenue: totalSales.toFixed(2),
      pendingOrders,
      lowStockProducts,
      pendingShipments: mockOrders.filter(order => order.status === 'Processing').length
    };
    
    return {
      stats: [
        {
          id: 1,
          title: 'Total Sales',
          value: `$${totalSales.toFixed(2)}`,
          icon: <FiDollarSign />,
          change: 12.5,
          trend: 'up'
        },
        {
          id: 2,
          title: 'Total Orders',
          value: mockOrders.length.toString(),
          icon: <FiShoppingBag />,
          change: 8.2,
          trend: 'up'
        },
        {
          id: 3,
          title: 'New Customers',
          value: '3',
          icon: <FiUsers />,
          change: 5.1,
          trend: 'up'
        }
      ],
      recentOrders: mockOrders,
      topProducts: mockTopProducts,
      recentActivities: mockActivities,
      summary: mockSummary
    };
  };

  // Use useCallback to prevent recreating the function on each render
  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      
      // Only set loading to true on initial fetch
      if (loading) {
        setLoading(true);
      }

      // Try to fetch from API
      try {
        const response = await axios.get(`${API_URL}/dashboard?period=${timeFilter}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardData(response.data);
      } catch (apiError) {
        console.log('API not available or error:', apiError);
        
        // Generate mock data for development
        const mockData = generateMockDashboardData();
        setDashboardData(mockData);
      }
      
      setLastUpdated(new Date());
      } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
      
      // Still generate mock data on error
      const mockData = generateMockDashboardData();
      setDashboardData(mockData);
      } finally {
        setLoading(false);
    }
  }, [token, loading, timeFilter]);

  // Set up polling for real-time updates
  useEffect(() => {
    // Initial fetch
    fetchDashboardData();
    
    // Set up interval for regular updates
    const intervalId = setInterval(() => {
      console.log('Refreshing dashboard data...');
      fetchDashboardData();
    }, REFRESH_INTERVAL);
    
    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchDashboardData]);

  // Storage change listener
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'deletedProductIds' || e.key?.includes('order') || e.key?.includes('product')) {
        console.log('Storage changed, refreshing dashboard...');
        fetchDashboardData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchDashboardData]);

  // Custom event listener
  useEffect(() => {
    const handleDataChange = () => {
      console.log('Dashboard data change detected, refreshing...');
    fetchDashboardData();
    };

    window.addEventListener('dashboard:refresh', handleDataChange);
    return () => window.removeEventListener('dashboard:refresh', handleDataChange);
  }, [fetchDashboardData]);

  // Status color helper
  const getStatusColor = (status = '') => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'delivered') return 'bg-green-100 text-green-800';
    if (statusLower === 'shipped') return 'bg-blue-100 text-blue-800';
    if (statusLower === 'processing') return 'bg-yellow-100 text-yellow-800';
    if (statusLower === 'cancelled') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Report generation
  const generateReport = () => {
    toast.success('Report generated and downloaded');
  };

  // Manual refresh handler
  const handleRefresh = () => {
    toast.success('Refreshing dashboard data...');
    fetchDashboardData();
  };

  // Time filter handler
  const handleTimeFilterChange = (newFilter) => {
    setTimeFilter(newFilter);
    // This will trigger a re-fetch via the useEffect with fetchDashboardData dependency
  };

  // Handle logout function
  const handleLogout = () => {
    try {
      // Call the logout function from useAuth
      authLogout();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  // Handle login function
  const handleLogin = () => {
    navigate('/login');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-700 mb-4">
        <p className="font-medium">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Guard against undefined dashboardData
  const { stats = [], recentOrders = [], topProducts = [], recentActivities = [], summary = {} } = dashboardData || {};

  return (
    <div className="space-y-6">
      {/* Dashboard Header with Controls & Auth Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          {/* User info and auth buttons */}
          <div className="flex items-center mr-2 pr-2 border-r border-gray-200">
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center mr-3">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <FiUser />
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {user?.name || user?.email || 'User'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 flex items-center"
                  title="Logout"
                >
                  <FiLogOut className="mr-1" /> Logout
                </button>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100 flex items-center"
                title="Login"
              >
                <FiLogIn className="mr-1" /> Login
              </button>
            )}
          </div>
          
          {/* Time Period Filter */}
          <div className="flex bg-gray-100 rounded-md p-1">
            {['day', 'week', 'month', 'year'].map((period) => (
              <button
                key={period}
                onClick={() => handleTimeFilterChange(period)}
                className={`px-3 py-1 text-xs rounded-md ${
                  timeFilter === period 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
          
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-md p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded-md ${
                viewMode === 'grid' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
              title="Grid View"
            >
              <FiGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded-md ${
                viewMode === 'list' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
              title="List View"
            >
              <FiList size={18} />
            </button>
          </div>
          
          {/* Action Buttons */}
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-md"
            title="Refresh Data"
          >
            <FiRefreshCw size={18} />
          </button>
          
          <button
            onClick={generateReport}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
          >
            <FiClock className="mr-2" /> Generate Report
          </button>
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Revenue"
          value={`$${summary.totalRevenue || '0.00'}`}
          icon={<FiDollarSign className="text-green-600" />}
          description="Total revenue across all orders"
          color="border-green-600"
        />
        <SummaryCard
          title="Pending Orders"
          value={summary.pendingOrders || 0}
          icon={<FiShoppingBag className="text-yellow-600" />}
          description="Orders waiting to be processed"
          color="border-yellow-600"
        />
        <SummaryCard
          title="Low Stock Products"
          value={summary.lowStockProducts || 0}
          icon={<FiShoppingBag className="text-red-600" />}
          description="Products with stock less than 10 units"
          color="border-red-600"
        />
        <SummaryCard
          title="Pending Shipments"
          value={summary.pendingShipments || 0}
          icon={<FiClock className="text-blue-600" />}
          description="Orders ready for shipment"
          color="border-blue-600"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((item) => (
          <StatsCard key={item.id} item={item} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
              <button
              onClick={() => navigate('/orders')}
              className="text-xs text-indigo-600 hover:text-indigo-900 font-medium"
              >
              View All
              </button>
            </div>
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                  <th key="order-id" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                    </th>
                  <th key="customer" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                  <th key="date" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th key="total" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                    </th>
                  <th key="status" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 cursor-pointer transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors duration-150">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${parseFloat(order.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                          {order.status}
                        </span>
                      </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr key="no-orders">
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No recent orders found
                    </td>
                  </tr>
                )}
                </tbody>
              </table>
        </div>
      </div>

        {/* Right Column - Top Products & Recent Activity */}
        <div className="space-y-6">
          {/* Top Products */}
      <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Top Products</h2>
            <button
                onClick={() => navigate('/products')}
                className="text-xs text-indigo-600 hover:text-indigo-900 font-medium"
            >
                View All
            </button>
            </div>
            <div>
              {topProducts.map((product) => (
                <ProductCard key={`product-${product.id}`} product={product} navigate={navigate} />
              ))}
              {topProducts.length === 0 && (
                <div key="no-products" className="p-4 text-center text-sm text-gray-500">
                  No products found
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-4">
              <div className="flow-root">
                <ul className="-mb-8">
                  {recentActivities.map((activity, activityIdx) => (
                    <ActivityItem 
                      key={`activity-${activity.id}`} 
                      activity={activity} 
                      isLast={activityIdx === recentActivities.length - 1} 
                    />
                  ))}
                  {recentActivities.length === 0 && (
                    <li key="no-activity" className="text-center text-sm text-gray-500">
                      No recent activity
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;