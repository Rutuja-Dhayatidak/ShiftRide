const bcrypt = require("bcryptjs");
const axios = require("axios");
const jwtUtils = require("../../utils/jwt");
const sendOTP = require("../../utils/email");
const { User } = require("../../models/mongo");

/**
 * =====================
 * USER REGISTER
 * =====================
 */
exports.register = async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const phone = String(req.body.phone || "").trim();
  const password = String(req.body.password || "");

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!/^\+?[0-9]{10,15}$/.test(phone)) {
    return res.status(400).json({ message: "Invalid phone number" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  try {
    const existingEmail = await User.findOne({ email }).lean();
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const existingPhone = await User.findOne({ phone }).lean();
    if (existingPhone) {
      return res.status(400).json({ message: "Phone already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, phone, password: hashedPassword, role: "user" });

    return res.status(201).json({ message: "Registration successful. Please login." });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Registration failed" });
  }
};

/**
 * =====================
 * USER LOGIN → SEND OTP
 * =====================
 */
exports.login = async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otp;
    user.otp_expiry = otpExpiry;
    await user.save();

    await sendOTP(user.email, otp);
    return res.json({ message: "OTP sent to your email", user_id: user._id });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
};

/**
 * =====================
 * VERIFY OTP → LOGIN
 * =====================
 */
exports.verifyOtp = async (req, res) => {
  const user_id = String(req.body.user_id || "").trim();
  const otp = String(req.body.otp || "").trim();

  if (!user_id || !otp) {
    return res.status(400).json({ message: "OTP required" });
  }

  try {
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.otp !== Number(otp)) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    if (new Date() > user.otp_expiry) {
      return res.status(401).json({ message: "OTP expired" });
    }

    user.otp = null;
    user.otp_expiry = null;
    await user.save();

    const payload = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    return jwtUtils.sendTokenResponse(payload, 200, res);
  } catch (err) {
    console.error("Verify OTP error:", err);
    return res.status(500).json({ message: "OTP verification failed" });
  }
};

exports.logout = (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, message: "Logged out successfully" });
};

/**
 * =====================
 * GOOGLE LOGIN / REGISTER
 * =====================
 */
exports.googleLogin = async (req, res) => {
  const token = req.body.token;

  if (!token) {
    return res.status(400).json({ message: "Google ID Token is required" });
  }

  try {
    // 1. Verify Google token using Google API
    const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    const payload = response.data;

    if (!payload || !payload.email) {
      return res.status(400).json({ message: "Invalid Google token payload" });
    }

    const clientID = process.env.GOOGLE_CLIENT_ID || "905195614969-0iuqje7dkqpcgpd4f3cvv7tocc6rvhn1.apps.googleusercontent.com";
    if (payload.aud !== clientID) {
      return res.status(400).json({ message: "Token client ID mismatch" });
    }

    const email = payload.email.toLowerCase().trim();
    const name = payload.name || "Google User";

    // 2. Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      // User doesn't exist, register them
      user = await User.create({
        name,
        email,
        googleId: payload.sub,
        role: "user",
        status: "ACTIVE"
      });
    } else if (!user.googleId) {
      // User exists but hasn't linked Google account, link it now
      user.googleId = payload.sub;
      await user.save();
    }

    // 3. Generate response token
    const tokenPayload = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
    };

    return jwtUtils.sendTokenResponse(tokenPayload, 200, res);
  } catch (err) {
    console.error("Google Auth error:", err.response?.data || err.message);
    return res.status(401).json({ message: "Google authentication failed" });
  }
};
