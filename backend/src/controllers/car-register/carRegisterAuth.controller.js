const bcrypt = require("bcryptjs");
const { User, Vendor } = require("../../models/mongo");
const jwtUtils = require("../../utils/jwt");

exports.register = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password are required" });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPhone = String(phone || "").trim();

    const emailExists = await User.findOne({ email: cleanEmail }).lean();
    if (emailExists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    if (cleanPhone) {
      const phoneExists = await User.findOne({ phone: cleanPhone }).lean();
      if (phoneExists) {
        return res.status(409).json({ message: "Phone number already registered" });
      }
    }

    const password_hash = await bcrypt.hash(String(password), 10);

    const user = await User.create({
      name: String(name).trim(),
      phone: cleanPhone,
      email: cleanEmail,
      password: password_hash,
      role: "car_register",
      status: "ACTIVE",
    });

    return res.status(201).json({
      message: "Registered successfully. Please login.",
      user: {
        id: String(user._id),
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error("car-register register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // 1. Try to find the account in Vendor collection (since registration puts them here)
    let user = await Vendor.findOne({ email: cleanEmail }).lean();
    let isVendor = !!user;

    // 2. Fallback to User collection for legacy role: "car_register"
    if (!user) {
      user = await User.findOne({ email: cleanEmail, role: "car_register" }).lean();
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Status Checks
    if (isVendor) {
      if (!user.isEmailVerified) {
        return res.status(403).json({ message: "Please verify your email first" });
      }
      if (user.isBlocked) {
        return res.status(403).json({ message: "Your account is blocked by admin" });
      }
      if (user.status === "PENDING") {
        return res.status(403).json({ message: "Your registration request is pending admin approval" });
      }
      if (user.status === "REJECTED") {
        return res.status(403).json({ message: "Your registration request has been rejected" });
      }
    } else {
      if (user.status !== "ACTIVE") {
        return res.status(403).json({ message: "Account is blocked" });
      }
    }

    // 4. Validate Password
    const ok = await bcrypt.compare(String(password), user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 5. Structure payload to keep role: "car_register" for middleware & UI compatibility
    const payload = {
      id: String(user._id),
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: "car_register",
      status: user.status,
      isVendor: isVendor,
    };

    return jwtUtils.sendTokenResponse(payload, 200, res);
  } catch (err) {
    console.error("car-register login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.me = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Look in Vendor first, then User
    let user = await Vendor.findById(userId).lean();
    if (!user) {
      user = await User.findOne({ _id: userId, role: "car_register" }).lean();
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user: {
      id: String(user._id),
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: "car_register",
      status: user.status,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }});
  } catch (err) {
    console.error("car-register me error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.logout = (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, message: "Car owner logged out successfully" });
};
