// If your auth.js exports individual functions like this:
export const login = async (credentials) => { /* ... */ };
export const register = async (userData) => { /* ... */ };
export const logout = () => { /* ... */ };
export const verifyToken = async () => { /* ... */ };

// Instead of having all these as named exports, you might want to group them:
const authService = {
  login: async (credentials) => { /* ... */ },
  register: async (userData) => { /* ... */ },
  logout: () => { /* ... */ },
  verifyToken: async () => { /* ... */ }
};

// And then export this object:
export default authService; 