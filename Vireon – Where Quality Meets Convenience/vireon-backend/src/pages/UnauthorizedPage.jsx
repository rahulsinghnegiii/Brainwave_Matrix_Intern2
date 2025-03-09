import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div className="unauthorized-container">
      <h1>Access Denied</h1>
      <p>You don't have permission to access this page.</p>
      <p>This area is restricted to admin users only.</p>
      <Link to="/" className="btn btn-primary">
        Return to Home
      </Link>
    </div>
  );
};

export default UnauthorizedPage; 