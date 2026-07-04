const express = require("express");
const router = express.Router();
const { Media } = require("../../models/mongo");

// GET the current active Story watch video
router.get("/active", async (req, res) => {
  try {
    const activeMedia = await Media.findOne({ type: "STORY", is_active: true }).lean();
    if (!activeMedia) {
      return res.json({ file_path: null });
    }
    return res.json({
      id: String(activeMedia._id),
      title: activeMedia.title,
      file_path: activeMedia.file_path,
      is_active: activeMedia.is_active,
      created_at: activeMedia.created_at
    });
  } catch (err) {
    console.error("GET active media error:", err);
    return res.status(500).json({ message: "Failed to fetch active video" });
  }
});

// GET the current active Hero background video
router.get("/active-hero", async (req, res) => {
  try {
    const activeMedia = await Media.findOne({ type: "HERO_BACKGROUND", is_active: true }).lean();
    if (!activeMedia) {
      return res.json({ file_path: null });
    }
    return res.json({
      id: String(activeMedia._id),
      title: activeMedia.title,
      file_path: activeMedia.file_path,
      is_active: activeMedia.is_active,
      created_at: activeMedia.created_at
    });
  } catch (err) {
    console.error("GET active hero media error:", err);
    return res.status(500).json({ message: "Failed to fetch active background video" });
  }
});

// GET the current active Cars page background video
router.get("/active-cars", async (req, res) => {
  try {
    const activeMedia = await Media.findOne({ type: "CARS_BG", is_active: true }).lean();
    if (!activeMedia) {
      return res.json({ file_path: null });
    }
    return res.json({
      id: String(activeMedia._id),
      title: activeMedia.title,
      file_path: activeMedia.file_path,
      is_active: activeMedia.is_active,
      created_at: activeMedia.created_at
    });
  } catch (err) {
    console.error("GET active cars bg media error:", err);
    return res.status(500).json({ message: "Failed to fetch cars background video" });
  }
});

// GET the current active Events page background video/image
router.get("/active-events", async (req, res) => {
  try {
    const activeMedia = await Media.findOne({ type: "EVENTS_BG", is_active: true }).lean();
    if (!activeMedia) {
      return res.json({ file_path: null });
    }
    return res.json({
      id: String(activeMedia._id),
      title: activeMedia.title,
      file_path: activeMedia.file_path,
      is_active: activeMedia.is_active,
      created_at: activeMedia.created_at
    });
  } catch (err) {
    console.error("GET active events bg media error:", err);
    return res.status(500).json({ message: "Failed to fetch events background" });
  }
});

// GET the current active Booking page background video/image
router.get("/active-booking", async (req, res) => {
  try {
    const activeMedia = await Media.findOne({ type: "BOOKING_BG", is_active: true }).lean();
    if (!activeMedia) {
      return res.json({ file_path: null });
    }
    return res.json({
      id: String(activeMedia._id),
      title: activeMedia.title,
      file_path: activeMedia.file_path,
      is_active: activeMedia.is_active,
      created_at: activeMedia.created_at
    });
  } catch (err) {
    console.error("GET active booking bg media error:", err);
    return res.status(500).json({ message: "Failed to fetch booking background" });
  }
});

module.exports = router;
