import api from './api';

export const orderService = {
  // Get all orders for the current user
  async getOrders() {
    try {
      const response = await api.get('/orders');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      throw error;
    }
  },

  // Get a single order by ID
  async getOrderById(id) {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch order ${id}:`, error);
      throw error;
    }
  },

  // Create a new order
  async createOrder(orderData) {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  },

  // Update order status (admin only)
  async updateOrderStatus(id, status) {
    try {
      const response = await api.put(`/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Failed to update order ${id} status:`, error);
      throw error;
    }
  },

  // Cancel an order
  async cancelOrder(id) {
    try {
      const response = await api.put(`/orders/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error(`Failed to cancel order ${id}:`, error);
      throw error;
    }
  },

  // Get order history with pagination
  async getOrderHistory(page = 1, limit = 10) {
    try {
      const response = await api.get(`/orders/history?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch order history:', error);
      throw error;
    }
  },

  // Track order status
  async trackOrder(id) {
    try {
      const response = await api.get(`/orders/${id}/track`);
      return response.data;
    } catch (error) {
      console.error(`Failed to track order ${id}:`, error);
      throw error;
    }
  }
};

export default orderService; 