const mongoose = require("mongoose");
const { Car, Category, Feedback, Booking, Vendor } = require("../../models/mongo");

const getApprovedVendorIds = async () => {
  return await Vendor.find({
    status: "APPROVED",
    canReceivePayments: true,
    razorpayLinkedAccountId: { $ne: null }
  }).distinct("_id");
};


const toCamelId = (doc) => {
  if (!doc) return doc;
  return { ...doc, id: String(doc._id) };
};

const isMongoId = (value) => mongoose.Types.ObjectId.isValid(String(value || ""));


const mapCar = (car) => ({
  ...car,
  id: String(car._id),
  category_name: car.category_id?.name || "-",
});

const parseStatus = (value) => String(value || "").trim().toUpperCase();

exports.getAllCars = async (req, res) => {
  try {
    const approvedVendorIds = await getApprovedVendorIds();
    const cars = await Car.find({ is_active: true, car_user_id: { $in: approvedVendorIds } })
      .populate({ path: "category_id", select: "name" })
      .sort({ is_available: -1, created_at: -1 })
      .lean();

    res.json(cars.map(mapCar));
  } catch (err) {
    console.error("GET ALL CARS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch cars" });
  }
};

exports.availableCars = async (req, res) => {
  try {
    const approvedVendorIds = await getApprovedVendorIds();
    const cars = await Car.find({ is_active: true, is_available: true, car_user_id: { $in: approvedVendorIds } })
      .populate({ path: "category_id", select: "name" })
      .sort({ created_at: -1 })
      .lean();
    res.json(cars.map(mapCar));
  } catch (err) {
    console.error("AVAILABLE CARS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch available cars" });
  }
};

exports.filterCars = async (req, res) => {
  try {
    const {
      category_id,
      brand,
      city,
      fuel_type,
      seats,
      year,
      min_price,
      max_price,
      min_rating,
      available,
      badge,
      vehicle_type,
      women_safety,
    } = req.query;

    const approvedVendorIds = await getApprovedVendorIds();
    const filter = { is_active: true, car_user_id: { $in: approvedVendorIds } };

    if (category_id && isMongoId(category_id)) {
      filter.category_id = category_id;
    }
    if (brand) filter.brand = new RegExp(brand, "i");
    if (city) filter.city = new RegExp(city, "i");
    if (fuel_type) filter.fuel_type = fuel_type;
    if (seats) filter.seats = Number(seats) || undefined;
    if (year) filter.year = Number(year) || undefined;
    if (min_price) filter.price_per_day = { ...filter.price_per_day, $gte: Number(min_price) };
    if (max_price) filter.price_per_day = { ...filter.price_per_day, $lte: Number(max_price) };
    if (min_rating) filter.rating = { $gte: Number(min_rating) };
    if (available === "1") filter.is_available = true;
    if (badge && badge !== "all") filter.badge = badge;
    if (vehicle_type && vehicle_type !== "all") filter.vehicle_type = vehicle_type.toUpperCase();
    if (women_safety === "true" || women_safety === "1" || women_safety === true) {
      filter.women_safety_verified = true;
    }

    const cars = await Car.find(filter)
      .populate({ path: "category_id", select: "name" })
      .sort({ is_available: -1, created_at: -1 })
      .lean();

    res.json(cars.map(mapCar));
  } catch (err) {
    console.error("FILTER CARS ERROR:", err);
    res.status(500).json({ message: "Failed to filter cars" });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ is_active: true }, "name").sort({ created_at: -1 }).lean();
    res.json(categories.map(toCamelId));
  } catch (err) {
    console.error("GET CATEGORIES ERROR:", err);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

exports.getCarById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isMongoId(id)) return res.status(400).json({ message: "Invalid car id" });

    const approvedVendorIds = await getApprovedVendorIds();
    const car = await Car.findOne({ _id: id, is_active: true, car_user_id: { $in: approvedVendorIds } })
      .populate({ path: "category_id", select: "name" })
      .lean();

    if (!car) return res.status(404).json({ message: "Car not found" });
    res.json(mapCar(car));
  } catch (err) {
    console.error("GET CAR BY ID ERROR:", err);
    res.status(500).json({ message: "Failed to fetch car" });
  }
};

exports.getCarReviews = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isMongoId(id)) return res.status(400).json({ message: "Invalid car id" });

    const reviews = await Feedback.find({ car_id: id })
      .populate({ path: "user_id", select: "name" })
      .sort({ created_at: -1 })
      .lean();

    res.json(reviews.map((review) => ({
      ...review,
      id: String(review._id),
      username: review.user_id?.name || "",
    })));
  } catch (err) {
    console.error("CAR REVIEWS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch car reviews" });
  }
};

exports.suggestCars = async (req, res) => {
  try {
    const exclude_car_id = req.query.exclude_car_id;
    const city = String(req.query.city || "").trim();
    const category_id = req.query.category_id;
    const start_date = String(req.query.start_date || "").trim();
    const end_date = String(req.query.end_date || "").trim();
    const limit = Math.min(12, Math.max(1, Number(req.query.limit || 6)));

    if (!start_date || !end_date) {
      return res.status(400).json({ message: "start_date and end_date are required" });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid start_date or end_date" });
    }

    const bookedCarIds = await Booking.find({
      status: { $nin: ["CANCELLED"] },
      $nor: [
        { end_date: { $lt: start } },
        { start_date: { $gt: end } },
      ],
    }).distinct("car_id");

    const approvedVendorIds = await getApprovedVendorIds();
    const filter = {
      is_active: true,
      is_available: true,
      _id: { $nin: bookedCarIds },
      car_user_id: { $in: approvedVendorIds }
    };

    if (exclude_car_id && isMongoId(exclude_car_id)) {
      filter._id.$nin.push(mongoose.Types.ObjectId(exclude_car_id));
    }
    if (city) filter.city = new RegExp(city, "i");
    if (category_id && isMongoId(category_id)) filter.category_id = category_id;

    const cars = await Car.find(filter)
      .populate({ path: "category_id", select: "name" })
      .sort({ rating: -1, created_at: -1 })
      .limit(limit)
      .lean();

    res.json(cars.map(mapCar));
  } catch (err) {
    console.error("SUGGEST CARS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch suggestions" });
  }
};

exports.searchCars = async (req, res) => {
  try {
    const { pickup, drop, date, time, budget, women_safety } = req.query;

    if (!pickup || !drop) {
      return res.status(400).json({ success: false, message: "Pickup and Drop locations are required" });
    }

    const googleMaps = require("../../services/googleMaps.service");
    
    // Get road distance & duration
    const distData = await googleMaps.getDistanceAndDuration(pickup, drop);
    if (!distData || distData.distanceKm <= 0) {
      return res.status(400).json({ success: false, message: "Unable to calculate distance" });
    }

    // 1. Find booked car IDs for the searched date to prevent double booking
    let bookedCarIds = [];
    if (date) {
      const searchDate = new Date(date);
      if (!isNaN(searchDate.getTime())) {
        const startOfDay = new Date(searchDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(searchDate);
        endOfDay.setHours(23, 59, 59, 999);

        bookedCarIds = await Booking.find({
          status: { $nin: ["CANCELLED"] },
          $nor: [
            { end_date: { $lt: startOfDay } },
            { start_date: { $gt: endOfDay } }
          ]
        }).distinct("car_id");
      }
    }

    // Query active and available cars belonging to approved vendors, excluding already booked ones
    const approvedVendorIds = await getApprovedVendorIds();
    const carQuery = {
      is_active: true,
      is_available: true,
      car_user_id: { $in: approvedVendorIds },
      _id: { $nin: bookedCarIds }
    };

    if (women_safety === "true" || women_safety === "1" || women_safety === true) {
      carQuery.women_safety_verified = true;
    }

    const cars = await Car.find(carQuery).lean();

    const maxBudget = Number(budget) || null;

    const mappedCars = cars.map((car) => {
      const pricePerKm = Number(car.price_per_km || car.pricePerKm) || 0;
      const estimatedFare = googleMaps.calculateFare(distData.distanceKm, pricePerKm);

      return {
        ...car,
        id: String(car._id),
        pricePerKm,
        distanceKm: distData.distanceKm,
        estimatedFare,
        duration: distData.duration,
        category_name: car.category_id?.name || "-",
      };
    });

    // Filter by budget if provided
    let filteredCars = mappedCars;
    if (maxBudget) {
      filteredCars = mappedCars.filter((car) => car.estimatedFare <= maxBudget);
    }

    res.json({
      success: true,
      pickup,
      drop,
      distanceKm: distData.distanceKm,
      duration: distData.duration,
      cars: filteredCars
    });
  } catch (err) {
    console.error("SEARCH CARS ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to search cars" });
  }
};
