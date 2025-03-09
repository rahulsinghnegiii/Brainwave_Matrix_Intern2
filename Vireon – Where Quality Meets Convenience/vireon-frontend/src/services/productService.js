import api from './api';

export const productService = {
  // Get all products with optional filters
  async getProducts(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/products${queryParams ? `?${queryParams}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  },

  // Get a single product by ID
  async getProductById(id) {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch product ${id}:`, error);
      throw error;
    }
  },

  // Create a new product (admin only)
  async createProduct(productData) {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  },

  // Update a product (admin only)
  async updateProduct(id, productData) {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update product ${id}:`, error);
      throw error;
    }
  },

  // Delete a product (admin only)
  async deleteProduct(id) {
    try {
      await api.delete(`/products/${id}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete product ${id}:`, error);
      throw error;
    }
  },

  // Get product reviews
  async getProductReviews(productId) {
    try {
      const response = await api.get(`/reviews/product/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch reviews for product ${productId}:`, error);
      throw error;
    }
  },

  // Add a product review
  async addProductReview(productId, reviewData) {
    try {
      const response = await api.post(`/reviews`, {
        productId,
        ...reviewData
      });
      return response.data;
    } catch (error) {
      console.error('Failed to add review:', error);
      throw error;
    }
  }
};

export default productService; 