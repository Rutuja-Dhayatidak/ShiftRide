const mongoose = require("mongoose");

const eventRequestSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  event_type: { type: String, default: "OTHER" },
  city: { type: String, default: null },
  start_date: { type: Date, default: null },
  end_date: { type: Date, default: null },
  start_time: { type: String, default: null },
  cars_qty: { type: Number, default: 1 },
  badge: { type: String, default: "ANY" },
  min_seats: { type: Number, default: 4 },
  billing_type: { type: String, default: "PER_DAY" },
  distance_km: { type: Number, default: null },
  pickup_location: { type: String, default: null },
  pickup_lat: { type: Number, default: null },
  pickup_lng: { type: Number, default: null },
  drop_location: { type: String, default: null },
  drop_lat: { type: Number, default: null },
  drop_lng: { type: Number, default: null },
  phone: { type: String, default: null },
  note: { type: String, default: null },
  status: { type: String, enum: ["PENDING", "CONFIRMED", "CANCELLED"], default: "PENDING" },
}, {
  collection: "event_requests",
  timestamps: { createdAt: "created_at", updatedAt: false },
});

module.exports = mongoose.model("EventRequest", eventRequestSchema);
