import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Async thunk for fetching products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/products');
      return response.data;
    } catch (error) {
      // For development: mock response if endpoint doesn't exist
      if (error.response?.status === 404) {
        console.log('Using mock products since endpoint is not available');
        return [
          { id: 1, name: 'Smartphone X', price: 799.99, category: 'Electronics', stock: 45, image: 'https://placehold.co/200x200' },
          { id: 2, name: 'Laptop Pro', price: 1299.99, category: 'Electronics', stock: 20, image: 'https://placehold.co/200x200' },
          { id: 3, name: 'Wireless Headphones', price: 149.99, category: 'Electronics', stock: 100, image: 'https://placehold.co/200x200' },
          { id: 4, name: 'Running Shoes', price: 89.99, category: 'Clothing', stock: 75, image: 'https://placehold.co/200x200' },
          { id: 5, name: 'Coffee Maker', price: 69.99, category: 'Kitchen', stock: 30, image: 'https://placehold.co/200x200' }
        ];
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial state
const initialState = {
  products: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  filteredProducts: [],
  filterTerm: ''
};

// Create the products slice
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    filterProducts: (state, action) => {
      const term = action.payload.toLowerCase();
      state.filterTerm = term;
      
      if (!term) {
        state.filteredProducts = state.products;
      } else {
        state.filteredProducts = state.products.filter(product => 
          product.name?.toLowerCase().includes(term) || 
          product.category?.toLowerCase().includes(term)
        );
      }
    },
    addProduct: (state, action) => {
      state.products.push(action.payload);
      if (!state.filterTerm) {
        state.filteredProducts = state.products;
      }
    },
    updateProduct: (state, action) => {
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
      // Update filtered products as well
      const filteredIndex = state.filteredProducts.findIndex(p => p.id === action.payload.id);
      if (filteredIndex !== -1) {
        state.filteredProducts[filteredIndex] = action.payload;
      }
    },
    deleteProduct: (state, action) => {
      state.products = state.products.filter(p => p.id !== action.payload);
      state.filteredProducts = state.filteredProducts.filter(p => p.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products = action.payload;
        state.filteredProducts = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch products';
      });
  }
});

// Export actions and reducer
export const { filterProducts, addProduct, updateProduct, deleteProduct } = productSlice.actions;
export default productSlice.reducer;

// Selectors
export const selectAllProducts = (state) => state.products.products;
export const selectFilteredProducts = (state) => state.products.filteredProducts;
export const selectProductsStatus = (state) => state.products.status;
export const selectProductsError = (state) => state.products.error; 