const { Booking, Car } = require("../models/mongo");

function calcDays(start_date, end_date) {
  const s = new Date(start_date);
  const e = new Date(end_date);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 1;

  const diff = Math.ceil((e - s) / (24 * 60 * 60 * 1000)) + 1;
  return diff > 0 ? diff : 1;
}

function normalizeMode(v) {
  const x = String(v || "RENTAL").trim().toUpperCase();
  return x === "TRANSFER" ? "TRANSFER" : "RENTAL";
}

function normalizeBilling(v) {
  const x = String(v || "PER_DAY").trim().toUpperCase();
  return x === "PER_KM" ? "PER_KM" : "PER_DAY";
}

async function getCarById(car_id) {
  return Car.findById(car_id).lean();
}

async function checkOverlapBooking(car_id, start_date, end_date) {
  const start = new Date(start_date);
  const end = new Date(end_date);

  return Booking.exists({
    car_id,
    status: { $nin: ["CANCELLED", "CANCEL_REQUESTED"] },
    $nor: [
      { end_date: { $lt: start } },
      { start_date: { $gt: end } },
    ],
  });
}

async function createBooking({
  user_id,
  car_id,
  pickup_location,
  drop_location,
  start_date,
  end_date,
  booking_mode = "RENTAL",
  start_time = null,
  billing_type = "PER_DAY",
  distance_km = null,
  bookingSource = "WEBSITE",
  women_safety_mode = false,
}) {
  const car = await getCarById(car_id);
  if (!car) throw new Error("Car not found");
  if (car.is_active === false) throw new Error("Car is not active");
  if (car.is_available === false) throw new Error("Car is not available");

  booking_mode = normalizeMode(booking_mode);
  billing_type = normalizeBilling(billing_type);

  if (booking_mode === "TRANSFER") {
    end_date = start_date;
  }

  if (!start_date) throw new Error("start_date is required");
  if (!end_date) throw new Error("end_date is required");

  const isOverlap = await checkOverlapBooking(car_id, start_date, end_date);
  if (isOverlap) throw new Error("Car is already booked for selected dates");

  const days = booking_mode === "TRANSFER" ? 1 : calcDays(start_date, end_date);
  const rate_per_day = Number(car.price_per_day || 0);
  const rate_per_km = Number(car.price_per_km || 0);
  const baseRate = booking_mode === "TRANSFER" ? rate_per_km : rate_per_day;

  let billedKm = null;
  if (billing_type === "PER_KM") {
    const km = Number(distance_km);
    if (!Number.isFinite(km) || km <= 0) {
      throw new Error("distance_km is required for PER_KM (must be > 0)");
    }
    billedKm = booking_mode === "RENTAL" ? Number((km * 2).toFixed(2)) : Number(km.toFixed(2));
  }

  const total_amount = billing_type === "PER_DAY"
    ? Number((baseRate * days).toFixed(2))
    : Number((baseRate * billedKm).toFixed(2));

  let finalStartTime = start_time;
  if (!finalStartTime && start_date) {
    const dateObj = new Date(start_date);
    if (!Number.isNaN(dateObj.getTime())) {
      finalStartTime = dateObj.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  }

  const booking = await Booking.create({
    user_id,
    car_id,
    pickup_location,
    drop_location,
    start_date: new Date(start_date),
    end_date: new Date(end_date),
    distance_km: billedKm,
    rate_per_day,
    rate_per_km,
    total_amount,
    status: "REQUESTED",
    bookingStatus: "REQUESTED",
    paymentStatus: "NOT_PAID",
    razorpayOrderId: null,
    razorpayPaymentId: null,
    booking_mode,
    billing_type,
    start_time: finalStartTime,
    bookingSource,
    women_safety_mode,
  });

  return {
    booking_id: String(booking._id),
    days,
    booking_mode,
    billing_type,
    distance_km: billedKm,
    rate_per_day,
    rate_per_km,
    total_amount,
  };
}

async function getMyBookings(user_id) {
  const docs = await Booking.find({ user_id })
    .populate({ path: "car_id", select: "name brand cars_image vehicle_number model_name" })
    .populate({ path: "driverId", select: "driverName phone licenseNumber driverPhoto status" })
    .sort({ created_at: -1 })
    .lean();

  // ✅ Add string `id` field for frontend compatibility
  return docs.map((doc) => ({ ...doc, id: String(doc._id) }));
}

async function cancelBooking(user_id, booking_id) {
  const booking = await Booking.findOne({ _id: booking_id, user_id });
  if (!booking) throw new Error("Booking not found");

  if (String(booking.status || "").toLowerCase() === "cancelled") {
    return { cancelled: true };
  }

  booking.status = "CANCELLED";
  await booking.save();
  return { cancelled: true };
}

async function deleteBooking(user_id, booking_id) {
  const booking = await Booking.findOne({ _id: booking_id, user_id });
  if (!booking) throw new Error("Booking not found");

  await Booking.deleteOne({ _id: booking_id, user_id });
  return { deleted: true };
}

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  deleteBooking,
};
