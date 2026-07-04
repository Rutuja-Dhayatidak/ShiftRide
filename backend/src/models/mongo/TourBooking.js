const mongoose = require("mongoose");

const tourBookingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tour_id: { type: mongoose.Schema.Types.ObjectId, ref: "ToursPackage", required: true },
  booking_date: { type: Date, required: true },
  start_date: { type: Date, required: true },
  num_persons: { type: Number, required: true },
  total_amount: { type: Number, required: true },
  status: { type: String, enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"], default: "PENDING" },
}, {
  collection: "tour_bookings",
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
});

module.exports = mongoose.model("TourBooking", tourBookingSchema);
