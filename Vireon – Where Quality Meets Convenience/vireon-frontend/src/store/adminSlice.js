import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Async thunk for fetching dashboard stats
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      // For development: mock data if endpoint doesn't exist
      if (error.response?.status === 404) {
        return {
          totalRevenue: 45980.75,
          newCustomers: 128,
          pendingOrders: 23,
          totalOrders: 1432,
          revenueData: [
            { name: 'Jan', revenue: 4000 },
            { name: 'Feb', revenue: 3000 },
            { name: 'Mar', revenue: 5000 },
            { name: 'Apr', revenue: 4800 },
            { name: 'May', revenue: 6000 },
            { name: 'Jun', revenue: 5500 },
          ]
        };
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for fetching analytics data
export const fetchAnalytics = createAsyncThunk(
  'admin/fetchAnalytics',
  async (timeRange = 'month', { rejectWithValue }) => {
    try {
      const response = await adminService.getAnalytics(timeRange);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to load analytics data');
    }
  }
);

// Async thunk for updating settings
export const updateSettings = createAsyncThunk(
  'admin/updateSettings',
  async (settings, { rejectWithValue }) => {
    try {
      const response = await adminService.updateSettings(settings);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update settings');
    }
  }
);

// Async thunk for testing email configuration
export const testEmailConfig = createAsyncThunk(
  'admin/testEmailConfig',
  async (config, { rejectWithValue }) => {
    try {
      const response = await adminService.testEmailConfig(config);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to test email configuration');
    }
  }
);

// Initial state
const initialState = {
  dashboardStats: {
    totalRevenue: 0,
    newCustomers: 0,
    pendingOrders: 0,
    totalOrders: 0,
    revenueData: []
  },
  status: 'idle',
  error: null
};

// Create the admin slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch dashboard stats';
      });
  }
});

export default adminSlice.reducer;

// Selectors
export const selectDashboardStats = (state) => state.admin.dashboardStats;
export const selectAdminStatus = (state) => state.admin.status;
export const selectAdminError = (state) => state.admin.error; 