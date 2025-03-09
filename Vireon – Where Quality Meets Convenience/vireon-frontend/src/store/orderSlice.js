import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Async thunk for fetching orders
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders');
      return response.data;
    } catch (error) {
      // For development: mock response if endpoint doesn't exist
      if (error.response?.status === 404) {
        console.log('Using mock orders since endpoint is not available');
        return [
          {
            id: 'ORD-1001',
            customer: { id: 'CUST-101', name: 'John Doe', email: 'john@example.com' },
            items: [
              { id: 1, name: 'Smartphone X', price: 799.99, quantity: 1 },
              { id: 3, name: 'Wireless Headphones', price: 149.99, quantity: 1 }
            ],
            total: 949.98,
            status: 'delivered',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'ORD-1002',
            customer: { id: 'CUST-102', name: 'Jane Smith', email: 'jane@example.com' },
            items: [
              { id: 2, name: 'Laptop Pro', price: 1299.99, quantity: 1 }
            ],
            total: 1299.99,
            status: 'processing',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'ORD-1003',
            customer: { id: 'CUST-103', name: 'Robert Johnson', email: 'robert@example.com' },
            items: [
              { id: 4, name: 'Running Shoes', price: 89.99, quantity: 2 },
              { id: 5, name: 'Coffee Maker', price: 69.99, quantity: 1 }
            ],
            total: 249.97,
            status: 'pending',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial state
const initialState = {
  orders: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  filteredOrders: [],
  filterTerm: '',
  sortConfig: { key: 'createdAt', direction: 'desc' }
};

// Create the orders slice
const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action) => {
      state.orders = action.payload;
      state.filteredOrders = action.payload;
    },
    addOrder: (state, action) => {
      state.orders.unshift(action.payload);
      if (!state.filterTerm) {
        state.filteredOrders = state.orders;
      }
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      const orderIndex = state.orders.findIndex(order => order.id === orderId);
      if (orderIndex !== -1) {
        state.orders[orderIndex].status = status;
      }
      
      const filteredIndex = state.filteredOrders.findIndex(order => order.id === orderId);
      if (filteredIndex !== -1) {
        state.filteredOrders[filteredIndex].status = status;
      }
    },
    deleteOrder: (state, action) => {
      state.orders = state.orders.filter(order => order.id !== action.payload);
      state.filteredOrders = state.filteredOrders.filter(order => order.id !== action.payload);
    },
    filterOrders: (state, action) => {
      state.filterTerm = action.payload;
      if (!action.payload) {
        state.filteredOrders = state.orders;
      } else {
        const term = action.payload.toLowerCase();
        state.filteredOrders = state.orders.filter(order => 
          order.id.toLowerCase().includes(term) || 
          order.customer?.name?.toLowerCase().includes(term) ||
          order.status.toLowerCase().includes(term)
        );
      }
    },
    sortOrders: (state, action) => {
      const { key, direction } = action.payload;
      state.sortConfig = { key, direction };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.orders = action.payload;
        state.filteredOrders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch orders';
      });
  }
});

// Export actions and reducer
export const { 
  setOrders, 
  addOrder, 
  updateOrderStatus, 
  deleteOrder, 
  filterOrders,
  sortOrders
} = orderSlice.actions;

export default orderSlice.reducer;

// Selectors
export const selectAllOrders = (state) => state.orders.orders;
export const selectFilteredOrders = (state) => state.orders.filteredOrders;
export const selectOrdersStatus = (state) => state.orders.status;
export const selectOrdersError = (state) => state.orders.error;
export const selectOrdersSortConfig = (state) => state.orders.sortConfig; 