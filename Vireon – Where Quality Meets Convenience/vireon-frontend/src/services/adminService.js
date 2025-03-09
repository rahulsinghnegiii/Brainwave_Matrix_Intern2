import axios from 'axios';
import { API_URL } from '../config';

// Create a mock data generator for demo purposes
const generateMockDashboardData = (timeRange) => {
  const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const getRandomGrowth = () => {
    return parseFloat((Math.random() * 20 - 10).toFixed(2));
  };

  const generateSalesTrend = () => {
    const data = [];
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 12;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      
      if (timeRange === 'week' || timeRange === 'month') {
        date.setDate(date.getDate() - (days - i - 1));
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          amount: getRandomInt(1000, 5000)
        });
      } else {
        date.setMonth(date.getMonth() - (days - i - 1));
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short' }),
          amount: getRandomInt(10000, 50000)
        });
      }
    }
    
    return data;
  };

  const generateRecentOrders = () => {
    const orders = [];
    const statuses = ['processing', 'shipped', 'delivered', 'canceled'];
    
    for (let i = 0; i < 5; i++) {
      orders.push({
        id: `ORD-${getRandomInt(100000, 999999)}`,
        date: new Date(Date.now() - getRandomInt(1, 10) * 86400000).toISOString(),
        customer: `Customer ${i + 1}`,
        amount: parseFloat((getRandomInt(50, 500) + Math.random()).toFixed(2)),
        status: statuses[getRandomInt(0, 3)]
      });
    }
    
    return orders;
  };

  const generateLowStockProducts = () => {
    const products = [];
    
    for (let i = 0; i < 5; i++) {
      products.push({
        id: `PRD-${getRandomInt(10000, 99999)}`,
        name: `Product ${i + 1}`,
        stock: getRandomInt(1, 5),
        sku: `SKU-${getRandomInt(1000, 9999)}`
      });
    }
    
    return products;
  };

  return {
    customersCount: getRandomInt(100, 1000),
    ordersCount: getRandomInt(500, 2000),
    revenue: parseFloat((getRandomInt(10000, 100000) + Math.random()).toFixed(2)),
    averageOrderValue: parseFloat((getRandomInt(50, 200) + Math.random()).toFixed(2)),
    customerGrowth: getRandomGrowth(),
    orderGrowth: getRandomGrowth(),
    revenueGrowth: getRandomGrowth(),
    aovGrowth: getRandomGrowth(),
    salesTrend: generateSalesTrend(),
    recentOrders: generateRecentOrders(),
    lowStockProducts: generateLowStockProducts()
  };
};

class AdminService {
  async getDashboardStats(timeRange = 'week') {
    // For demo or development purposes, return mock data
    if (process.env.NODE_ENV === 'development' || !API_URL) {
      return generateMockDashboardData(timeRange);
    }
    
    try {
      const response = await axios.get(`${API_URL}/admin/dashboard?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
  
  async getAnalytics(timeRange = 'month') {
    // For demo or development purposes, return mock data
    if (process.env.NODE_ENV === 'development' || !API_URL) {
      return this.generateMockAnalyticsData(timeRange);
    }
    
    try {
      const response = await axios.get(`${API_URL}/admin/analytics?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }
  
  async updateSettings(settings) {
    // For demo or development purposes, return mock success
    if (process.env.NODE_ENV === 'development' || !API_URL) {
      return settings;
    }
    
    try {
      const response = await axios.put(`${API_URL}/admin/settings`, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }
  
  async testEmailConfig(config) {
    // For demo or development purposes, return mock success
    if (process.env.NODE_ENV === 'development' || !API_URL) {
      // Simulate a potential error for incomplete configuration
      if (!config.host || !config.port || !config.username || !config.password) {
        throw new Error('Incomplete email configuration. Please fill in all fields.');
      }
      return { success: true, message: 'Email configuration test was successful' };
    }
    
    try {
      const response = await axios.post(`${API_URL}/admin/settings/test-email`, config);
      return response.data;
    } catch (error) {
      console.error('Error testing email configuration:', error);
      throw error;
    }
  }
  
  // Helper method to generate mock analytics data
  generateMockAnalyticsData(timeRange) {
    // Mock data for analytics, similar to what we have in the component
    return {
      salesOverTime: this.generateMockSalesOverTime(timeRange),
      salesByCategory: [
        { name: 'Electronics', value: 400 },
        { name: 'Clothing', value: 300 },
        { name: 'Home & Kitchen', value: 300 },
        { name: 'Books', value: 200 },
        { name: 'Sports', value: 100 },
      ],
      ordersByStatus: [
        { name: 'Pending', value: 10 },
        { name: 'Processing', value: 15 },
        { name: 'Shipped', value: 20 },
        { name: 'Delivered', value: 40 },
        { name: 'Canceled', value: 5 },
      ],
      customerAcquisition: [
        { name: 'Jan', newCustomers: 40, returningCustomers: 24 },
        { name: 'Feb', newCustomers: 30, returningCustomers: 13 },
        { name: 'Mar', newCustomers: 20, returningCustomers: 98 },
        { name: 'Apr', newCustomers: 27, returningCustomers: 39 },
        { name: 'May', newCustomers: 18, returningCustomers: 48 },
        { name: 'Jun', newCustomers: 23, returningCustomers: 38 },
        { name: 'Jul', newCustomers: 34, returningCustomers: 43 },
      ],
    };
  }
  
  generateMockSalesOverTime(timeRange) {
    const getRandomInt = (min, max) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    if (timeRange === 'week') {
      return [
        { name: 'Mon', amount: getRandomInt(1000, 5000) },
        { name: 'Tue', amount: getRandomInt(1000, 5000) },
        { name: 'Wed', amount: getRandomInt(1000, 5000) },
        { name: 'Thu', amount: getRandomInt(1000, 5000) },
        { name: 'Fri', amount: getRandomInt(1000, 5000) },
        { name: 'Sat', amount: getRandomInt(1000, 5000) },
        { name: 'Sun', amount: getRandomInt(1000, 5000) },
      ];
    } else if (timeRange === 'month') {
      return Array.from({ length: 30 }, (_, i) => ({
        name: `${i + 1}`,
        amount: getRandomInt(500, 3000)
      }));
    } else {
      return [
        { name: 'Jan', amount: getRandomInt(10000, 50000) },
        { name: 'Feb', amount: getRandomInt(10000, 50000) },
        { name: 'Mar', amount: getRandomInt(10000, 50000) },
        { name: 'Apr', amount: getRandomInt(10000, 50000) },
        { name: 'May', amount: getRandomInt(10000, 50000) },
        { name: 'Jun', amount: getRandomInt(10000, 50000) },
        { name: 'Jul', amount: getRandomInt(10000, 50000) },
        { name: 'Aug', amount: getRandomInt(10000, 50000) },
        { name: 'Sep', amount: getRandomInt(10000, 50000) },
        { name: 'Oct', amount: getRandomInt(10000, 50000) },
        { name: 'Nov', amount: getRandomInt(10000, 50000) },
        { name: 'Dec', amount: getRandomInt(10000, 50000) },
      ];
    }
  }
  
  // Other admin API methods would go here
}

export const adminService = new AdminService(); 