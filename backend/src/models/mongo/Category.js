const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  is_active: { type: Boolean, default: true },
}, {
  collection: "categories",
  timestamps: false,
});

module.exports = mongoose.model("Category", categorySchema);
