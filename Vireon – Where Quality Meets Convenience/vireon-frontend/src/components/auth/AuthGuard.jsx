import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

const AuthGuard = ({ children, requiredRole }) => {
  const location = useLocation();
  const { isAuthenticated, token } = useSelector(state => state.auth);
  const { isLoadingProfile } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Simple check without side effects to prevent loops
    const checkAuth = () => {
      // Brief timeout to prevent immediate re-renders
      setTimeout(() => {
        setIsChecking(false);
      }, 100);
    };
    
    checkAuth();
  }, []);

  if (isChecking) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && requiredRole !== 'user') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AuthGuard; 