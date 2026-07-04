const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  car_id: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true },
  message: { type: String, default: null },
  rating: { type: Number, required: true },
}, {
  collection: "feedback",
  timestamps: { createdAt: "created_at", updatedAt: false },
});

module.exports = mongoose.model("Feedback", feedbackSchema);
