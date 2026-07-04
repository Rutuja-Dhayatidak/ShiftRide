const { Driver } = require("../models/mongo");
const jwtUtils = require("../utils/jwt");

exports.login = async (req, res) => {
  const username = String(req.body.username || req.body.email || req.body.phone || "").trim();
  const password = String(req.body.password || "").trim();

  if (!username || !password) {
    return res.status(400).json({ message: "Username (Email/Phone) and password are required" });
  }

  try {
    // Find driver by email or phone
    const driver = await Driver.findOne({
      $or: [
        { email: username.toLowerCase() },
        { phone: username }
      ]
    });

    if (!driver) {
      return res.status(401).json({ message: "Invalid credentials (driver not found)" });
    }

    // Handle default password scenario: if driver has no password, their phone number is the default password
    if (!driver.password) {
      if (password === driver.phone) {
        // Set phone number as their password
        driver.password = password;
        await driver.save();
      } else {
        return res.status(401).json({ message: "Invalid credentials (first login uses phone number as password)" });
      }
    } else {
      const match = await driver.comparePassword(password);
      if (!match) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    }

    // Issue JWT token with payload
    const payload = {
      id: String(driver._id),
      user_id: String(driver._id),
      name: driver.driverName,
      role: "driver"
    };

    return jwtUtils.sendTokenResponse(payload, 200, res);
  } catch (err) {
    console.error("Driver login error:", err);
    return res.status(500).json({ message: "Internal server error during driver login" });
  }
};

exports.me = async (req, res) => {
  try {
    const driver = await Driver.findById(req.user.id).select("-password").populate("vendorId", "vendorName companyName phone");
    if (!driver) {
      return res.status(404).json({ message: "Driver profile not found" });
    }
    return res.json({ success: true, driver });
  } catch (err) {
    console.error("Driver profile me error:", err);
    return res.status(500).json({ message: "Failed to fetch driver profile" });
  }
};
