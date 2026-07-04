const path = require("path");
const fs = require("fs");
const { Driver } = require("../../models/mongo");

const ensureDriversUploadDir = () => {
  const uploadDir = path.join(__dirname, "../../../public/uploads/drivers");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  return uploadDir;
};

const { uploadToCloudinary } = require("../../utils/cloudinary");

const saveDriverFile = async (file) => {
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
    // ignore unlinking errors
  }
};

exports.addDriver = async (req, res) => {
  try {
    const vendorId = req.user?.id || req.user?.user_id;
    if (!vendorId) return res.status(401).json({ message: "Unauthorized" });

    const { driverName, phone, email, address, licenseNumber, experience } = req.body;

    // Validations
    if (!driverName || !phone || !address || !licenseNumber || !experience) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!req.files || !req.files.driverPhoto || !req.files.licensePhoto) {
      return res.status(400).json({ message: "Driver photo and driving license photo are required" });
    }

    // Save files
    const driverPhoto = await saveDriverFile(req.files.driverPhoto);
    const licensePhoto = await saveDriverFile(req.files.licensePhoto);

    const driver = await Driver.create({
      vendorId,
      driverName,
      phone,
      email: email || null,
      address,
      licenseNumber,
      experience: Number(experience),
      driverPhoto,
      licensePhoto,
      status: "AVAILABLE",
      isVerified: true
    });

    return res.status(201).json({
      message: "Driver registered successfully ✅",
      driver
    });
  } catch (err) {
    console.error("addDriver error:", err);
    return res.status(500).json({ message: err.message || "Failed to register driver" });
  }
};

exports.getDrivers = async (req, res) => {
  try {
    const vendorId = req.user?.id || req.user?.user_id;
    if (!vendorId) return res.status(401).json({ message: "Unauthorized" });

    const drivers = await Driver.find({ vendorId }).sort({ createdAt: -1 }).lean();
    
    // Map id to String for frontend MERN key matching
    const formatted = drivers.map(d => ({ ...d, id: String(d._id) }));
    return res.json(formatted);
  } catch (err) {
    console.error("getDrivers error:", err);
    return res.status(500).json({ message: "Failed to fetch drivers" });
  }
};

exports.updateDriver = async (req, res) => {
  try {
    const id = req.params.id;
    const vendorId = req.user?.id || req.user?.user_id;
    if (!vendorId) return res.status(401).json({ message: "Unauthorized" });

    const driver = await Driver.findOne({ _id: id, vendorId });
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    const { driverName, phone, email, address, licenseNumber, experience } = req.body;

    const updates = {
      ...(driverName !== undefined ? { driverName } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(email !== undefined ? { email: email || null } : {}),
      ...(address !== undefined ? { address } : {}),
      ...(licenseNumber !== undefined ? { licenseNumber } : {}),
      ...(experience !== undefined ? { experience: Number(experience) } : {})
    };

    // Handle files if replaced
    if (req.files) {
      if (req.files.driverPhoto) {
        const oldPhoto = driver.driverPhoto;
        updates.driverPhoto = await saveDriverFile(req.files.driverPhoto);
        unlinkIfExists(oldPhoto);
      }
      if (req.files.licensePhoto) {
        const oldLicense = driver.licensePhoto;
        updates.licensePhoto = await saveDriverFile(req.files.licensePhoto);
        unlinkIfExists(oldLicense);
      }
    }

    Object.assign(driver, updates);
    await driver.save();

    return res.json({
      message: "Driver updated successfully ✅",
      driver
    });
  } catch (err) {
    console.error("updateDriver error:", err);
    return res.status(500).json({ message: "Failed to update driver" });
  }
};

exports.deleteDriver = async (req, res) => {
  try {
    const id = req.params.id;
    const vendorId = req.user?.id || req.user?.user_id;
    if (!vendorId) return res.status(401).json({ message: "Unauthorized" });

    const driver = await Driver.findOne({ _id: id, vendorId });
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    // Unlink photos
    unlinkIfExists(driver.driverPhoto);
    unlinkIfExists(driver.licensePhoto);

    await Driver.deleteOne({ _id: id, vendorId });

    return res.json({ message: "Driver deleted successfully ✅" });
  } catch (err) {
    console.error("deleteDriver error:", err);
    return res.status(500).json({ message: "Failed to delete driver" });
  }
};

exports.updateDriverStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const vendorId = req.user?.id || req.user?.user_id;
    if (!vendorId) return res.status(401).json({ message: "Unauthorized" });

    let { status } = req.body;
    status = String(status || "").trim().toUpperCase();

    if (!["AVAILABLE", "BUSY", "INACTIVE"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const driver = await Driver.findOne({ _id: id, vendorId });
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    driver.status = status;
    await driver.save();

    return res.json({
      message: "Driver availability status updated ✅",
      driver_id: id,
      status
    });
  } catch (err) {
    console.error("updateDriverStatus error:", err);
    return res.status(500).json({ message: "Failed to update driver status" });
  }
};
