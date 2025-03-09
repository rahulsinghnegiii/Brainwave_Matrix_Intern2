import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Destructure context values including isAdmin
  const { user, loading, error, isAdmin, login, logout, refreshUser } = context;
  
  // isAdmin is now directly from context, not derived
  const isAuthenticated = Boolean(user);
  
  return {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin, // Expose admin status
    login,
    logout,
    refreshUser
  };
}

export default useAuth; 