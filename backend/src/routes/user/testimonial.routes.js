const router = require("express").Router();
const { Testimonial } = require("../../models/mongo");

// Public: get active testimonials
router.get("/", async (req, res) => {
  try {
    const rows = await Testimonial.find({ is_active: true })
      .sort({ created_at: -1 })
      .lean();
    res.json(rows.map(r => ({ ...r, id: String(r._id) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load testimonials" });
  }
});

module.exports = router;
