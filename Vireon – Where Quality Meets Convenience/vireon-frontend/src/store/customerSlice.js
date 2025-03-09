import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Async thunk for fetching customers
export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/customers');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial state
const initialState = {
  customers: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  filteredCustomers: [],
  filterTerm: ''
};

// Create the customer slice
const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    filterCustomers: (state, action) => {
      const term = action.payload.toLowerCase();
      state.filterTerm = term;
      
      if (!term) {
        state.filteredCustomers = state.customers;
      } else {
        state.filteredCustomers = state.customers.filter(customer => 
          customer.name?.toLowerCase().includes(term) || 
          customer.email?.toLowerCase().includes(term) ||
          customer.phone?.includes(term)
        );
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.customers = action.payload;
        state.filteredCustomers = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch customers';
      });
  }
});

// Export actions and reducer
export const { filterCustomers } = customerSlice.actions;
export default customerSlice.reducer;

// Selectors
export const selectAllCustomers = (state) => state.customers.customers;
export const selectFilteredCustomers = (state) => state.customers.filteredCustomers;
export const selectCustomersStatus = (state) => state.customers.status;
export const selectCustomersError = (state) => state.customers.error; 