const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  phone: { type: String, trim: true, unique: true, sparse: true },
  password: { type: String, required: function() { return !this.googleId; } },
  googleId: { type: String, default: null },
  role: { type: String, default: "user", enum: ["user", "admin", "car_register"] },
  status: { type: String, enum: ["ACTIVE", "INACTIVE", "BLOCKED"], default: "ACTIVE" },
  otp: { type: Number, default: null },
  otp_expiry: { type: Date, default: null },
}, {
  collection: "users",
  timestamps: { createdAt: "created_at", updatedAt: false },
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });
userSchema.index({ googleId: 1 }, { sparse: true });

module.exports = mongoose.model("User", userSchema);
