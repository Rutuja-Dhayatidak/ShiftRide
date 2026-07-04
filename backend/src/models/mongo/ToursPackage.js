const mongoose = require("mongoose");

const toursPackageSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: null },
  duration: { type: String, default: null },
  price: { type: Number, default: 0 },
  images: { type: String, default: null },
  routes: { type: String, default: null },
  itinerary: { type: String, default: null },
  inclusions: { type: String, default: null },
  exclusions: { type: String, default: null },
  tour_date: { type: Date, default: null },
  tour_time: { type: String, default: null },
  status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
  created_by: { type: mongoose.Schema.Types.ObjectId, default: null },
  created_by_role: { type: String, enum: ["ADMIN", "CAR_REGISTER"], default: "ADMIN" },
  is_active: { type: Boolean, default: true },
}, {
  collection: "tours_packages",
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
});

module.exports = mongoose.model("ToursPackage", toursPackageSchema);
