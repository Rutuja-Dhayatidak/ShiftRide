const { body } = require("express-validator");

exports.feedbackValidation = [
  body("booking_id")
    .isInt().withMessage("Valid booking_id is required"),

  body("message")
    .notEmpty().withMessage("Feedback message is required")
    .isLength({ min: 5 }).withMessage("Message too short"),

  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
];
