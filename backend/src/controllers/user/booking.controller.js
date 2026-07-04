const bookingService = require("../../services/booking.service");
const { Booking } = require("../../models/mongo");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

function getUserId(req) {
  return req.user?.id || req.user?.user_id || req.user_id || null;
}

/**
 * ✅ Supports:
 * - Absolute Windows path: E:\...\public\file.jpg
 * - Relative: public/file.jpg, /uploads/file.jpg, uploads/file.jpg, file.jpg
 */
function resolveLocalImagePath(raw) {
  if (!raw) return null;

  const normalized = path.normalize(String(raw).trim());

  // ✅ 1) If it's already an absolute path (E:\... or C:\...) and exists, return directly
  if (path.isAbsolute(normalized) && fs.existsSync(normalized)) {
    return normalized;
  }

  // ✅ 2) If not absolute, try common locations
  const clean = normalized.replace(/^[/\\]/, ""); // remove leading / or \

  const tryPaths = [
    path.join(process.cwd(), clean),
    path.join(process.cwd(), "public", clean),
    path.join(process.cwd(), "uploads", clean),
    path.join(process.cwd(), "public", "uploads", clean),
  ];

  for (const p of tryPaths) {
    const p2 = path.normalize(p);
    if (fs.existsSync(p2)) return p2;
  }

  return null;
}

/**
 * ✅ Returns:
 * - Buffer if URL image
 * - Absolute local path if local image
 */
async function loadImageForPdf(raw) {
  if (!raw) return null;

  // ✅ URL -> download to Buffer
  if (/^https?:\/\//i.test(raw)) {
    const resp = await axios.get(raw, { responseType: "arraybuffer" });
    return Buffer.from(resp.data);
  }

  // ✅ local file
  const localPath = resolveLocalImagePath(raw);
  if (localPath) return localPath;

  return null;
}

// ======================== BOOKINGS ========================

exports.createBooking = async (req, res) => {
  try {
    const user_id = getUserId(req);
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const booking_mode = (req.body.booking_mode || "RENTAL").toUpperCase();
    const start_date = req.body.start_date;

    const payload = {
      user_id,
      car_id: req.body.car_id,
      pickup_location: req.body.pickup_location,
      drop_location: req.body.drop_location,
      start_date,
      end_date: booking_mode === "TRANSFER" ? start_date : req.body.end_date,
      booking_mode,
      start_time: req.body.start_time || null,

      billing_type: (req.body.billing_type || "PER_DAY").toUpperCase(),
      distance_km: req.body.distance_km ?? null,
    };
    const data = await bookingService.createBooking(payload);
    return res.status(201).json({ message: "Booking created", ...data });
  } catch (err) {
    console.error("CREATE BOOKING ERROR:", err);
    return res.status(400).json({ message: err.message || "Booking failed" });
  }
};


exports.getMyBookings = async (req, res) => {
  try {
    const user_id = getUserId(req);
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const data = await bookingService.getMyBookings(user_id);
    res.json(data);
  } catch (err) {
    console.error("MY BOOKINGS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const user_id = getUserId(req);
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const booking_id = req.params.id;
    const data = await bookingService.cancelBooking(user_id, booking_id);
    res.json({ message: "Booking cancelled", ...data });
  } catch (err) {
    console.error("CANCEL BOOKING ERROR:", err);
    res.status(400).json({ message: err.message || "Cancel failed" });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const user_id = getUserId(req);
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const booking_id = req.params.id;
    const data = await bookingService.deleteBooking(user_id, booking_id);
    res.json({ message: "Booking deleted", ...data });
  } catch (err) {
    console.error("DELETE BOOKING ERROR:", err);
    res.status(400).json({ message: err.message || "Delete failed" });
  }
};

// ======================== INVOICE PDF (WITH IMAGE) ========================

exports.invoicePdf = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = getUserId(req);

    if (!bookingId) return res.status(400).json({ message: "Invalid booking id" });
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // ⚠️ IMPORTANT: Use your correct image column name here:
    // You are using: c.cars_image AS car_image
    // Keep it if it matches your DB column.
    const booking = await Booking.findOne({ _id: bookingId, user_id: userId })
      .populate({ path: "car_id", select: "name brand price_per_day cars_image" })
      .populate({ path: "user_id", select: "name email" })
      .lean();

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const b = {
      ...booking,
      car_name: booking.car_id?.name || "",
      car_brand: booking.car_id?.brand || "",
      car_price_per_day: booking.car_id?.price_per_day || 0,
      car_image: booking.car_id?.cars_image || null,
      customer_name: booking.user_id?.name || "",
      customer_email: booking.user_id?.email || "",
    };

    const safe = (v) => (v === null || v === undefined || v === "" ? "-" : String(v));
    const formatINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
    const niceDateTime = (d) => {
      if (!d) return "-";
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return String(d);
      return dt.toLocaleString("en-IN", { year: "numeric", month: "short", day: "2-digit" });
    };

    const doc = new PDFDocument({ size: "A4", margin: 40 });

    // ✅ Unicode font for ₹ and Indian names
    const fontPath = path.join(process.cwd(), "public", "fonts", "DejaVuSans.ttf");
    try {
      doc.registerFont("u", fontPath);
      doc.font("u");
    } catch (e) {
      // fallback default font
    }

    const chunks = [];
    doc.on("data", (c) => chunks.push(c));

    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="invoice-booking-${bookingId}.pdf"`);
      res.setHeader("Content-Length", pdfBuffer.length);
      return res.status(200).send(pdfBuffer);
    });

    doc.on("error", (e) => {
      console.error("PDFKit error:", e);
      if (!res.headersSent) return res.status(500).json({ message: "PDF generation failed" });
    });

    // ================== STYLE HELPERS ==================
    const pageW = doc.page.width;
    const margin = 40;
    const contentW = pageW - margin * 2;

    const card = (x, y, w, h, title) => {
      doc
        .roundedRect(x, y, w, h, 10)
        .lineWidth(1)
        .fillAndStroke("#FFFFFF", "#E5E7EB");

      doc.fontSize(12).fillColor("#111827").text(title, x + 14, y + 12);
      doc
        .moveTo(x + 14, y + 32)
        .lineTo(x + w - 14, y + 32)
        .strokeColor("#E5E7EB")
        .stroke();

      return y + 42;
    };

    const row = (x, y, w, label, value) => {
      doc.fontSize(10).fillColor("#111827").text(label, x, y);
      doc.fontSize(10).fillColor("#111827").text(value, x, y, { width: w, align: "right" });
    };

    // ================== HEADER ==================
    doc.fontSize(16).fillColor("#111827").text("Car Rental Invoice", { align: "center" });
    doc.moveDown(0.2);
    doc.fontSize(10).fillColor("#6B7280").text(`Booking ID: #${bookingId}`, { align: "center" });
    doc.moveDown(0.6);

    // ================== CARD 1: BOOKING ==================
    let y = doc.y + 10;
    const x = margin;

    const bookingCardH = 135;
    let innerY = card(x, y, contentW, bookingCardH, "Booking");

    const leftX = x + 14;
    const rightW = contentW - 28;

    row(leftX, innerY + 0, rightW, "Status", safe(b.status || "BOOKED"));
    row(leftX, innerY + 18, rightW, "Total Amount", formatINR(b.total_amount));
    row(leftX, innerY + 36, rightW, "Start Date", safe(b.start_date));
    row(leftX, innerY + 54, rightW, "End Date", safe(b.end_date));
    row(leftX, innerY + 72, rightW, "Pickup", safe(b.pickup_location));
    row(leftX, innerY + 90, rightW, "Drop", safe(b.drop_location));
    row(leftX, innerY + 108, rightW, "Created At", niceDateTime(b.created_at));

    y = y + bookingCardH + 15;

    // ================== CARD 2: CUSTOMER ==================
    const customerCardH = 80;
    innerY = card(x, y, contentW, customerCardH, "Customer");

    row(leftX, innerY + 0, rightW, "Name", safe(b.customer_name));
    row(leftX, innerY + 18, rightW, "Email", safe(b.customer_email));

    y = y + customerCardH + 15;

    // ================== CARD 3: CAR ==================
    const carCardH = 190;
    innerY = card(x, y, contentW, carCardH, "Car");

    row(leftX, innerY + 0, rightW, "Name", safe(b.car_name));
    row(leftX, innerY + 18, rightW, "Brand", safe(b.car_brand));
    row(leftX, innerY + 36, rightW, "Price/Day", formatINR(b.car_price_per_day));

    // ✅ Car image box
    const imgBoxX = leftX;
    const imgBoxY = innerY + 60;
    const imgW = 130;
    const imgH = 100;

    doc
      .roundedRect(imgBoxX, imgBoxY, imgW, imgH, 8)
      .lineWidth(1)
      .strokeColor("#E5E7EB")
      .stroke();

    try {
      // ✅ this supports absolute windows path OR URL
      const imgSource = await loadImageForPdf(b.car_image);

      // console.log("CAR IMAGE VALUE:", b.car_image);
      // console.log("IMG SOURCE:", Buffer.isBuffer(imgSource) ? "BUFFER" : imgSource);

      if (imgSource) {
        doc.image(imgSource, imgBoxX + 6, imgBoxY + 6, {
          fit: [imgW - 12, imgH - 12],
          align: "center",
          valign: "center",
        });
      } else {
        doc.fontSize(9).fillColor("#6B7280").text("No Image", imgBoxX + 45, imgBoxY + 45);
      }
    } catch (e) {
      console.error("Image render error:", e);
      doc.fontSize(9).fillColor("#6B7280").text("Image not loaded", imgBoxX + 20, imgBoxY + 45);
    }

    y = y + carCardH + 20;

    // ================== TOTAL ==================
    doc.fontSize(12).fillColor("#111827").text(`Total Payable: ${formatINR(b.total_amount)}`, {
      align: "right",
    });

    doc.moveDown(1.5);
    doc
      .moveTo(margin, doc.y)
      .lineTo(pageW - margin, doc.y)
      .strokeColor("#E5E7EB")
      .stroke();

    doc.moveDown(0.7);
    doc.fontSize(9).fillColor("#6B7280").text(
      "This invoice is generated electronically and is valid without signature.",
      { align: "center" }
    );

    doc.end();
  } catch (err) {
    console.error("invoicePdf error:", err);
    return res.status(500).json({ message: "Failed to generate invoice" });
  }
};

// ======================== COMPLETE BOOKING ========================

exports.completeBooking = async (req, res) => {
  try {
    const user_id = getUserId(req);
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const booking_id = req.params.id;
    if (!booking_id) return res.status(400).json({ message: "Invalid booking id" });

    const booking = await Booking.findOne({ _id: booking_id, user_id });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const st = String(booking.status || "").toLowerCase();
    if (st === "cancelled") {
      return res.status(400).json({ message: "Cancelled booking can't be completed" });
    }

    booking.status = "COMPLETED";
    await booking.save();

    return res.json({ message: "Ride completed", booking_id });
  } catch (err) {
    console.error("COMPLETE BOOKING ERROR:", err);
    return res.status(500).json({ message: "Failed to complete ride" });
  }
};

// ======================== RIDE TRACKING (PUBLIC) ========================
exports.getTrackingDetails = async (req, res) => {
  try {
    const booking_id = req.params.id;
    if (!booking_id) return res.status(400).json({ message: "Invalid booking id" });

    const booking = await Booking.findById(booking_id)
      .populate({ path: "car_id", select: "name brand cars_image vehicle_number model_name ac_type year seats fuel_type rating" })
      .populate({ path: "driverId", select: "driverName phone driverPhoto experience status isVerified" })
      .lean();

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.json(booking);
  } catch (err) {
    console.error("GET TRACKING DETAILS ERROR:", err);
    return res.status(500).json({ message: "Failed to load tracking details" });
  }
};
