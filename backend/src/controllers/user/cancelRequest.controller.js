const mongoose = require("mongoose");
const { Booking, CancelRequest } = require("../../models/mongo");

const isMongoId = (value) => mongoose.Types.ObjectId.isValid(String(value || ""));

exports.createCancelRequest = async (req, res) => {
  try {
    const userId = req.user?.id;
    const bookingId = req.params.id;
    const { reason, message } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!bookingId || !isMongoId(bookingId)) return res.status(400).json({ message: "Invalid booking id" });
    if (!reason) return res.status(400).json({ message: "Reason is required" });

    const booking = await Booking.findOne({ _id: bookingId, user_id: userId });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const status = String(booking.status || "").trim().toUpperCase();
    if (status === "CANCELLED" || status === "CANCELED") {
      return res.status(409).json({ message: "Booking already cancelled" });
    }
    if (status === "CANCEL_REQUESTED") {
      return res.status(409).json({ message: "Cancel request already submitted" });
    }

    const pending = await CancelRequest.exists({ booking_id: bookingId, user_id: userId, status: "PENDING" });
    if (pending) {
      return res.status(409).json({ message: "Cancel request already pending" });
    }

    await CancelRequest.create({
      booking_id: bookingId,
      user_id: userId,
      reason,
      message: message || "",
      status: "PENDING",
    });

    booking.status = "CANCEL_REQUESTED";
    await booking.save();

    res.json({ message: "Cancel request sent to admin ✅" });
  } catch (err) {
    console.error("createCancelRequest error:", err);
    res.status(500).json({ message: "Server error", error: err?.message });
  }
};
