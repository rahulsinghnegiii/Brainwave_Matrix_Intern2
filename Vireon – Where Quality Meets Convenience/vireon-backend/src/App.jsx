import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import UnauthorizedPage from './pages/auth/UnauthorizedPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductsPage from './pages/dashboard/ProductsPage';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        {/* Protected routes for authenticated users */}
        <Route element={<ProtectedRoute />}>
          <Route path="/products" element={<ProductsPage />} />
          {/* Other user routes */}
        </Route>
        
        {/* Protected routes for admin users only */}
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<ProductsPage />} />
          {/* Other admin routes */}
        </Route>
      </Routes>
    </Router>
  );
};

export default App; 