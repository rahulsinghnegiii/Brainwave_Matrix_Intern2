import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardLayout from './components/layouts/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import OrdersPage from './pages/dashboard/OrdersPage';
import ProductsPage from './pages/dashboard/ProductsPage';
import WishlistPage from './pages/dashboard/WishlistPage';
import MessagesPage from './pages/dashboard/MessagesPage';
import HelpSupportPage from './pages/dashboard/HelpSupportPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import SettingsPage from './pages/dashboard/SettingsPage';
import AuthGuard from './components/auth/AuthGuard';
import { useEffect } from 'react';

const App = () => {
  useEffect(() => {
    // This will prevent continuous refreshes by disabling the reload
    const handleBeforeUnload = (e) => {
      if (window._isRefreshing) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window._isRefreshing = false;
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <DashboardLayout />
            </AuthGuard>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="help-support" element={<HelpSupportPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
