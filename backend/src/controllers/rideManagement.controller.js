const { Booking, Driver, Car, DriverLocation } = require("../models/mongo");

/**
 * =====================================
 * GET ASSIGNED BOOKINGS (DRIVER)
 * =====================================
 */
exports.getAssignedBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      driverId: req.user.id,
      bookingStatus: { $in: ["FORWARDED_TO_DRIVER", "DRIVER_ASSIGNED", "DRIVER_ACCEPTED", "DRIVER_ARRIVING", "OTP_VERIFIED", "TRIP_STARTED"] }
    })
      .populate({ path: "user_id", select: "name phone email" })
      .populate({ path: "car_id", select: "name brand cars_image license_plate" })
      .sort({ created_at: -1 })
      .lean();

    return res.json({ success: true, bookings: bookings.map(b => ({ ...b, id: String(b._id) })) });
  } catch (err) {
    console.error("getAssignedBookings error:", err);
    return res.status(500).json({ message: "Failed to load assigned bookings" });
  }
};

/**
 * =====================================
 * GET TRIP HISTORY (DRIVER)
 * =====================================
 */
exports.getTripHistory = async (req, res) => {
  try {
    const bookings = await Booking.find({
      driverId: req.user.id,
      bookingStatus: "TRIP_COMPLETED"
    })
      .populate({ path: "user_id", select: "name phone email" })
      .populate({ path: "car_id", select: "name brand cars_image" })
      .sort({ tripEndTime: -1 })
      .lean();

    return res.json({ success: true, bookings: bookings.map(b => ({ ...b, id: String(b._id) })) });
  } catch (err) {
    console.error("getTripHistory error:", err);
    return res.status(500).json({ message: "Failed to load trip history" });
  }
};

/**
 * =====================================
 * ACCEPT RIDE (DRIVER)
 * =====================================
 */
exports.acceptRide = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findOne({ _id: bookingId, driverId: req.user.id });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found or not assigned to you" });
    }

    if (booking.bookingStatus !== "FORWARDED_TO_DRIVER") {
      return res.status(400).json({ message: `Cannot accept booking in ${booking.bookingStatus} status` });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    booking.bookingStatus = "DRIVER_ACCEPTED";
    booking.status = "DRIVER_ACCEPTED";
    booking.otp = otp; // Save OTP in booking
    await booking.save();

    // Mark driver as BUSY
    await Driver.findByIdAndUpdate(req.user.id, { status: "BUSY" });

    return res.json({ success: true, message: "Ride accepted! 🚗 OTP generated.", booking });
  } catch (err) {
    console.error("acceptRide error:", err);
    return res.status(500).json({ message: "Failed to accept ride" });
  }
};

/**
 * =====================================
 * REJECT RIDE (DRIVER)
 * =====================================
 */
exports.rejectRide = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findOne({ _id: bookingId, driverId: req.user.id });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found or not assigned to you" });
    }

    if (booking.bookingStatus !== "FORWARDED_TO_DRIVER") {
      return res.status(400).json({ message: "Can only reject ride when forwarded to driver" });
    }

    booking.bookingStatus = "DRIVER_REJECTED";
    booking.status = "DRIVER_REJECTED";
    booking.driverAssigned = false;
    booking.driverId = null; // Free up booking for next assignment
    await booking.save();

    // Reset Driver status to AVAILABLE
    await Driver.findByIdAndUpdate(req.user.id, { status: "AVAILABLE" });

    return res.json({ success: true, message: "Ride rejected. Vendor will be notified.", booking });
  } catch (err) {
    console.error("rejectRide error:", err);
    return res.status(500).json({ message: "Failed to reject ride" });
  }
};

/**
 * =====================================
 * UPDATE LOCATION (DRIVER - 20s interval)
 * =====================================
 */
exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: "Latitude and Longitude are required" });
    }

    await DriverLocation.findOneAndUpdate(
      { driverId: req.user.id },
      { latitude, longitude, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    return res.json({ success: true, message: "Location updated successfully" });
  } catch (err) {
    console.error("updateLocation error:", err);
    return res.status(500).json({ message: "Failed to update location" });
  }
};

/**
 * =====================================
 * GET TRACKING DETAILS (USER / VENDOR)
 * =====================================
 */
exports.getTrackingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking || !booking.driverId) {
      return res.status(404).json({ message: "Active booking or driver not found" });
    }

    const loc = await DriverLocation.findOne({ driverId: booking.driverId });
    if (!loc) {
      return res.status(404).json({ message: "Driver live location not available yet" });
    }

    // Return dummy ETA and Distance calculation for premium mock interface
    return res.json({
      success: true,
      latitude: loc.latitude,
      longitude: loc.longitude,
      distanceKm: 2.4, // Mock distance
      etaMinutes: 8,   // Mock ETA
      updatedAt: loc.updatedAt
    });
  } catch (err) {
    console.error("getTrackingDetails error:", err);
    return res.status(500).json({ message: "Failed to fetch tracking coordinates" });
  }
};

/**
 * =====================================
 * RIDE OTP VERIFICATION (DRIVER)
 * =====================================
 */
exports.verifyOtp = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { otp } = req.body;

    if (!otp) return res.status(400).json({ message: "OTP is required" });

    const booking = await Booking.findOne({ _id: bookingId, driverId: req.user.id });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (String(booking.otp) !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP! Access Denied." });
    }

    booking.bookingStatus = "OTP_VERIFIED";
    booking.status = "OTP_VERIFIED";
    await booking.save();

    return res.json({ success: true, message: "OTP Verified successfully! Ready to start trip.", booking });
  } catch (err) {
    console.error("verifyOtp error:", err);
    return res.status(500).json({ message: "Failed to verify OTP" });
  }
};

/**
 * =====================================
 * START TRIP (DRIVER)
 * =====================================
 */
exports.startTrip = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findOne({ _id: bookingId, driverId: req.user.id });

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.bookingStatus !== "OTP_VERIFIED") {
      return res.status(400).json({ message: "Verify OTP before starting the trip" });
    }

    booking.bookingStatus = "TRIP_STARTED";
    booking.status = "TRIP_STARTED";
    booking.tripStartTime = new Date();
    await booking.save();

    // Mark car as on_trip
    await Car.findByIdAndUpdate(booking.car_id, { is_available: 0 }); // or custom availability state
    // Mark driver as BUSY
    await Driver.findByIdAndUpdate(req.user.id, { status: "BUSY" });

    return res.json({ success: true, message: "Trip started successfully! Have a safe ride. 🛣️", booking });
  } catch (err) {
    console.error("startTrip error:", err);
    return res.status(500).json({ message: "Failed to start trip" });
  }
};

/**
 * =====================================
 * COMPLETE TRIP (DRIVER)
 * =====================================
 */
exports.completeTrip = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findOne({ _id: bookingId, driverId: req.user.id });

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.bookingStatus !== "TRIP_STARTED") {
      return res.status(400).json({ message: "Trip must be started to complete it" });
    }

    booking.bookingStatus = "TRIP_COMPLETED";
    booking.status = "COMPLETED"; // matching COMPLETED standard status
    booking.tripEndTime = new Date();
    await booking.save();

    // Release Car to available
    await Car.findByIdAndUpdate(booking.car_id, { is_available: 1 });
    // Release Driver to AVAILABLE
    await Driver.findByIdAndUpdate(req.user.id, { status: "AVAILABLE" });

    return res.json({ success: true, message: "Trip completed! Thank you.", booking });
  } catch (err) {
    console.error("completeTrip error:", err);
    return res.status(500).json({ message: "Failed to complete trip" });
  }
};

/**
 * =====================================
 * UPDATE DRIVER OWN STATUS (DRIVER)
 * =====================================
 */
exports.updateDriverStatus = async (req, res) => {
  try {
    let { status } = req.body;
    status = String(status || "").trim().toUpperCase();
    if (!status) return res.status(400).json({ message: "Status is required" });

    const ALLOWED = ["AVAILABLE", "BUSY", "INACTIVE"];
    if (!ALLOWED.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed: ${ALLOWED.join(", ")}` });
    }

    const driver = await Driver.findByIdAndUpdate(req.user.id, { status }, { new: true });
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    return res.json({ success: true, message: "Availability status updated successfully! ✅", status: driver.status });
  } catch (err) {
    console.error("updateDriverStatus error:", err);
    return res.status(500).json({ message: "Failed to update availability status" });
  }
};
