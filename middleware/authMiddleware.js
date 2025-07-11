const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ✅ Middleware to Authenticate User
const authenticateToken = async (req, res, next) => {
  try {

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Unauthorized: No token provided" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password"); // Fetch user from DB

    if (!user) return res.status(401).json({ message: "Unauthorized: User not found" });

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(403).json({ message: "Forbidden: Invalid or expired token" });
  }
};

// ✅ Middleware to Check if User is Admin
const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

module.exports = { authenticateToken, isAdmin };
