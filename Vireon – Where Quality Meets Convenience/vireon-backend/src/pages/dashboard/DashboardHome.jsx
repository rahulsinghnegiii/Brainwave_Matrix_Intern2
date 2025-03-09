import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import './DashboardHome.css';

const DashboardHome = () => {
  const { isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    statistics: {
      totalProducts: 0,
      totalOrders: 0,
      totalUsers: 0,
      totalRevenue: 0
    },
    recentOrders: [],
    popularProducts: [],
    monthlyData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Add a refresh tracker to prevent multiple API calls
  const [refreshCount, setRefreshCount] = useState(0);

  // Use memoized fetch function to prevent re-renders
  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await api.get('/dashboard');
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      console.error("API not available or error:", err);
      setError("Failed to load dashboard data");
      // Keep the old data to prevent UI flicker
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Control when the dashboard data refreshes
  useEffect(() => {
    fetchDashboardData();
    
    // Optional: Set up refresh interval (uncomment if needed)
    // const interval = setInterval(fetchDashboardData, 60000); // refresh every minute
    // return () => clearInterval(interval);
  }, [fetchDashboardData, refreshCount]);

  // Memoized statistics to prevent re-renders
  const statistics = useMemo(() => {
    return dashboardData.statistics || {
      totalProducts: 0,
      totalOrders: 0,
      totalUsers: 0,
      totalRevenue: 0
    };
  }, [dashboardData.statistics]);

  // Handle manual refresh
  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
  };

  if (loading && !dashboardData.statistics) {
    return <div className="dashboard-loading">Loading dashboard data...</div>;
  }

  if (error && !dashboardData.statistics) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
        <button onClick={handleRefresh}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      
      {/* Statistics Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>Products</h3>
          <p>{statistics.totalProducts}</p>
        </div>
        <div className="stat-card">
          <h3>Orders</h3>
          <p>{statistics.totalOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Users</h3>
          <p>{statistics.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Revenue</h3>
          <p>${statistics.totalRevenue?.toFixed(2) || 0}</p>
        </div>
      </div>
      
      {/* Recent Orders */}
      <div className="recent-orders">
        <h3>Recent Orders</h3>
        <div className="orders-list">
          {dashboardData.recentOrders?.length > 0 ? (
            dashboardData.recentOrders.map(order => (
              <div key={order._id} className="order-item">
                <p>Order #{order._id?.substring(0, 8)}</p>
                <p>${order.totalAmount?.toFixed(2) || 0}</p>
                <p>{order.status}</p>
              </div>
            ))
          ) : (
            <p>No recent orders</p>
          )}
        </div>
      </div>
      
      {/* Popular Products */}
      <div className="popular-products">
        <h3>Popular Products</h3>
        <div className="products-list">
          {dashboardData.popularProducts?.length > 0 ? (
            dashboardData.popularProducts.map(product => (
              <div key={product._id} className="product-item">
                <p>{product.name}</p>
                <p>${product.price?.toFixed(2) || 0}</p>
                <p>Stock: {product.stock}</p>
              </div>
            ))
          ) : (
            <p>No products data</p>
          )}
        </div>
      </div>
      
      {loading && <div className="overlay-loader">Refreshing...</div>}
    </div>
  );
};

export default DashboardHome; 