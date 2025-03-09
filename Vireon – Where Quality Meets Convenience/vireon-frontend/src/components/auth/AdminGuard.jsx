import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingSpinner from '../ui/LoadingSpinner';

const AdminGuard = ({ children }) => {
  const { user, isAuthenticated, loading } = useSelector(state => state.auth);
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen message="Verifying access..." />;
  }

  if (!isAuthenticated || !user) {
    // Redirect to login with return path
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check if user has admin role
  if (!user.roles?.includes('admin')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default AdminGuard; 