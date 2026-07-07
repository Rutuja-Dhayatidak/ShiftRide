const { MobileOffer } = require("../../models/mongo");

exports.getActiveOffers = async (req, res) => {
  try {
    const offers = await MobileOffer.find({ status: "Active" }).lean();
    res.json(offers);
  } catch (err) {
    console.error("GET MOBILE OFFERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch mobile offers" });
  }
};
