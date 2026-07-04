const { EventRequest } = require("../models/mongo");

function normalizeStatus(s) {
  const x = String(s || "PENDING").toUpperCase();
  if (["PENDING", "CONFIRMED", "CANCELLED"].includes(x)) return x;
  return "PENDING";
}

function normalizeBilling(x) {
  const b = String(x || "PER_DAY").toUpperCase();
  if (["PER_DAY", "PER_KM", "PACKAGE"].includes(b)) return b;
  return "PER_DAY";
}

async function createEventRequest(payload) {
  const billing_type = normalizeBilling(payload.billing_type);

  if (billing_type === "PER_KM") {
    const km = Number(payload.distance_km);
    if (!Number.isFinite(km) || km <= 0) throw new Error("distance_km is required for PER_KM");

    if (
      payload.pickup_lat == null ||
      payload.pickup_lng == null ||
      payload.drop_lat == null ||
      payload.drop_lng == null
    ) {
      throw new Error("pickup/drop lat/lng required for PER_KM");
    }
  }

  const event = await EventRequest.create({
    user_id: payload.user_id,
    event_type: payload.event_type,
    city: payload.city,
    start_date: payload.start_date ? new Date(payload.start_date) : null,
    end_date: payload.end_date ? new Date(payload.end_date) : null,
    start_time: payload.start_time,
    cars_qty: payload.cars_qty,
    badge: payload.badge,
    min_seats: payload.min_seats,
    billing_type,
    distance_km: payload.distance_km,
    pickup_location: payload.pickup_location,
    pickup_lat: payload.pickup_lat,
    pickup_lng: payload.pickup_lng,
    drop_location: payload.drop_location,
    drop_lat: payload.drop_lat,
    drop_lng: payload.drop_lng,
    phone: payload.phone,
    note: payload.note,
    status: "PENDING",
  });

  return { id: String(event._id), status: event.status };
}

async function getMyEventRequests(user_id) {
  return EventRequest.find({ user_id })
    .sort({ created_at: -1 })
    .lean();
}

async function listEventRequests({ status }) {
  const filter = {};
  if (status) filter.status = normalizeStatus(status);

  return EventRequest.find(filter)
    .sort({ created_at: -1 })
    .populate({ path: "user_id", select: "name email" })
    .lean();
}

async function getEventRequestById(id) {
  return EventRequest.findById(id)
    .populate({ path: "user_id", select: "name email" })
    .lean();
}

async function updateEventRequestStatus(id, status) {
  const st = normalizeStatus(status);
  const event = await EventRequest.findById(id);
  if (!event) throw new Error("Request not found");

  event.status = st;
  await event.save();
  return { id: String(event._id), status: event.status };
}

module.exports = {
  createEventRequest,
  getMyEventRequests,
  listEventRequests,
  getEventRequestById,
  updateEventRequestStatus,
};
