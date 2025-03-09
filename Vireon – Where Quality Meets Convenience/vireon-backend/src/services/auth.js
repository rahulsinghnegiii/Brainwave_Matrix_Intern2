import api from './api';

// Properly implemented auth functions
export const register = async (userData) => {
  try {
    console.log('Registering user with data:', { ...userData, password: '[HIDDEN]' });
    const response = await api.post('/auth/register', userData);
    
    // If registration is successful, store token
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    // Extract the error message from the response if available
    const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
    throw new Error(errorMessage);
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    
    // Store token on successful login
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
    throw new Error(errorMessage);
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  // Return a resolved promise for consistency
  return Promise.resolve({ success: true });
};

export const verifyToken = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }
    
    const response = await api.get('/auth/verify');
    return response.data;
  } catch (error) {
    console.error('Token verification error:', error);
    // Clear token on verification failure
    localStorage.removeItem('token');
    throw error;
  }
};

// Export individual functions
export default {
  register,
  login,
  logout,
  verifyToken
}; 