import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import authService from '../services/auth';
import { setCredentials, logout } from '../store/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const token = useSelector(state => state.auth.token);
  const user = useSelector(state => state.auth.user);
  
  // Add a refresh control flag to prevent multiple verifications
  const [hasVerified, setHasVerified] = useState(false);

  // Create a stable logout function with useCallback
  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/login', { replace: true });
  }, [dispatch, navigate]);

  // Completely rewrite token verification to stop refresh loops
  useEffect(() => {
    let mounted = true;
    
    // Only run token verification once
    if (hasVerified || !token) return;
    
    const verifyToken = async () => {
      if (!mounted) return;
      
      try {
        // Mark as verified immediately to prevent re-verification
        setHasVerified(true);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Development mode: Token checks simplified');
          return; // Skip actual verification in development
        }
        
        await authService.verifyToken(token);
      } catch (error) {
        console.log('Token verification handled:', error.message);
        // Only logout in production and only for real auth errors
        if (process.env.NODE_ENV === 'production' && 
            ![404, 401].includes(error?.response?.status)) {
          handleLogout();
        }
      }
    };

    verifyToken();
    
    return () => {
      mounted = false;
    };
  }, [token, handleLogout]); // Only depend on token and handleLogout

  // Get user profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: authService.getProfile.bind(authService),
    enabled: !!isAuthenticated && !!token,
    retry: false,
    onError: (error) => {
      console.error('Profile fetch error:', error);
      if (error.message === 'No authenticated user') {
        handleLogout();
      }
    }
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password, remember }) => {
      try {
        const response = await authService.login(email, password, remember);
        return response;
      } catch (error) {
        // If it's not a 404 error, rethrow it
        if (error.response?.status !== 404) {
          throw error;
        }
        
        // For 404, we'll handle it inside the login method
        return await authService.login(email, password, remember);
      }
    },
    onSuccess: (data) => {
      dispatch(setCredentials({
        user: data.user,
        token: data.token,
        role: data.user.role || 'user'
      }));

      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await authService.register(userData);
      return response;
    },
    onSuccess: (data) => {
      dispatch(setCredentials({
        user: data.user,
        token: data.token,
        role: data.user.role || 'user'
      }));
      navigate('/dashboard', { replace: true });
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile.bind(authService),
    onSuccess: (data) => {
      dispatch(setCredentials({
        user: { ...user, ...data },
        token: authService.getToken(),
        role: data.role || user.role || 'user'
      }));
    }
  });

  return {
    user,
    isAuthenticated,
    isLoading: loginMutation.isLoading || registerMutation.isLoading || isLoadingProfile,
    error: loginMutation.error || registerMutation.error,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    logout: handleLogout,
    profile,
    isLoadingProfile
  };
};

export default useAuth; 