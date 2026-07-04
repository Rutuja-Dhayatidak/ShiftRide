const { body } = require("express-validator");

const createEventRequestValidation = [
  body("event_type").optional().isString(),

  body("city").notEmpty().isString().withMessage("city is required"),

  body("start_date").notEmpty().isISO8601().withMessage("start_date must be YYYY-MM-DD"),
  body("end_date").notEmpty().isISO8601().withMessage("end_date must be YYYY-MM-DD"),
  body("start_time").notEmpty().isString().withMessage("start_time is required"),

  body("cars_qty").notEmpty().isInt({ min: 1 }).withMessage("cars_qty must be >= 1"),
  body("badge").optional().isIn(["ANY", "PLATINUM", "GOLD", "SILVER"]),
  body("min_seats").optional().isInt({ min: 1 }),

  body("billing_type").optional().isIn(["PER_DAY", "PER_KM", "PACKAGE"]),

  // ✅ If PER_KM -> require distance + coords
  body("distance_km").custom((value, { req }) => {
    const bt = String(req.body.billing_type || "PER_DAY").toUpperCase();
    if (bt !== "PER_KM") return true;
    const km = Number(value);
    if (!Number.isFinite(km) || km <= 0) throw new Error("distance_km is required for PER_KM");
    return true;
  }),

  body("pickup_location").notEmpty().isString().withMessage("pickup_location is required"),

  body("pickup_lat").custom((v, { req }) => {
    const bt = String(req.body.billing_type || "PER_DAY").toUpperCase();
    if (bt !== "PER_KM") return true;
    if (v === null || v === undefined || v === "") throw new Error("pickup_lat required for PER_KM");
    return true;
  }),
  body("pickup_lng").custom((v, { req }) => {
    const bt = String(req.body.billing_type || "PER_DAY").toUpperCase();
    if (bt !== "PER_KM") return true;
    if (v === null || v === undefined || v === "") throw new Error("pickup_lng required for PER_KM");
    return true;
  }),
  body("drop_lat").custom((v, { req }) => {
    const bt = String(req.body.billing_type || "PER_DAY").toUpperCase();
    if (bt !== "PER_KM") return true;
    if (v === null || v === undefined || v === "") throw new Error("drop_lat required for PER_KM");
    return true;
  }),
  body("drop_lng").custom((v, { req }) => {
    const bt = String(req.body.billing_type || "PER_DAY").toUpperCase();
    if (bt !== "PER_KM") return true;
    if (v === null || v === undefined || v === "") throw new Error("drop_lng required for PER_KM");
    return true;
  }),

  body("phone").notEmpty().isString().withMessage("phone is required"),
  body("note").optional().isString(),
];

const updateEventRequestStatusValidation = [
  body("status")
    .notEmpty()
    .isIn(["PENDING", "CONFIRMED", "CANCELLED"])
    .withMessage("status must be PENDING/CONFIRMED/CANCELLED"),
];

module.exports = {
  createEventRequestValidation,
  updateEventRequestStatusValidation,
};
