import User from "../models/User.js";

export const isAdmin = async (req, res, next) => {
  try {
    // Get user from previous middleware (verifyToken)
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    next();
  } catch (error) {
    console.error("Admin Middleware Error:", error);
    res.status(500).json({ error: "Server error" });
  }
}; 