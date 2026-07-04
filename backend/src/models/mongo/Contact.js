const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true },
}, {
  collection: "contact",
  timestamps: { createdAt: "created_at", updatedAt: false },
});

module.exports = mongoose.model("Contact", contactSchema);
