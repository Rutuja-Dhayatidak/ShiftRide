const mongoose = require("mongoose");

const cancelRequestSchema = new mongoose.Schema({
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reason: { type: String, required: true },
  message: { type: String, default: null },
  status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
  admin_note: { type: String, default: null },
  reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  reviewed_at: { type: Date, default: null },
}, {
  collection: "cancel_requests",
  timestamps: { createdAt: "created_at", updatedAt: false },
});

module.exports = mongoose.model("CancelRequest", cancelRequestSchema);
