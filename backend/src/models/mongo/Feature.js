const mongoose = require("mongoose");

const featureSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  icon: { type: String, default: "Car" },
  bgClass: { type: String, default: "bg-[#00D1B2]" },
  glowClass: { type: String, default: "shadow-[0_0_20px_rgba(0,209,178,0.5)] ring-[6px] ring-[#00D1B2]/20" },
  bgCircle: { type: String, default: "bg-[#00D1B2]/10" },
  img: { type: String, required: true },
}, {
  collection: "features",
  timestamps: { createdAt: "created_at", updatedAt: false },
});

module.exports = mongoose.model("Feature", featureSchema);
