const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  // Basic Details
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true, unique: true },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, required: true, trim: true },
  businessName: { type: String, required: true, trim: true },
  role: { type: String, default: "vendor" },

  // KYC Documents
  aadhaarCard: { type: String, required: true },
  panCard: { type: String, required: true },

  // Status Fields
  status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
  isBlocked: { type: Boolean, default: false },
  rejectionReason: { type: String, default: null },
  documentVerificationStatus: { type: String, enum: ["PENDING", "VERIFIED", "REJECTED"], default: "PENDING" },
  isEmailVerified: { type: Boolean, default: false },
  otp: { type: Number, default: null },
  otp_expiry: { type: Date, default: null },
  commissionPercentage: { type: Number, default: 10 },
  approvedAt: { type: Date, default: null },
  rejectedAt: { type: Date, default: null },

  // Performance Metrics
  totalCars: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  rating: { type: Number, default: 5 },
  completedBookings: { type: Number, default: 0 },

  // Bank & Payment Details
  bankDetails: {
    accountHolderName: { type: String, default: null },
    accountNumber: { type: String, default: null },
    ifscCode: { type: String, default: null },
    bankName: { type: String, default: null }
  },
  razorpayLinkedAccountId: { type: String, default: null },
  razorpayAccountStatus: { type: String, default: "PENDING" },
  canReceivePayments: { type: Boolean, default: false }
}, {
  collection: "vendors",
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

vendorSchema.index({ email: 1 }, { unique: true });
vendorSchema.index({ phone: 1 }, { unique: true });

module.exports = mongoose.model("Vendor", vendorSchema);
