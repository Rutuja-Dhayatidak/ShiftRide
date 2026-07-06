const mongoose = require("mongoose");
const { Booking, Car, Vendor, User } = require("../../models/mongo");
const razorpayService = require("../../services/razorpayService");

function getUserId(req) {
  return req.user?.id || req.user?.user_id || req.user_id || null;
}

function calcDays(start_date, end_date) {
  const s = new Date(start_date);
  const e = new Date(end_date);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 1;

  const diff = Math.ceil((e - s) / (24 * 60 * 60 * 1000)) + 1;
  return diff > 0 ? diff : 1;
}

exports.createBookingOrder = async (req, res) => {
  try {
    const user_id = getUserId(req);
    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      car_id,
      pickup_location,
      drop_location,
      start_date,
      end_date,
      booking_mode = "RENTAL",
      start_time = null,
      billing_type = "PER_DAY",
      distance_km = null,
      women_safety_mode = false,
    } = req.body;

    // 1. Fetch Car and Vendor
    const car = await Car.findById(car_id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    if (!car.is_active || !car.is_available) {
      return res.status(400).json({ message: "Car is not available for booking" });
    }

    const vendor = await Vendor.findById(car.car_user_id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found for this car" });
    }

    // In production, split payments require linked account setup
    const isLive = process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.startsWith("your_");
    if (isLive) {
      if (vendor.status !== "APPROVED") {
        return res.status(400).json({ message: "Vendor is not approved to receive bookings" });
      }
      if (!vendor.canReceivePayments || !vendor.razorpayLinkedAccountId) {
        return res.status(400).json({ message: "Vendor payment account is not active" });
      }
    }

    // 2. Calculations
    const finalBookingMode = booking_mode.toUpperCase();
    const finalBillingType = billing_type.toUpperCase();
    const finalEndDate = finalBookingMode === "TRANSFER" ? start_date : end_date;

    const days = finalBookingMode === "TRANSFER" ? 1 : calcDays(start_date, finalEndDate);
    const rate_per_day = Number(car.price_per_day || 0);
    const rate_per_km = Number(car.price_per_km || 0);
    const baseRate = finalBookingMode === "TRANSFER" ? rate_per_km : rate_per_day;

    let billedKm = null;
    if (finalBillingType === "PER_KM") {
      const km = Number(distance_km);
      if (!Number.isFinite(km) || km <= 0) {
        return res.status(400).json({ message: "distance_km is required for PER_KM billing" });
      }
      billedKm = finalBookingMode === "RENTAL" ? Number((km * 2).toFixed(2)) : Number(km.toFixed(2));
    }

    const baseFare = finalBillingType === "PER_DAY"
      ? Number((baseRate * days).toFixed(2))
      : Number((baseRate * billedKm).toFixed(2));

    const platformFee = Number((baseFare * 0.10).toFixed(2));
    const gst = Number((baseFare * 0.18).toFixed(2));
    const totalAmount = Number((baseFare + platformFee + gst).toFixed(2));

    const customerInfo = req.body.customerInfo || (req.body.name || req.body.email || req.body.phone ? {
      name: req.body.name || null,
      email: req.body.email || null,
      phone: req.body.phone || null
    } : null);

    // 3. Create Pending Booking in Database
    const booking = await Booking.create({
      user_id,
      car_id,
      pickup_location,
      drop_location,
      start_date: new Date(start_date),
      end_date: new Date(finalEndDate),
      distance_km: billedKm,
      rate_per_day,
      rate_per_km,
      baseFare,
      platformFee,
      gst,
      total_amount: totalAmount,
      vendorAmount: baseFare,
      adminAmount: Number((platformFee + gst).toFixed(2)),
      transferStatus: "PENDING",
      status: "PENDING_PAYMENT",
      bookingStatus: "PENDING_PAYMENT",
      paymentStatus: "PENDING",
      booking_mode: finalBookingMode,
      billing_type: finalBillingType,
      start_time,
      women_safety_mode,
      customerInfo: customerInfo || null,
      bookingSource: req.body.bookingSource || "WEBSITE",
    });

    // 4. Create Razorpay Order
    let razorpayOrderId = null;
    let orderDetails = null;

    try {
      const order = await razorpayService.createOrder({
        amount: totalAmount * 100, // Razorpay works in paise
        vendorAccountId: vendor.razorpayLinkedAccountId,
        vendorAmount: baseFare * 100, // baseFare split directly to vendor
        bookingId: booking._id
      });

      razorpayOrderId = order.id;
      orderDetails = order;

      // Update booking with Razorpay Order ID
      booking.razorpayOrderId = razorpayOrderId;
      await booking.save();
    } catch (orderErr) {
      console.error("RAZORPAY ORDER CREATION FAILED:", orderErr);
      // Clean up booking if Razorpay order creation fails
      await Booking.deleteOne({ _id: booking._id });
      return res.status(500).json({ message: `Razorpay order creation failed: ${orderErr.message}` });
    }

    return res.status(201).json({
      message: "Order created successfully",
      booking_id: String(booking._id),
      razorpayOrderId,
      orderDetails,
      pricing: {
        baseFare,
        platformFee,
        gst,
        totalAmount,
      },
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_SNw35MkokY8h1y"
    });
  } catch (err) {
    console.error("CREATE BOOKING ORDER ERROR:", err);
    return res.status(500).json({ message: err.message || "Failed to initiate payment" });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { booking_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!booking_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing required payment verification details" });
    }

    const booking = await Booking.findById(booking_id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify signature
    const isValid = razorpayService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      booking.status = "PAYMENT_FAILED";
      booking.bookingStatus = "PAYMENT_FAILED";
      booking.paymentStatus = "FAILED";
      booking.transferStatus = "FAILED";
      await booking.save();
      return res.status(400).json({ message: "Payment signature verification failed" });
    }

    // Success transition
    booking.status = "BOOKED"; // To support existing frontend status check
    booking.bookingStatus = "CONFIRMED";
    booking.paymentStatus = "PAID";
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature;
    booking.vendorAmount = booking.baseFare;
    booking.adminAmount = Number((booking.platformFee + booking.gst).toFixed(2));
    booking.transferStatus = "SUCCESS";
    await booking.save();

    // Mark car as booked, update vendor stats, and trigger async email alert to vendor
    try {
      const car = await Car.findById(booking.car_id);
      if (car && car.car_user_id) {
        // Update stats
        await Vendor.findByIdAndUpdate(car.car_user_id, {
          $inc: { totalBookings: 1, totalRevenue: Number(booking.baseFare || 0) }
        });

        // Fetch vendor & customer details to trigger email in the background
        const [vendor, user] = await Promise.all([
          Vendor.findById(car.car_user_id),
          User.findById(booking.user_id)
        ]);

        if (vendor && vendor.email) {
          const mailer = require("../../utils/email");
          const mailDetails = {
            bookingId: String(booking._id),
            carName: car.name,
            carBrand: car.brand || "-",
            pickup: booking.pickup_location || "-",
            drop: booking.drop_location || "-",
            startDate: new Date(booking.start_date).toISOString().split("T")[0],
            endDate: new Date(booking.end_date).toISOString().split("T")[0],
            startTime: booking.start_time || null,
            totalAmount: booking.total_amount,
            vendorShare: booking.vendorAmount || booking.baseFare,
            customerName: user?.name || booking.customerInfo?.name || "Guest Customer",
            customerPhone: user?.phone || booking.customerInfo?.phone || "-",
            customerEmail: user?.email || booking.customerInfo?.email || "-"
          };

          // Send mail asynchronously
          mailer.sendBookingNotificationToVendor(vendor.email, mailDetails)
            .then(() => console.log(`[Email Notification] Booking alert successfully sent to vendor: ${vendor.email}`))
            .catch(err => console.error("[Email Notification] Failed to send booking notification to vendor:", err));
        }
      }
    } catch (e) {
      console.warn("[Email Notification] Failed to process vendor alert:", e.message);
    }

    return res.status(200).json({
      message: "Payment verified and booking confirmed!",
      booking_id: String(booking._id),
      status: "BOOKED"
    });
  } catch (err) {
    console.error("VERIFY PAYMENT ERROR:", err);
    return res.status(500).json({ message: err.message || "Verification failed" });
  }
};

exports.initiatePaymentForBooking = async (req, res) => {
  try {
    const user_id = getUserId(req);
    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { bookingId } = req.params;
    if (!bookingId) {
      return res.status(400).json({ message: "bookingId is required" });
    }

    // 1. Fetch Booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check status
    if (booking.bookingStatus !== "DRIVER_ACCEPTED" || booking.paymentStatus !== "NOT_PAID") {
      return res.status(400).json({ message: "Payment can only be initiated when driver has accepted the booking and payment is not paid" });
    }

    // 2. Fetch Car and Vendor
    const car = await Car.findById(booking.car_id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    const vendor = await Vendor.findById(car.car_user_id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found for this car" });
    }

    // In production, split payments require linked account setup
    const isLive = process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.startsWith("your_");
    if (isLive) {
      if (vendor.status !== "APPROVED") {
        return res.status(400).json({ message: "Vendor is not approved to receive bookings" });
      }
      if (!vendor.canReceivePayments || !vendor.razorpayLinkedAccountId) {
        return res.status(400).json({ message: "Vendor payment account is not active" });
      }
    }

    // 3. Create Razorpay Order
    let razorpayOrderId = null;
    let orderDetails = null;

    try {
      const order = await razorpayService.createOrder({
        amount: Math.round(booking.total_amount * 100), // Razorpay works in paise
        vendorAccountId: vendor.razorpayLinkedAccountId,
        vendorAmount: Math.round(booking.baseFare * 100), // baseFare split directly to vendor
        bookingId: booking._id
      });

      razorpayOrderId = order.id;
      orderDetails = order;

      // Update booking with Razorpay Order ID
      booking.razorpayOrderId = razorpayOrderId;
      await booking.save();
    } catch (orderErr) {
      console.error("RAZORPAY ORDER CREATION FAILED FOR EXISTING BOOKING:", orderErr);
      return res.status(500).json({ message: `Razorpay order creation failed: ${orderErr.message}` });
    }

    return res.status(200).json({
      message: "Order created successfully for existing booking",
      booking_id: String(booking._id),
      razorpayOrderId,
      orderDetails,
      pricing: {
        baseFare: booking.baseFare,
        platformFee: booking.platformFee,
        gst: booking.gst,
        totalAmount: booking.total_amount,
      },
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_SNw35MkokY8h1y"
    });
  } catch (err) {
    console.error("INITIATE PAYMENT ERROR:", err);
    return res.status(500).json({ message: err.message || "Failed to initiate payment" });
  }
};
