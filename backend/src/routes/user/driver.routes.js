const express = require("express");
const router = express.Router();

const driverAuth = require("../../controllers/driverAuth.controller");
const rideCtrl = require("../../controllers/rideManagement.controller");
const jwtUtils = require("../../utils/jwt");

/* Public Route */
router.post("/login", driverAuth.login);

/* Protected Driver Routes (requires driver role) */
router.get("/me", jwtUtils.authMiddleware("driver"), driverAuth.me);
router.get("/bookings/assigned", jwtUtils.authMiddleware("driver"), rideCtrl.getAssignedBookings);
router.get("/bookings/history", jwtUtils.authMiddleware("driver"), rideCtrl.getTripHistory);
router.post("/bookings/:bookingId/accept", jwtUtils.authMiddleware("driver"), rideCtrl.acceptRide);
router.post("/bookings/:bookingId/reject", jwtUtils.authMiddleware("driver"), rideCtrl.rejectRide);
router.post("/location/update", jwtUtils.authMiddleware("driver"), rideCtrl.updateLocation);
router.patch("/status", jwtUtils.authMiddleware("driver"), rideCtrl.updateDriverStatus);

/* OTP & Trip lifecycle controls (requires driver role) */
router.post("/bookings/:bookingId/verify-otp", jwtUtils.authMiddleware("driver"), rideCtrl.verifyOtp);
router.post("/bookings/:bookingId/start-trip", jwtUtils.authMiddleware("driver"), rideCtrl.startTrip);
router.post("/bookings/:bookingId/complete-trip", jwtUtils.authMiddleware("driver"), rideCtrl.completeTrip);

/* Tracking Route (User/Vendor/Driver can access) */
router.get("/bookings/:bookingId/tracking", rideCtrl.getTrackingDetails);

module.exports = router;
