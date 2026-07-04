const express = require("express");
const router = express.Router();

const bookingController = require("../../controllers/user/booking.controller");
const jwtUtils = require("../../utils/jwt");
const validate = require("../../middleware/validate");
const { createBookingValidation } = require("../../validations/booking.validation");

/* Protected user routes */
router.get(
  "/mybookings",
  jwtUtils.authMiddleware("user"),
  bookingController.getMyBookings
);

router.post(
  "/booking",
  jwtUtils.authMiddleware("user"),
  createBookingValidation,
  validate,
  bookingController.createBooking
);

// Cancel booking (USER)
router.put(
  "/cancel/:id",
  jwtUtils.authMiddleware("user"),
  bookingController.cancelBooking
);

// Get invoice (USER)
router.get(
  "/invoice/:id",
  jwtUtils.authMiddleware("user"),
  bookingController.invoicePdf
);

// Delete booking (USER)
router.delete(
  "/delete/:id",
  jwtUtils.authMiddleware("user"),
  bookingController.deleteBooking
);

router.patch("/:id/complete", jwtUtils.authMiddleware("user"), bookingController.completeBooking);

// Public tracking route (no auth middleware needed to allow sharing)
router.get("/track/:id", bookingController.getTrackingDetails);

module.exports = router;
