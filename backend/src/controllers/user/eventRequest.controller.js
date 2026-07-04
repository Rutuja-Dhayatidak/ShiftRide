const eventRequestService = require("../../services/eventRequest.service");

function getUserId(req) {
  return req.user?.id || req.user?.user_id || req.user_id || null;
}

exports.createRequest = async (req, res) => {
  try {
    const user_id = getUserId(req);
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const payload = {
      user_id,
      event_type: (req.body.event_type || "OTHER").toUpperCase(),
      city: req.body.city,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      start_time: req.body.start_time,
      cars_qty: Number(req.body.cars_qty || 1),
      badge: (req.body.badge || "ANY").toUpperCase(),
      min_seats: Number(req.body.min_seats || 4),
      billing_type: (req.body.billing_type || "PER_DAY").toUpperCase(),
      distance_km: req.body.distance_km ?? null,
      pickup_location: req.body.pickup_location,
      pickup_lat: req.body.pickup_lat ?? null,
      pickup_lng: req.body.pickup_lng ?? null,
      drop_location: req.body.drop_location ?? null,
      drop_lat: req.body.drop_lat ?? null,
      drop_lng: req.body.drop_lng ?? null,
      phone: req.body.phone,
      note: req.body.note ?? null,
    };

    const data = await eventRequestService.createEventRequest(payload);
    return res.status(201).json({ message: "Event request created", ...data });
  } catch (err) {
    console.error("CREATE EVENT REQUEST ERROR:", err);
    return res.status(400).json({ message: err.message || "Failed to create request" });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const user_id = getUserId(req);
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const rows = await eventRequestService.getMyEventRequests(user_id);
    return res.json(rows);
  } catch (err) {
    console.error("MY EVENT REQUESTS ERROR:", err);
    return res.status(500).json({ message: "Failed to fetch requests" });
  }
};
