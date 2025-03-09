import api from './api';

export const cartService = {
  // Get cart contents
  async getCart() {
    try {
      const response = await api.get('/cart');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      throw error;
    }
  },

  // Add item to cart
  async addToCart(productId, quantity = 1) {
    try {
      const response = await api.post('/cart/add', {
        productId,
        quantity
      });
      return response.data;
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  },

  // Update cart item quantity
  async updateCartItem(productId, quantity) {
    try {
      const response = await api.put('/cart/update', {
        productId,
        quantity
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update cart item:', error);
      throw error;
    }
  },

  // Remove item from cart
  async removeFromCart(productId) {
    try {
      const response = await api.delete(`/cart/remove/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      throw error;
    }
  },

  // Clear cart
  async clearCart() {
    try {
      const response = await api.delete('/cart/clear');
      return response.data;
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  },

  // Apply discount code
  async applyDiscount(code) {
    try {
      const response = await api.post('/cart/discount', { code });
      return response.data;
    } catch (error) {
      console.error('Failed to apply discount:', error);
      throw error;
    }
  },

  // Get cart summary (totals, items count, etc.)
  async getCartSummary() {
    try {
      const response = await api.get('/cart/summary');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch cart summary:', error);
      throw error;
    }
  }
};

export default cartService; 