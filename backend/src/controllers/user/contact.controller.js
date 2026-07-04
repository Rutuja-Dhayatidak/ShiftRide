const { Contact } = require("../../models/mongo");

exports.createContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await Contact.create({ name, email, phone, subject, message });
    return res.json({ message: "Message sent successfully" });
  } catch (err) {
    console.error("CREATE CONTACT ERROR:", err);
    return res.status(500).json({ message: "Failed to send message" });
  }
};
