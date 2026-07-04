const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  driverName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, default: null, trim: true, lowercase: true },
  address: { type: String, required: true, trim: true },
  licenseNumber: { type: String, required: true, trim: true },
  experience: { type: Number, required: true, default: 0 },
  driverPhoto: { type: String, required: true }, // URL path
  licensePhoto: { type: String, required: true }, // URL path
  status: { 
    type: String, 
    enum: ["AVAILABLE", "BUSY", "INACTIVE"], 
    default: "AVAILABLE" 
  },
  isVerified: { type: Boolean, default: true },
  password: { type: String, default: null }, // Hashed password for Driver Login
  role: { type: String, default: "DRIVER" }
}, {
  collection: "drivers",
  timestamps: { createdAt: "createdAt", updatedAt: false }
});

// Auto hash password before saving if modified
const bcrypt = require("bcryptjs");
driverSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password helper
driverSchema.methods.comparePassword = async function (cand) {
  if (!this.password || !cand) return false;
  return bcrypt.compare(cand, this.password);
};

module.exports = mongoose.model("Driver", driverSchema);
