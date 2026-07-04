const router = require("express").Router();
const auth = require("../../middleware/auth.middleware"); // your auth middleware
const feedbackController = require("../../controllers/user/feedback.controller");



router.get("/latest", feedbackController.getLatestFeedback);
// ✅ Reviews by car_id
router.get("/cars/:id/reviews", feedbackController.getCarReviews);

// ✅ Create feedback (requires login)
router.post("/", auth, feedbackController.createFeedback);

module.exports = router;


