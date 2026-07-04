const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  brand: { type: String, trim: true, default: null },
  car_details: { type: String, default: null },
  cars_image: { type: String, default: null },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  vehicle_type: { type: String, enum: ["CAR", "BUS"], default: "CAR" },
  price_per_day: { type: Number, default: 0 },
  price_per_km: { type: Number, required: true },
  is_available: { type: Boolean, default: true },
  city: { type: String, trim: true, default: null },
  year: { type: Number, default: null },
  seats: { type: Number, default: null },
  fuel_type: { type: String, trim: true, default: null },
  rating: { type: Number, default: 0 },
  badge: { type: String, trim: true, default: null },
  car_user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  car_request_id: { type: mongoose.Schema.Types.ObjectId, ref: "CarRegistrationRequest", default: null },
  is_active: { type: Boolean, default: true },
  women_safety_verified: { type: Boolean, default: false },

  // New Fields
  vehicle_number: { type: String, default: null },
  model_name: { type: String, default: null },
  ac_type: { type: String, enum: ["AC", "NON_AC"], default: "AC" },
  extra_km_charge: { type: Number, default: 0 },

  // Images
  front_image: { type: String, default: null },
  back_image: { type: String, default: null },
  left_image: { type: String, default: null },
  right_image: { type: String, default: null },
  interior_image: { type: String, default: null },
  number_plate_image: { type: String, default: null },

  // Documents
  rc_book: { type: String, default: null },
  insurance_copy: { type: String, default: null },
  puc_certificate: { type: String, default: null },
  permit_document: { type: String, default: null },
  id_proof: { type: String, default: null },
}, {
  collection: "cars",
  timestamps: { createdAt: "created_at", updatedAt: false },
});

module.exports = mongoose.model("Car", carSchema);
