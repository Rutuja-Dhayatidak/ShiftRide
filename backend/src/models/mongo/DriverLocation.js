const mongoose = require("mongoose");

const driverLocationSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true, unique: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: "driver_locations"
});

module.exports = mongoose.model("DriverLocation", driverLocationSchema);
