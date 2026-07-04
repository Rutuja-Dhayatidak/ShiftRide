const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "development_secret";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "1d";

/**
 * Sign a JWT token
 */
exports.signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

/**
 * Verify a JWT token
 */
exports.verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Set token as HttpOnly cookie
 */
exports.sendTokenResponse = (payload, statusCode, res) => {
  const token = exports.signToken(payload);

  const options = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token, // Keep sending for backward compatibility/mobile
    user: payload,
  });
};

/**
 * Express middleware to protect routes
 * Checks for token in Cookie or Header
 */
exports.authMiddleware = (role = "user") => (req, res, next) => {
  let token;

  // 1. Check headers (explicit frontend client token)
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  // 2. Check cookies (fallback)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) return res.status(401).json({ message: "Not authorized to access this route" });

  try {
    const decoded = exports.verifyToken(token);

    if (role && decoded.role !== role) {
      return res.status(403).json({ message: `Forbidden: requires ${role} role` });
    }

    req.user = decoded;
    if (role === "admin") req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired session" });
  }
};
