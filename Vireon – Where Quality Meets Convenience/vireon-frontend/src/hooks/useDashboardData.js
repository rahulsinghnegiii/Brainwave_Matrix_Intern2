import { useState, useEffect } from 'react';
import orderService from '../services/orderService';
import productService from '../services/productService';

export const useDashboardData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    recentActivity: [],
    latestOrders: [],
    popularProducts: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const [ordersResponse, productsResponse] = await Promise.allSettled([
          orderService.getOrders(),
          productService.getProducts()
        ]);

        const orders = ordersResponse.status === 'fulfilled' ? ordersResponse.value?.data || [] : [];
        const products = productsResponse.status === 'fulfilled' ? productsResponse.value?.data || [] : [];

        // Process data and set state
        // ... rest of your data processing logic ...

      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { loading, error, dashboardData };
};