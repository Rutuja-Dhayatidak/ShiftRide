const { Feedback, Booking } = require("../models/mongo");

exports.getCarReviews = async (car_id) => {
  const reviews = await Feedback.find({ car_id })
    .populate({ path: "user_id", select: "name" })
    .populate({ path: "car_id", select: "name brand" })
    .sort({ created_at: -1 })
    .lean();

  return reviews.map((review) => ({
    ...review,
    id: String(review._id),
    username: review.user_id?.name || null,
    car_name: review.car_id?.name || null,
    car_brand: review.car_id?.brand || null,
  }));
};

exports.getLatestFeedback = async (limit = 6) => {
  const safeLimit = Math.max(1, Math.min(12, Number(limit) || 6));

  const feedback = await Feedback.find({})
    .populate({ path: "user_id", select: "name" })
    .populate({ path: "car_id", select: "name brand" })
    .sort({ created_at: -1 })
    .limit(safeLimit)
    .lean();

  return feedback.map((review) => ({
    ...review,
    id: String(review._id),
    username: review.user_id?.name || null,
    car_name: review.car_id?.name || null,
    car_brand: review.car_id?.brand || null,
  }));
};

exports.createFeedback = async ({ user_id, booking_id, rating, message }) => {
  const booking = await Booking.findOne({ _id: booking_id, user_id });
  if (!booking) throw new Error("Invalid booking_id (not found or not yours)");

  const exists = await Feedback.exists({ booking_id, user_id });
  if (exists) {
    throw new Error("You have already submitted feedback for this booking");
  }

  const feedback = await Feedback.create({
    user_id,
    booking_id,
    car_id: booking.car_id,
    message,
    rating,
  });

  return { id: String(feedback._id), car_id: String(feedback.car_id) };
};
