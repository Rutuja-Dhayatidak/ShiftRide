const { Booking, Car, Driver } = require("../../models/mongo");

const OWNER_ALLOWED_STATUS = ["REQUESTED", "FORWARDED_TO_DRIVER", "DRIVER_ACCEPTED", "CONFIRMED", "COMPLETED", "CANCEL_REQUESTED"];

exports.getMyCarBookings = async (req, res) => {
  try {
    const carIds = await Car.find({ car_user_id: req.user.id }).distinct("_id");
    const rows = await Booking.find({ car_id: { $in: carIds } })
      .populate({ path: "user_id", select: "name email phone" })
      .populate({ path: "car_id", select: "name brand cars_image price_per_day price_per_km" })
      .populate({ path: "driverId", select: "driverName phone licenseNumber driverPhoto status" })
      .sort({ created_at: -1 })
      .lean();

    return res.json(rows.map((row) => ({ ...row, id: String(row._id) })));
  } catch (err) {
    console.error("getMyCarBookings error:", err);
    return res.status(500).json({ message: "Failed to load bookings" });
  }
};

exports.getAvailableDrivers = async (req, res) => {
  try {
    const vendorId = req.user?.id || req.user?.user_id;
    if (!vendorId) return res.status(401).json({ message: "Unauthorized" });

    const drivers = await Driver.find({ vendorId, status: "AVAILABLE" }).lean();
    return res.json(drivers.map(d => ({ ...d, id: String(d._id) })));
  } catch (err) {
    console.error("getAvailableDrivers error:", err);
    return res.status(500).json({ message: "Failed to fetch available drivers" });
  }
};

exports.assignDriver = async (req, res) => {
  try {
    const vendorId = req.user?.id || req.user?.user_id;
    if (!vendorId) return res.status(401).json({ message: "Unauthorized" });

    const bookingId = req.params.bookingId;
    const { driverId } = req.body;

    if (!driverId) {
      return res.status(400).json({ message: "driverId is required" });
    }

    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify car ownership
    const car = await Car.findById(booking.car_id);
    if (!car || String(car.car_user_id) !== String(vendorId)) {
      return res.status(403).json({ message: "Unauthorized (this booking is not for your car)" });
    }

    // Verify booking state is REQUESTED
    if (booking.bookingStatus !== "REQUESTED") {
      return res.status(400).json({ message: "Booking status must be REQUESTED to assign/forward to a driver" });
    }

    // Verify driver belongs to vendor and is AVAILABLE
    const driver = await Driver.findOne({ _id: driverId, vendorId });
    if (!driver) {
      return res.status(404).json({ message: "Driver not found or does not belong to you" });
    }
    if (driver.status !== "AVAILABLE") {
      return res.status(400).json({ message: "Driver is currently BUSY or INACTIVE" });
    }

    // Success transition
    booking.driverId = driverId;
    booking.driverAssigned = true;
    booking.driverAssignedAt = new Date();
    booking.bookingStatus = "FORWARDED_TO_DRIVER";
    booking.status = "FORWARDED_TO_DRIVER"; // update status to let vendor/user know too
    await booking.save();

    driver.status = "BUSY";
    await driver.save();

    return res.json({
      message: "Driver assigned successfully! 🚗",
      booking
    });
  } catch (err) {
    console.error("assignDriver error:", err);
    return res.status(500).json({ message: err.message || "Failed to assign driver" });
  }
};

exports.updateMyCarBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;
    if (!bookingId) return res.status(400).json({ message: "Invalid booking id" });

    let { status } = req.body;
    status = String(status || "").trim().toUpperCase();
    if (!status) return res.status(400).json({ message: "Status is required" });
    
    // Allow DRIVER_ASSIGNED as valid status in the array
    const ALLOWED = [...OWNER_ALLOWED_STATUS, "DRIVER_ASSIGNED"];
    if (!ALLOWED.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed: ${ALLOWED.join(", ")}` });
    }

    const booking = await Booking.findById(bookingId).populate({ path: "car_id", select: "car_user_id" });
    if (!booking || String(booking.car_id?.car_user_id) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not allowed (not your car booking)" });
    }

    booking.status = status;
    if (status === "COMPLETED") {
      booking.bookingStatus = "COMPLETED";
      if (booking.driverId) {
        await Driver.findByIdAndUpdate(booking.driverId, { status: "AVAILABLE" });
      }
    }
    await booking.save();

    return res.json({ message: "Booking status updated ✅", booking_id: bookingId, status });
  } catch (err) {
    console.error("updateMyCarBookingStatus error:", err);
    return res.status(500).json({ message: "Failed to update status" });
  }
};
