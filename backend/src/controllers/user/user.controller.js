const { User } = require("../../models/mongo");

/* ================= GET ALL USERS ================= */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "name email created_at").sort({ created_at: -1 }).lean();
    res.json(users);
  } catch (err) {
    console.error("GET ALL USERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/* ================= GET USER BY ID ================= */
exports.getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const authUserId = req.user?.id;

    if (!authUserId || id !== authUserId) {
      return res.status(403).json({ message: "Forbidden: You can only view your own profile" });
    }

    const user = await User.findById(id, "name email created_at").lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

/* ================= UPDATE PROFILE ================= */
exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const authUserId = req.user?.id;

    if (!authUserId || id !== authUserId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const { name, email } = req.body;
    await User.findByIdAndUpdate(id, { name, email }, { new: true, runValidators: true });

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};
