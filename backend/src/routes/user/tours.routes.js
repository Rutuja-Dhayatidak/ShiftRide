const express = require("express");
const router = express.Router();
const toursController = require("../../controllers/user/tours.controller");
const { authMiddleware } = require("../../utils/jwt");

// Public routes
router.get("/packages", toursController.getPublicTours);
router.get("/packages/:id", toursController.getTourDetails);

// Protected routes (User)
router.post("/book", authMiddleware("user"), toursController.bookTour);
router.get("/my-bookings", authMiddleware("user"), toursController.getMyTourBookings);

module.exports = router;
