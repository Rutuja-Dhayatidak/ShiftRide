const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  file_path: { type: String, required: true },
  type: { type: String, enum: ["STORY", "HERO_BACKGROUND", "CARS_BG", "EVENTS_BG", "BOOKING_BG"], default: "STORY" },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
}, {
  collection: "media",
  timestamps: false,
});

module.exports = mongoose.model("Media", mediaSchema);
