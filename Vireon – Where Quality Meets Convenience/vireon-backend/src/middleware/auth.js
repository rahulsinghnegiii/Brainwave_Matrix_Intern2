import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  console.log('Auth middleware called');
  console.log('Headers:', req.headers);
  console.log('Auth header:', authHeader);
  console.log('Token:', token ? `${token.substring(0, 10)}...` : 'No token');
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verification successful. User:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// For testing purposes, create a less-strict auth middleware
export const debugAuthenticateToken = (req, res, next) => {
  console.log('Debug auth middleware - bypassing normal auth');
  req.user = { id: 'debug-user', role: 'admin' };
  next();
}; 