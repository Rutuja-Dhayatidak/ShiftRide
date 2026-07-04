const { Category } = require("../../models/mongo");

exports.getCategories = async (req, res) => {
  try {
    const data = await Category.find({ is_active: true }, "name").sort({ _id: -1 }).lean();
    res.json(data);
  } catch (err) {
    console.error("GET CATEGORIES ERROR:", err);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};
