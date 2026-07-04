const mongoose = require("mongoose");
const { ToursPackage, TourBooking } = require("../../models/mongo");

const isMongoId = (value) => mongoose.Types.ObjectId.isValid(String(value || ""));

exports.getPublicTours = async (req, res) => {
  try {
    const tours = await ToursPackage.find({ is_active: true, status: "APPROVED" })
      .sort({ created_at: -1 })
      .lean();

    res.json(tours.map((tour) => ({ ...tour, id: String(tour._id) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch tours" });
  }
};

exports.getTourDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isMongoId(id)) return res.status(400).json({ message: "Invalid tour id" });

    const tour = await ToursPackage.findOne({ _id: id, is_active: true }).lean();
    if (!tour) return res.status(404).json({ message: "Tour not found" });

    res.json({ ...tour, id: String(tour._id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch tour details" });
  }
};

exports.bookTour = async (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const { tour_id, booking_date, start_date, num_persons, total_amount } = req.body;
    if (!tour_id || !booking_date || !start_date || !num_persons || !total_amount) {
      return res.status(400).json({ message: "tour_id, booking_date, start_date, num_persons and total_amount are required" });
    }

    if (!isMongoId(tour_id)) return res.status(400).json({ message: "Invalid tour id" });

    await TourBooking.create({
      user_id,
      tour_id,
      booking_date: new Date(booking_date),
      start_date: new Date(start_date),
      num_persons: Number(num_persons),
      total_amount: Number(total_amount),
      status: "PENDING",
    });

    res.json({ message: "Tour booked successfully! Pending approval. ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to book tour" });
  }
};

exports.getMyTourBookings = async (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const rows = await TourBooking.find({ user_id })
      .populate({ path: "tour_id", select: "title images duration" })
      .sort({ created_at: -1 })
      .lean();

    res.json(rows.map((booking) => ({
      ...booking,
      id: String(booking._id),
      tour_title: booking.tour_id?.title || "",
      tour_images: booking.tour_id?.images || null,
      tour_duration: booking.tour_id?.duration || null,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch your bookings" });
  }
};
