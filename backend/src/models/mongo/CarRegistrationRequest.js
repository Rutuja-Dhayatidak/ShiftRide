const mongoose = require("mongoose");

const carRegistrationRequestSchema = new mongoose.Schema({
  car_user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true, trim: true },
  brand: { type: String, required: true, trim: true },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  vehicle_type: { type: String, enum: ["CAR", "BUS"], default: "CAR" },
  car_details: { type: String, default: null },
  city: { type: String, default: null },
  year: { type: Number, default: null },
  seats: { type: Number, default: null },
  fuel_type: { type: String, default: null },
  cars_image: { type: String, default: null },
  requested_category_id: { type: mongoose.Schema.Types.Mixed, default: null },
  approved_category_id: { type: mongoose.Schema.Types.Mixed, default: null },
  price_per_day: { type: Number, default: 0 },
  price_per_km: { type: Number, default: 0 },
  rc_book: { type: String, default: null },
  insurance_copy: { type: String, default: null },
  puc_certificate: { type: String, default: null },
  id_proof: { type: String, default: null },
  status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
  admin_remark: { type: String, default: null },

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

  // Additional Document
  permit_document: { type: String, default: null },
}, {
  collection: "car_registration_requests",
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
});

module.exports = mongoose.model("CarRegistrationRequest", carRegistrationRequestSchema);
