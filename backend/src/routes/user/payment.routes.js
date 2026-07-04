const express = require("express");
const router = express.Router();
const paymentController = require("../../controllers/user/payment.controller");
const jwtUtils = require("../../utils/jwt");

router.post(
  "/create-order",
  jwtUtils.authMiddleware("user"),
  paymentController.createBookingOrder
);

router.post(
  "/verify",
  jwtUtils.authMiddleware("user"),
  paymentController.verifyPayment
);

module.exports = router;
