const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  role: { type: String, trim: true, default: null },
  message: { type: String, required: true, trim: true },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  avatar: { type: String, default: null },
  is_active: { type: Boolean, default: true },
}, {
  collection: "testimonials",
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
});

module.exports = mongoose.model("Testimonial", testimonialSchema);
