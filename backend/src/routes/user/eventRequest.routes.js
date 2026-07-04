const express = require("express");
const router = express.Router();

const jwtUtils = require("../../utils/jwt");
const validate = require("../../middleware/validate");
const { createEventRequestValidation } = require("../../validations/eventRequest.validation");
const eventRequestController = require("../../controllers/user/eventRequest.controller");

// ✅ user creates event request
router.post(
  "/request",
  jwtUtils.authMiddleware("user"),
  createEventRequestValidation,
  validate,
  eventRequestController.createRequest
);

// ✅ user can see own requests (optional but useful)
router.get(
  "/my-requests",
  jwtUtils.authMiddleware("user"),
  eventRequestController.getMyRequests
);

module.exports = router;
