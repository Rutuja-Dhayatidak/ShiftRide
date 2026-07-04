const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { Feature } = require("../../models/mongo");

const ensureFeaturesUploadDir = () => {
  const uploadDir = path.join(__dirname, "../../../public/uploads/features");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  return uploadDir;
};

const { uploadToCloudinary } = require("../../utils/cloudinary");

const saveFeatureFile = async (file) => {
  if (!file) return null;
  return await uploadToCloudinary(file);
};

// GET all features
router.get("/", async (req, res) => {
  try {
    const list = await Feature.find({}).sort({ created_at: 1 });
    return res.json(list);
  } catch (err) {
    console.error("GET features error:", err);
    return res.status(500).json({ message: "Failed to fetch features" });
  }
});

// POST create new feature
router.post("/", async (req, res) => {
  try {
    const { title, description, icon, bgClass, glowClass, bgCircle } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    if (!req.files || !req.files.img) {
      return res.status(400).json({ message: "Feature image is required" });
    }

    const imgPath = await saveFeatureFile(req.files.img);

    const newFeature = new Feature({
      title,
      description,
      icon: icon || "Car",
      bgClass: bgClass || "bg-[#00D1B2]",
      glowClass: glowClass || "shadow-[0_0_20px_rgba(0,209,178,0.5)] ring-[6px] ring-[#00D1B2]/20",
      bgCircle: bgCircle || "bg-[#00D1B2]/10",
      img: imgPath,
    });

    await newFeature.save();
    return res.status(201).json(newFeature);
  } catch (err) {
    console.error("POST features error:", err);
    return res.status(500).json({ message: "Failed to create feature" });
  }
});

// PUT update existing feature
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, icon, bgClass, glowClass, bgCircle } = req.body;

    const feature = await Feature.findById(id);
    if (!feature) {
      return res.status(404).json({ message: "Feature not found" });
    }

    if (title) feature.title = title;
    if (description) feature.description = description;
    if (icon) feature.icon = icon;
    if (bgClass) feature.bgClass = bgClass;
    if (glowClass) feature.glowClass = glowClass;
    if (bgCircle) feature.bgCircle = bgCircle;

    if (req.files && req.files.img) {
      // delete old file if exists
      try {
        const oldAbs = path.join(__dirname, "../../../public", feature.img.startsWith("/") ? feature.img.slice(1) : feature.img);
        if (fs.existsSync(oldAbs)) fs.unlinkSync(oldAbs);
      } catch (e) {
        console.error("Failed to delete old image:", e);
      }

      feature.img = await saveFeatureFile(req.files.img);
    }

    await feature.save();
    return res.json(feature);
  } catch (err) {
    console.error("PUT features error:", err);
    return res.status(500).json({ message: "Failed to update feature" });
  }
});

// DELETE feature
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const feature = await Feature.findById(id);
    if (!feature) {
      return res.status(404).json({ message: "Feature not found" });
    }

    // delete file
    try {
      const oldAbs = path.join(__dirname, "../../../public", feature.img.startsWith("/") ? feature.img.slice(1) : feature.img);
      if (fs.existsSync(oldAbs)) fs.unlinkSync(oldAbs);
    } catch (e) {
      console.error("Failed to delete image on delete:", e);
    }

    await Feature.findByIdAndDelete(id);
    return res.json({ message: "Feature deleted successfully" });
  } catch (err) {
    console.error("DELETE features error:", err);
    return res.status(500).json({ message: "Failed to delete feature" });
  }
});

module.exports = router;
