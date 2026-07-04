const router = require("express").Router();
const auth = require("../../middleware/carRegisterAuth.middleware");
const ctrl = require("../../controllers/car-register/carRegister.booking.controller");

// ✅ All bookings of MY cars (owner view)
router.get("/my", auth, ctrl.getMyCarBookings);

// ✅ Available drivers for logged in vendor
router.get("/drivers/available", auth, ctrl.getAvailableDrivers);

// ✅ Assign driver to booking
router.post("/:bookingId/assign-driver", auth, ctrl.assignDriver);

// ✅ Update booking status (only if booking belongs to owner)
router.patch("/:id/status", auth, ctrl.updateMyCarBookingStatus);

module.exports = router;
