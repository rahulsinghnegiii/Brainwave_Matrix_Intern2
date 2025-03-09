import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <h1>Access Denied</h1>
        <div className="lock-icon">🔒</div>
        <p>You don't have permission to access this page.</p>
        <p>This area is restricted to admin users only.</p>
        <div className="button-container">
          <Link to="/" className="home-button">Return to Home</Link>
          <Link to="/login" className="login-button">Login as Admin</Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage; 