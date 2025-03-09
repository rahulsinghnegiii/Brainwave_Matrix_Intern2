// Add debouncing to prevent rapid fire requests
import { debounce } from 'lodash';
import axios from 'axios';

// Debounce your API calls
export const debouncedFetchData = debounce((url, callback) => {
  fetch(url)
    .then(response => response.json())
    .then(data => callback(data))
    .catch(error => console.error(error));
}, 300); // Wait 300ms between calls 

// Create a base axios instance with defaults
const API_BASE_URL = 'http://localhost:5000/api';

// Track pending requests to prevent duplicates
const pendingRequests = new Map();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Generate a unique key for this request
    const requestKey = `${config.method}-${config.url}`;
    
    // Check if we have a pending request with the same key
    if (pendingRequests.has(requestKey)) {
      // Return the existing request instead of making a new one
      console.log(`Preventing duplicate request: ${requestKey}`);
      return pendingRequests.get(requestKey);
    }
    
    // Add token to request if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Store this request
    pendingRequests.set(requestKey, config);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Remove from pending requests
    const requestKey = `${response.config.method}-${response.config.url}`;
    pendingRequests.delete(requestKey);
    
    console.log(`API Response Success [${response.config.url}]:`, {
      status: response.status,
      data: response.data
    });
    
    return response;
  },
  (error) => {
    // Remove from pending requests
    if (error.config) {
      const requestKey = `${error.config.method}-${error.config.url}`;
      pendingRequests.delete(requestKey);
    }
    
    // Handle 401 errors by logging out
    if (error.response && error.response.status === 401) {
      console.error('Response interceptor error: 401', error.message);
      // Don't trigger a logout here to prevent infinite loop
    }
    
    return Promise.reject(error);
  }
);

export default api; 