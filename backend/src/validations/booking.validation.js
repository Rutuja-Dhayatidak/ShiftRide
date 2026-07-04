const { body } = require("express-validator");

const createBookingValidation = [
  body("car_id")
    .notEmpty()
    .withMessage("car_id is required")
    .custom((value) => {
      // Accept MongoDB ObjectId (24-char hex) OR a valid integer
      const isMongoId = /^[a-f\d]{24}$/i.test(String(value));
      const isIntId = Number.isInteger(Number(value)) && Number(value) > 0;
      if (!isMongoId && !isIntId) {
        throw new Error("car_id must be a valid ID");
      }
      return true;
    }),

  body("pickup_location")
    .notEmpty()
    .isString()
    .withMessage("pickup_location is required"),

  body("drop_location")
    .notEmpty()
    .isString()
    .withMessage("drop_location is required"),

  // ✅ Normalize booking_mode check (case-insensitive safe)
  body("booking_mode")
    .optional()
    .customSanitizer((v) => String(v || "").toUpperCase())
    .isIn(["RENTAL", "TRANSFER"])
    .withMessage("booking_mode must be RENTAL or TRANSFER"),

  body("start_date")
    .notEmpty()
    .isISO8601()
    .withMessage("start_date must be YYYY-MM-DD"),

  // ✅ end_date required only when RENTAL (case-insensitive safe)
  body("end_date").custom((value, { req }) => {
    const mode = String(req.body.booking_mode || "RENTAL").toUpperCase();
    if (mode === "TRANSFER") return true; // optional
    if (!value) throw new Error("end_date is required for RENTAL");
    return true;
  }),

  body("end_date")
    .optional()
    .isISO8601()
    .withMessage("end_date must be YYYY-MM-DD"),

  body("start_time").optional().isString(),

  // ✅ NEW: billing_type validation
  body("billing_type")
    .optional()
    .customSanitizer((v) => String(v || "").toUpperCase())
    .isIn(["PER_DAY", "PER_KM"])
    .withMessage("billing_type must be PER_DAY or PER_KM"),

  // ✅ NEW: distance_km required if billing_type = PER_KM
  body("distance_km").custom((value, { req }) => {
    const billing = String(req.body.billing_type || "PER_DAY").toUpperCase();

    if (billing !== "PER_KM") return true; // ignore distance_km for PER_DAY

    const km = Number(value);
    if (!Number.isFinite(km) || km <= 0) {
      throw new Error("distance_km is required for PER_KM (must be > 0)");
    }
    return true;
  }),
];

module.exports = { createBookingValidation };
