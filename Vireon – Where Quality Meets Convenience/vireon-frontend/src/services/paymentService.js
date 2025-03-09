import api from './api';

export const paymentService = {
  // Process a payment
  async processPayment(paymentData) {
    try {
      const response = await api.post('/payments/process', paymentData);
      return response.data;
    } catch (error) {
      console.error('Payment processing failed:', error);
      throw error;
    }
  },

  // Verify a payment (for checking status)
  async verifyPayment(paymentId) {
    try {
      const response = await api.get(`/payments/${paymentId}/verify`);
      return response.data;
    } catch (error) {
      console.error(`Failed to verify payment ${paymentId}:`, error);
      throw error;
    }
  },

  // Get saved payment methods for the current user
  async getSavedPaymentMethods() {
    try {
      const response = await api.get('/payments/methods');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      throw error;
    }
  },

  // Save a payment method for future use
  async savePaymentMethod(paymentMethod) {
    try {
      const response = await api.post('/payments/methods', paymentMethod);
      return response.data;
    } catch (error) {
      console.error('Failed to save payment method:', error);
      throw error;
    }
  },

  // Delete a saved payment method
  async deletePaymentMethod(methodId) {
    try {
      const response = await api.delete(`/payments/methods/${methodId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete payment method ${methodId}:`, error);
      throw error;
    }
  }
};

export default paymentService; 