import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ProtectedAdminRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return <div className="loading">Checking authorization...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to home/unauthorized page if authenticated but not admin
  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // If authenticated and admin, render the protected route
  return <Outlet />;
};

export default ProtectedAdminRoute; 