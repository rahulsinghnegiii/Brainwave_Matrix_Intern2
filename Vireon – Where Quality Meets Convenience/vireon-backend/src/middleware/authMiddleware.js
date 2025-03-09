import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    // Extract token from Authorization header (handles "Bearer <token>")
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    const token = authHeader.split(" ")[1]; // Extract token after "Bearer"

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log("Decoded Token:", decoded); // Debugging

    // Ensure token contains a valid user ID
    if (!decoded.id) {
      return res.status(403).json({ message: "Invalid Token. No user ID found." });
    }

    req.user = decoded; // Attach user data to request object
    next(); // Proceed to the next middleware
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    res.status(403).json({ message: "Invalid or Expired Token." });
  }
};
