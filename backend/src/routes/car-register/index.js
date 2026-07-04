const express = require("express");
const router = express.Router();

/* ================= SUB ROUTES ================= */

// Auth routes
router.use("/", require("./carRegisterAuth.routes"));

// Car register routes
router.use("/", require("./carRegister.routes"));

router.use("/bookings", require("./carRegister.booking.routes"));

module.exports = router;
