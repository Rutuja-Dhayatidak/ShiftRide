const { verifyToken } = require("../utils/jwt");

module.exports = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      console.log("carRegisterAuth.middleware: Token missing in Authorization header");
      return res.status(401).json({ message: "Token missing" });
    }

    const decoded = verifyToken(token);

    if (decoded.role !== "car_register") {
      console.log("carRegisterAuth.middleware: Forbidden - invalid role:", decoded.role);
      return res.status(403).json({ message: "Forbidden: invalid role" });
    }

    req.user = decoded; // {id,email,role}
    next();
  } catch (err) {
    console.error("carRegisterAuth.middleware verification error:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};
