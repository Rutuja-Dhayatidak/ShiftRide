const path = require("path");
const fs = require("fs");
const { ToursPackage } = require("../../models/mongo");

const { uploadToCloudinary } = require("../../utils/cloudinary");

const saveFiles = async (files, subfolder) => {
  if (!files) return "[]";

  const filesArray = Array.isArray(files) ? files : [files];
  const paths = [];
  for (const file of filesArray) {
    const url = await uploadToCloudinary(file);
    if (url) paths.push(url);
  }
  return JSON.stringify(paths);
};

exports.addTour = async (req, res) => {
  try {
    const tourImages = await saveFiles(req.files?.images, "tours");
    const { title, description, duration, price, itinerary, inclusions, exclusions, tour_date, tour_time, routes } = req.body;

    await ToursPackage.create({
      title,
      description,
      duration,
      price: Number(price),
      images: tourImages,
      itinerary,
      inclusions,
      exclusions,
      tour_date: tour_date ? new Date(tour_date) : null,
      tour_time,
      routes,
      status: "PENDING",
      created_by: req.user.id,
      created_by_role: "CAR_REGISTER",
      is_active: true,
    });

    res.json({ message: "Tour package submitted for approval ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add tour" });
  }
};

exports.getMyTours = async (req, res) => {
  try {
    const vendor_id = req.user.id;
    const rows = await ToursPackage.find({ created_by: vendor_id, created_by_role: "CAR_REGISTER" })
      .sort({ created_at: -1 })
      .lean();
    res.json(rows.map((row) => ({ ...row, id: String(row._id) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch your tours" });
  }
};

exports.getTour = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor_id = req.user.id;
    const tour = await ToursPackage.findOne({ _id: id, created_by: vendor_id, created_by_role: "CAR_REGISTER" }).lean();
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    res.json({ ...tour, id: String(tour._id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch tour" });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor_id = req.user.id;
    const updates = req.body;

    const tour = await ToursPackage.findOne({ _id: id, created_by: vendor_id, created_by_role: "CAR_REGISTER" });
    if (!tour) return res.status(404).json({ message: "Tour not found" });

    const possibleFields = ['title', 'description', 'duration', 'price', 'itinerary', 'inclusions', 'exclusions', 'tour_date', 'tour_time', 'routes'];
    possibleFields.forEach((field) => {
      if (updates[field] !== undefined) {
        tour[field] = updates[field];
      }
    });

    if (req.files?.images) {
      tour.images = await saveFiles(req.files.images, "tours");
    }

    tour.status = "PENDING";
    await tour.save();

    res.json({ message: "Tour updated and resubmitted for approval ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update tour" });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor_id = req.user.id;
    const tour = await ToursPackage.findOneAndDelete({ _id: id, created_by: vendor_id, created_by_role: "CAR_REGISTER" });
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    res.json({ message: "Tour deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete tour" });
  }
};
