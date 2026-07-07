// combine all routes


const router = require("express").Router();

router.use("/auth", require("./auth.routes"));
router.use("/users", require("./user.routes"));
router.use("/cars", require("./car.routes"));
router.use("/bookings", require("./booking.routes"));
router.use("/feedback", require("./feedback.routes"));
router.use("/contact", require("./contact.routes"));
// in routes/user/booking.routes.js (or wherever /bookings routes are mounted)
router.use("/bookings", require("./cancelRequest.routes"));
router.use("/event-requests", require("./eventRequest.routes"));
router.use("/tours", require("./tours.routes")); // ✅ NEW
router.use("/testimonials", require("./testimonial.routes"));
router.use("/media", require("./media.routes"));
router.use("/features", require("./feature.routes"));
router.use("/payments", require("./payment.routes"));
router.use("/driver", require("./driver.routes"));
router.use("/mobile-offers", require("./mobileOffer.routes"));

module.exports = router;
