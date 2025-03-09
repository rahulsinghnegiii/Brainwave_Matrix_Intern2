import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_DELAY = 500; // 500ms base delay
const MAX_DELAY = 3000; // 3 seconds max delay

console.log('API Base URL:', baseURL);

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log outgoing requests (excluding sensitive data)
    const logData = { ...config.data };
    if (logData.password) {
      logData.password = '[HIDDEN]';
    }
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: logData
    });
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Helper function to delay execution with exponential backoff
const calculateDelay = (retryCount) => {
  return Math.min(BASE_DELAY * Math.pow(1.5, retryCount), MAX_DELAY);
};

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    // Make sure we're not modifying the response structure
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // Log the raw response for debugging
      console.log('Raw login response:', {
        status: response.status,
        headers: response.headers,
        data: response.data
      });
      
      // Handle different response formats
      const responseData = response.data || response;
      console.log('Processed response data:', responseData);
      
      // Try different possible response structures
      const token = 
        responseData.token || 
        responseData.data?.token || 
        responseData.accessToken ||
        responseData.data?.accessToken;
      
      const user = 
        responseData.user || 
        responseData.data?.user || 
        responseData.userData || 
        responseData.data?.userData ||
        // If we have a token but no user object, create a minimal user object
        (token ? { id: responseData.userId || 'unknown' } : null);
      
      // Log extracted data
      console.log('Extracted auth data:', {
        hasToken: !!token,
        hasUser: !!user,
        responseKeys: Object.keys(responseData),
        userKeys: user ? Object.keys(user) : []
      });
      
      if (!token) {
        throw new Error('Authentication token is missing in the response');
      }
      
      if (!user) {
        throw new Error('User data is missing in the response');
      }
      
      return {
        token,
        user
      };
    } catch (error) {
      // Enhanced error logging
      console.error('Login API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        responseKeys: error.response?.data ? Object.keys(error.response.data) : []
      });
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      // Log the full request URL
      console.log('Registration endpoint:', `${baseURL}/auth/register`);
      
      // Log the request data
      console.log('Registration request data:', {
        ...userData,
        password: '[HIDDEN]'
      });
      
      const response = await api.post('/auth/register', userData);
      
      // Log the raw response
      console.log('Raw registration response:', {
        status: response.status,
        headers: response.headers,
        data: response.data
      });
      
      // Handle both possible response formats
      const responseData = response.data || response;
      
      // Log the processed response data
      console.log('Processed registration response:', responseData);
      
      if (!responseData) {
        throw new Error('Empty response received from server');
      }
      
      if (typeof responseData !== 'object') {
        throw new Error(`Invalid response format: Expected object, got ${typeof responseData}`);
      }
      
      // Check for error messages in the response
      if (responseData.error || responseData.message) {
        throw new Error(responseData.error || responseData.message);
      }
      
      // Validate user data in response
      if (!responseData.user) {
        console.error('Invalid registration response structure:', responseData);
        throw new Error('Registration successful but user data is missing');
      }
      
      return {
        user: responseData.user,
        message: responseData.message || 'Registration successful'
      };
    } catch (error) {
      // Enhanced error logging
      console.error('Registration failed:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
      });
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        const message = error.response.data?.message || 'Invalid registration data';
        throw new Error(`Validation error: ${message}`);
      }
      
      if (error.response?.status === 409) {
        throw new Error('An account with this email already exists');
      }
      
      if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later');
      }
      
      // Re-throw the error with a user-friendly message
      throw new Error(error.message || 'Failed to create account. Please try again');
    }
  },
  
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      
      if (!response?.user) {
        throw new Error('Invalid profile response: Missing user data');
      }
      
      return response.user;
    } catch (error) {
      console.error('Get Profile API Error:', {
        message: error.message,
        status: error.response?.status
      });
      throw error;
    }
  },
  
  updateProfile: async (data) => {
    try {
      const response = await api.put('/auth/profile', data);
      
      if (!response?.user) {
        throw new Error('Invalid profile update response: Missing user data');
      }
      
      return response.user;
    } catch (error) {
      console.error('Update Profile API Error:', {
        message: error.message,
        status: error.response?.status
      });
      throw error;
    }
  },
};

export default api;