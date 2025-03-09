import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import axios from 'axios';

const AdminDashboard = () => {
  const { user } = useAuth();
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        // Keep using default data structure
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  const { statistics } = dashboardData;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p className="welcome-message">Welcome back, {user?.name || 'Admin'}!</p>

      <div className="stats-overview">
        <div className="stat-card">
          <h3>Products</h3>
          <p className="stat-number">{statistics.totalProducts}</p>
          <Link to="/admin/products" className="stat-link">Manage Products</Link>
        </div>

        <div className="stat-card">
          <h3>Orders</h3>
          <p className="stat-number">{statistics.totalOrders}</p>
          <Link to="/admin/orders" className="stat-link">View Orders</Link>
        </div>

        <div className="stat-card">
          <h3>Users</h3>
          <p className="stat-number">{statistics.totalUsers}</p>
          <Link to="/admin/users" className="stat-link">Manage Users</Link>
        </div>

        <div className="stat-card">
          <h3>Revenue</h3>
          <p className="stat-number">${statistics.totalRevenue.toFixed(2)}</p>
          <Link to="/admin/reports" className="stat-link">View Reports</Link>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="recent-orders section">
          <h2>Recent Orders</h2>
          {dashboardData.recentOrders.length > 0 ? (
            <div className="order-list">
              {dashboardData.recentOrders.map(order => (
                <div key={order._id} className="order-item">
                  <div className="order-id">Order #{order._id.substring(0, 8)}</div>
                  <div className="order-customer">{order.user?.name || 'Customer'}</div>
                  <div className="order-amount">${order.totalAmount.toFixed(2)}</div>
                  <div className={`order-status status-${order.status}`}>{order.status}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No recent orders</p>
          )}
          <Link to="/admin/orders" className="view-all">View All Orders</Link>
        </div>

        <div className="popular-products section">
          <h2>Popular Products</h2>
          {dashboardData.popularProducts.length > 0 ? (
            <div className="product-list">
              {dashboardData.popularProducts.map(product => (
                <div key={product._id} className="product-item">
                  <div className="product-name">{product.name}</div>
                  <div className="product-price">${product.price.toFixed(2)}</div>
                  <div className="product-stock">
                    <span className={product.stock < 10 ? 'low-stock' : ''}>
                      In Stock: {product.stock}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No product data available</p>
          )}
          <Link to="/admin/products" className="view-all">View All Products</Link>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 