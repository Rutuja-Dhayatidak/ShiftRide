const feedbackService = require("../../services/feedback.service");

function getUserId(req) {
  return req.user?.id || req.user?.user_id || req.user_id || null;
}

exports.getCarReviews = async (req, res) => {
  try {
    const car_id = Number(req.params.id);
    const rows = await feedbackService.getCarReviews(car_id);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

exports.getLatestFeedback = async (req, res) => {
  try {
    const limit = Number(req.query.limit || 6);
    const rows = await feedbackService.getLatestFeedback(limit);
    res.json(Array.isArray(rows) ? rows : []);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch latest feedback" });
  }
};


exports.createFeedback = async (req, res) => {
  try {
    const user_id = getUserId(req);
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const booking_id = String(req.body.booking_id || "").trim();
    const rating = Number(req.body.rating);
    const message = String(req.body.message || "").trim();

    if (!booking_id || !rating) {
      return res.status(400).json({ message: "Missing booking_id or rating" });
    }

    const data = await feedbackService.createFeedback({
      user_id,
      booking_id,
      rating,
      message,
    });

    res.status(201).json({ message: "Feedback submitted", ...data });
  } catch (err) {
    res.status(400).json({ message: err.message || "Feedback failed" });
  }
};
