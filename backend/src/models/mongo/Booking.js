const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  car_id: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true },
  pickup_location: { type: String, default: null },
  drop_location: { type: String, default: null },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  distance_km: { type: Number, default: null },
  rate_per_day: { type: Number, default: 0 },
  rate_per_km: { type: Number, default: 0 },
  total_amount: { type: Number, default: 0 },
  status: { type: String, default: "PENDING_PAYMENT", trim: true }, // We will use status to align with existing frontend status
  bookingStatus: { type: String, default: "PENDING_PAYMENT", trim: true },
  paymentStatus: { type: String, default: "PENDING", trim: true },
  razorpayOrderId: { type: String, default: null },
  razorpayPaymentId: { type: String, default: null },
  razorpaySignature: { type: String, default: null },
  baseFare: { type: Number, default: 0 },
  platformFee: { type: Number, default: 0 },
  gst: { type: Number, default: 0 },
  vendorAmount: { type: Number, default: 0 },
  adminAmount: { type: Number, default: 0 },
  transferStatus: { type: String, enum: ["PENDING", "SUCCESS", "FAILED"], default: "PENDING", trim: true },
  booking_mode: { type: String, enum: ["RENTAL", "TRANSFER"], default: "RENTAL" },
  billing_type: { type: String, enum: ["PER_DAY", "PER_KM"], default: "PER_DAY" },
  bookingSource: { type: String, enum: ["APP", "WEBSITE"], default: "WEBSITE", uppercase: true, trim: true },
  start_time: { type: String, default: null },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", default: null },
  driverAssigned: { type: Boolean, default: false },
  driverAssignedAt: { type: Date, default: null },
  women_safety_mode: { type: Boolean, default: false },
  customerInfo: {
    name: { type: String, default: null },
    email: { type: String, default: null },
    phone: { type: String, default: null }
  },
  otp: { type: String, default: null },
  tripStartTime: { type: Date, default: null },
  tripEndTime: { type: Date, default: null }
}, {
  collection: "bookings",
  timestamps: { createdAt: "created_at", updatedAt: false },
});

module.exports = mongoose.model("Booking", bookingSchema);
