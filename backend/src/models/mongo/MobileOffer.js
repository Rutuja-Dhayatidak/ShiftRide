const mongoose = require("mongoose");

const mobileOfferSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  backgroundImage: { type: String },
  offerCode: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  offerDays: { type: Number },
  discountText: { type: String },
  status: { type: String, default: "Active" },
}, {
  collection: "mobileoffers",
  timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
});

module.exports = mongoose.model("MobileOffer", mobileOfferSchema);
