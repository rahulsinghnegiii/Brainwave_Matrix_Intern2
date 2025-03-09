import React, { createContext, useState, useEffect, useCallback } from 'react';
import { verifyToken, login as loginApi, logout as logoutApi } from '../services/auth.js';

export const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Prevent infinite refresh with token check flag
  const [tokenVerified, setTokenVerified] = useState(false);
  // Explicitly track admin status
  const [isAdmin, setIsAdmin] = useState(false);

  // Use memoized token verification to prevent re-renders
  const checkToken = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Skip verification if no token exists
      if (!token) {
        setUser(null);
        setIsAdmin(false);
        setTokenVerified(true);
        return;
      }
      
      const userData = await verifyToken();
      setUser(userData);
      
      // Check if user has admin role and update isAdmin state
      setIsAdmin(userData?.role === 'admin');
    } catch (err) {
      console.error('Token verification failed:', err);
      // Clear invalid token
      localStorage.removeItem('token');
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
      setTokenVerified(true);
    }
  }, []);

  // Only verify token once on mount or when explicitly required
  useEffect(() => {
    if (!tokenVerified) {
      checkToken();
    }
    
    // Don't add checkToken as dependency - it will cause infinite loop
  }, [tokenVerified]);
  
  // Login function with proper error handling
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const data = await loginApi(credentials);
      setUser(data.user);
      
      // Update admin status based on user role
      setIsAdmin(data.user?.role === 'admin');
      
      return data;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = useCallback(() => {
    logoutApi();
    setUser(null);
    setIsAdmin(false);
  }, []);

  // Provide a refresh function that components can call if needed
  const refreshUser = useCallback(() => {
    setTokenVerified(false); // This will trigger the useEffect
  }, []);

  const contextValue = {
    user,
    loading,
    error,
    isAdmin, // Expose admin status to all components
    login,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider; 