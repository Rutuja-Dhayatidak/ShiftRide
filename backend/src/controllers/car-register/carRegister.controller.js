const path = require("path");
const fs = require("fs");
const { CarRegistrationRequest, Category, Car, Booking, ToursPackage, TourBooking } = require("../../models/mongo");
const { deleteFile } = require("../../utils/fileHelper");

const ensureCarsUploadDir = () => {
  const uploadDir = path.join(__dirname, "../../../public/uploads/cars");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  return uploadDir;
};

const { uploadToCloudinary } = require("../../utils/cloudinary");

const saveCarFile = async (file) => {
  if (!file) return null;
  return await uploadToCloudinary(file);
};

const unlinkIfExists = (publicPath) => {
  try {
    if (!publicPath) return;
    const p = String(publicPath).replace(/\\/g, "/");
    const abs = path.join(__dirname, "../../../public", p.startsWith("/") ? p.slice(1) : p);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  } catch (e) {
    // ignore
  }
};

exports.addCarRequest = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const cars_image = await saveCarFile(req.files?.cars_image);
    const rc_book = await saveCarFile(req.files?.rc_book);
    const insurance_copy = await saveCarFile(req.files?.insurance_copy);
    const puc_certificate = await saveCarFile(req.files?.puc_certificate);
    const id_proof = await saveCarFile(req.files?.id_proof);

    const {
      name,
      brand,
      category_id,
      car_details,
      city,
      year,
      seats,
      fuel_type,
      price_per_day,
      price_per_km,
      requested_category_id,
      vehicle_type,
    } = req.body;

    if (!name || !brand || !category_id || !requested_category_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const normalizedVehicleType = (vehicle_type || "CAR").toUpperCase();

    await CarRegistrationRequest.create({
      car_user_id: userId,
      name,
      brand,
      category_id,
      vehicle_type: normalizedVehicleType,
      car_details: car_details || null,
      city: city || null,
      year: year ? Number(year) : null,
      seats: seats ? Number(seats) : null,
      fuel_type: fuel_type || null,
      cars_image,
      requested_category_id,
      price_per_day: price_per_day ? Number(price_per_day) : null,
      price_per_km: price_per_km ? Number(price_per_km) : null,
      rc_book,
      insurance_copy,
      puc_certificate,
      id_proof,
      status: "PENDING",
    });

    return res.json({ message: "Car submitted for admin approval ✅" });
  } catch (err) {
    console.error("addCarRequest error:", err);
    return res.status(500).json({ message: err?.message || "Failed to submit car" });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ is_active: true }, "name").lean();
    res.json(categories.map((category) => ({ ...category, id: String(category._id) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

exports.getMyCars = async (req, res) => {
  try {
    const rows = await CarRegistrationRequest.find({ car_user_id: req.user.id, status: "APPROVED" })
      .sort({ created_at: -1 })
      .lean();
    res.json(rows.map((row) => ({ ...row, id: String(row._id) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load my cars" });
  }
};

exports.getMyCarsAll = async (req, res) => {
  try {
    const rows = await CarRegistrationRequest.find({ car_user_id: req.user.id })
      .sort({ created_at: -1 })
      .lean();
    res.json(rows.map((row) => ({ ...row, id: String(row._id) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load my car requests" });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const uid = req.user.id;

    const [total_cars, approved_cars, pending_cars, rejected_cars] = await Promise.all([
      CarRegistrationRequest.countDocuments({ car_user_id: uid }),
      CarRegistrationRequest.countDocuments({ car_user_id: uid, status: "APPROVED" }),
      CarRegistrationRequest.countDocuments({ car_user_id: uid, status: "PENDING" }),
      CarRegistrationRequest.countDocuments({ car_user_id: uid, status: "REJECTED" }),
    ]);

    const ownedCarIds = await Car.find({ car_user_id: uid }).distinct("_id");

    const [total_bookings, revenueResult, total_tour_packages, ownedTourIds] = await Promise.all([
      Booking.countDocuments({ car_id: { $in: ownedCarIds }, status: { $nin: ["CANCELLED"] } }),
      Booking.aggregate([
        { 
          $match: { 
            car_id: { $in: ownedCarIds }, 
            $or: [
              { status: { $in: ["BOOKED", "COMPLETED", "PAID"] } },
              { paymentStatus: "PAID" }
            ]
          } 
        },
        { 
          $group: { 
            _id: null, 
            total: { $sum: { $ifNull: ["$baseFare", "$total_amount"] } } 
          } 
        },
      ]),
      ToursPackage.countDocuments({ created_by: uid, created_by_role: "CAR_REGISTER" }),
      ToursPackage.find({ created_by: uid, created_by_role: "CAR_REGISTER" }).distinct("_id"),
    ]);

    const tourBookingCount = ownedTourIds.length
      ? await TourBooking.countDocuments({ tour_id: { $in: ownedTourIds } })
      : 0;

    res.json({
      total_cars,
      approved_cars,
      pending_cars,
      rejected_cars,
      total_bookings,
      total_revenue: Number(revenueResult?.[0]?.total || 0),
      total_tour_packages,
      total_tour_bookings: tourBookingCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load dashboard stats" });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const ownedCarIds = await Car.find({ car_user_id: req.user.id }).distinct("_id");
    const rows = await Booking.find({ car_id: { $in: ownedCarIds } })
      .populate({ path: "user_id", select: "name email phone" })
      .populate({ path: "car_id", select: "name brand cars_image price_per_day price_per_km badge city" })
      .sort({ created_at: -1 })
      .lean();

    res.json(rows.map((row) => ({ ...row, id: String(row._id) })));
  } catch (err) {
    console.error("getMyBookings error:", err);
    res.status(500).json({ message: "Failed to load bookings" });
  }
};

exports.updateCarBothTables = async (req, res) => {
  try {
    const id = req.params.id;
    const carUserId = req.user?.id;

    if (!carUserId) return res.status(401).json({ message: "Unauthorized" });

    const request = await CarRegistrationRequest.findOne({ _id: id, car_user_id: carUserId });
    if (!request) return res.status(404).json({ message: "Car request not found" });

    const oldReq = request.toObject();
    const newCarsImage = await saveCarFile(req.files?.cars_image);
    const newRcBook = await saveCarFile(req.files?.rc_book);
    const newInsurance = await saveCarFile(req.files?.insurance_copy);
    const newPuc = await saveCarFile(req.files?.puc_certificate);
    const newIdProof = await saveCarFile(req.files?.id_proof);

    const {
      name,
      brand,
      category_id,
      car_details,
      city,
      year,
      seats,
      fuel_type,
      price_per_day,
      price_per_km,
      requested_category_id,
      vehicle_type,
    } = req.body;

    const requestUpdates = {
      ...(name !== undefined ? { name } : {}),
      ...(brand !== undefined ? { brand } : {}),
      ...(category_id !== undefined ? { category_id } : {}),
      ...(requested_category_id !== undefined ? { requested_category_id } : {}),
      ...(car_details !== undefined ? { car_details } : {}),
      ...(city !== undefined ? { city } : {}),
      ...(year !== undefined ? { year: year ? Number(year) : null } : {}),
      ...(seats !== undefined ? { seats: seats ? Number(seats) : null } : {}),
      ...(fuel_type !== undefined ? { fuel_type } : {}),
      ...(price_per_day !== undefined ? { price_per_day: price_per_day ? Number(price_per_day) : null } : {}),
      ...(price_per_km !== undefined ? { price_per_km: price_per_km ? Number(price_per_km) : null } : {}),
      ...(vehicle_type !== undefined ? { vehicle_type: vehicle_type.toUpperCase() } : {}),
      ...(newCarsImage ? { cars_image: newCarsImage } : {}),
      ...(newRcBook ? { rc_book: newRcBook } : {}),
      ...(newInsurance ? { insurance_copy: newInsurance } : {}),
      ...(newPuc ? { puc_certificate: newPuc } : {}),
      ...(newIdProof ? { id_proof: newIdProof } : {}),
    };

    if (Object.keys(requestUpdates).length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    Object.assign(request, requestUpdates);
    await request.save();

    const car = await Car.findOne({ car_request_id: id, car_user_id: carUserId });
    if (car) {
      const carUpdates = {
        ...(name !== undefined ? { name } : {}),
        ...(brand !== undefined ? { brand } : {}),
        ...(category_id !== undefined ? { category_id } : {}),
        ...(car_details !== undefined ? { car_details } : {}),
        ...(city !== undefined ? { city } : {}),
        ...(year !== undefined ? { year: year ? Number(year) : null } : {}),
        ...(seats !== undefined ? { seats: seats ? Number(seats) : null } : {}),
        ...(fuel_type !== undefined ? { fuel_type } : {}),
        ...(price_per_day !== undefined ? { price_per_day: price_per_day ? Number(price_per_day) : null } : {}),
        ...(price_per_km !== undefined ? { price_per_km: price_per_km ? Number(price_per_km) : null } : {}),
        ...(vehicle_type !== undefined ? { vehicle_type: vehicle_type.toUpperCase() } : {}),
        ...(newCarsImage ? { cars_image: newCarsImage } : {}),
      };

      if (Object.keys(carUpdates).length > 0) {
        Object.assign(car, carUpdates);
        await car.save();
      }
    }

    if (newCarsImage && oldReq.cars_image && oldReq.cars_image !== newCarsImage) unlinkIfExists(oldReq.cars_image);
    if (newRcBook && oldReq.rc_book && oldReq.rc_book !== newRcBook) unlinkIfExists(oldReq.rc_book);
    if (newInsurance && oldReq.insurance_copy && oldReq.insurance_copy !== newInsurance) unlinkIfExists(oldReq.insurance_copy);
    if (newPuc && oldReq.puc_certificate && oldReq.puc_certificate !== newPuc) unlinkIfExists(oldReq.puc_certificate);
    if (newIdProof && oldReq.id_proof && oldReq.id_proof !== newIdProof) unlinkIfExists(oldReq.id_proof);

    return res.json({ message: "Car updated successfully ✅" });
  } catch (err) {
    console.error("updateCarBothTables error:", err);
    return res.status(500).json({ message: "Failed to update car" });
  }
};

exports.deleteCarBothTables = async (req, res) => {
  try {
    const id = req.params.id;
    const carUserId = req.user?.id;
    if (!carUserId) return res.status(401).json({ message: "Unauthorized" });

    const request = await CarRegistrationRequest.findOne({ _id: id, car_user_id: carUserId }).lean();
    if (!request) return res.status(404).json({ message: "Car request not found" });

    const car = await Car.findOne({ car_request_id: id, car_user_id: carUserId });
    if (car) {
      const cnt = await Booking.countDocuments({ car_id: car._id, status: { $nin: ["CANCELLED"] } });
      if (cnt > 0) {
        return res.status(400).json({ message: "Cannot delete. This car is already booked." });
      }
    }

    await Car.deleteMany({ car_request_id: id, car_user_id: carUserId });
    await CarRegistrationRequest.deleteOne({ _id: id, car_user_id: carUserId });

    unlinkIfExists(request.cars_image);
    unlinkIfExists(request.rc_book);
    unlinkIfExists(request.insurance_copy);
    unlinkIfExists(request.puc_certificate);
    unlinkIfExists(request.id_proof);

    return res.json({ message: "Car deleted successfully ✅" });
  } catch (err) {
    console.error("deleteCarBothTables error:", err);
    res.status(500).json({ message: "Failed to delete car" });
  }
};
