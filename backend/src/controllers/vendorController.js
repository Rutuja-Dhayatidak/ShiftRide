const bcrypt = require("bcryptjs");
const { Vendor, CarRegistrationRequest } = require("../models/mongo");
const sendOTP = require("../utils/email");
const { uploadToCloudinary } = require("../utils/cloudinary");

exports.registerVendor = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      password,
      address,
      businessName,
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName
    } = req.body;

    // 1. Basic Text Field Validations
    if (
      !name ||
      !phone ||
      !email ||
      !password ||
      !address ||
      !businessName ||
      !accountHolderName ||
      !accountNumber ||
      !ifscCode ||
      !bankName
    ) {
      return res.status(400).json({ message: "All text fields (including bank details) are required" });
    }

    // 2. Check for Uploaded Files
    const requiredFiles = [
      "aadhaarCard",
      "panCard"
    ];

    for (const fileField of requiredFiles) {
      if (!req.files || !req.files[fileField] || req.files[fileField].length === 0) {
        return res.status(400).json({ message: `Document ${fileField} is required` });
      }
    }

    // 3. Duplicate Checks
    const existingEmail = await Vendor.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      if (!existingEmail.isEmailVerified) {
        // Delete unverified abandoned registration request to allow retry
        await Vendor.findByIdAndDelete(existingEmail._id);
      } else {
        return res.status(400).json({ message: "Email is already registered" });
      }
    }

    const existingPhone = await Vendor.findOne({ phone });
    if (existingPhone) {
      if (!existingPhone.isEmailVerified) {
        await Vendor.findByIdAndDelete(existingPhone._id);
      } else {
        return res.status(400).json({ message: "Phone number is already registered" });
      }
    }

    // 4. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // KYC
    const aadhaarCard = await uploadToCloudinary(req.files["aadhaarCard"][0]);
    const panCard = await uploadToCloudinary(req.files["panCard"][0]);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // Send OTP to Vendor email
    await sendOTP(email.toLowerCase(), otp);

    // 5. Create Vendor Record
    const newVendor = new Vendor({
      name,
      phone,
      email: email.toLowerCase(),
      password: hashedPassword,
      address,
      businessName,
      role: "vendor",

      // KYC
      aadhaarCard,
      panCard,

      // Verification
      isEmailVerified: false,
      otp,
      otp_expiry: otpExpiry,

      // Bank Details
      bankDetails: {
        accountHolderName,
        accountNumber,
        ifscCode,
        bankName
      },

      // Payment status
      status: "PENDING",
      isBlocked: false,
      documentVerificationStatus: "PENDING",
      canReceivePayments: false,
      razorpayLinkedAccountId: null,
      razorpayAccountStatus: "PENDING"
    });

    await newVendor.save();

    return res.status(201).json({
      success: true,
      otpSent: true,
      vendorId: newVendor._id,
      message: "OTP sent to your email"
    });

  } catch (err) {
    console.error("registerVendor error:", err);
    return res.status(500).json({
      message: err.message || "Failed to register vendor"
    });
  }
};

exports.verifyRegisterOtp = async (req, res) => {
  try {
    const { vendorId, otp } = req.body;

    if (!vendorId || !otp) {
      return res.status(400).json({ message: "OTP and Vendor ID are required" });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor request not found" });
    }

    if (vendor.otp !== Number(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > vendor.otp_expiry) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    vendor.isEmailVerified = true;
    vendor.otp = null;
    vendor.otp_expiry = null;
    await vendor.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! Registration request sent to admin."
    });
  } catch (err) {
    console.error("verifyRegisterOtp error:", err);
    return res.status(500).json({ message: "Failed to verify registration OTP" });
  }
};

exports.addCarRequest = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      name,
      brand,
      category_id,
      vehicle_type,
      car_details,
      city,
      year,
      seats,
      fuel_type,
      price_per_day,
      price_per_km,
      requested_category_id,
      vehicle_number,
      model_name,
      ac_type,
      extra_km_charge,
    } = req.body;

    // Frontend validation & Required fields empty -> error
    if (
      !name ||
      !brand ||
      !category_id ||
      !vehicle_number ||
      !model_name ||
      !ac_type ||
      extra_km_charge === undefined ||
      !price_per_day ||
      !price_per_km ||
      !requested_category_id
    ) {
      return res.status(400).json({ message: "All required text fields must be filled" });
    }

    // Multer file fields checking
    const requiredFiles = [
      "front_image",
      "back_image",
      "left_image",
      "right_image",
      "interior_image",
      "number_plate_image",
      "rc_book",
      "insurance_copy",
      "puc_certificate",
      "permit_document",
      "id_proof",
    ];

    for (const fileField of requiredFiles) {
      if (!req.files || !req.files[fileField] || req.files[fileField].length === 0) {
        return res.status(400).json({ message: `File upload for '${fileField}' is required` });
      }
    }

    // Upload files to Cloudinary
    const front_image = await uploadToCloudinary(req.files["front_image"]?.[0]);
    const back_image = await uploadToCloudinary(req.files["back_image"]?.[0]);
    const left_image = await uploadToCloudinary(req.files["left_image"]?.[0]);
    const right_image = await uploadToCloudinary(req.files["right_image"]?.[0]);
    const interior_image = await uploadToCloudinary(req.files["interior_image"]?.[0]);
    const number_plate_image = await uploadToCloudinary(req.files["number_plate_image"]?.[0]);
    const rc_book = await uploadToCloudinary(req.files["rc_book"]?.[0]);
    const insurance_copy = await uploadToCloudinary(req.files["insurance_copy"]?.[0]);
    const puc_certificate = await uploadToCloudinary(req.files["puc_certificate"]?.[0]);
    const permit_document = await uploadToCloudinary(req.files["permit_document"]?.[0]);
    const id_proof = await uploadToCloudinary(req.files["id_proof"]?.[0]);

    // Create the car request with default "PENDING" status
    const carReq = await CarRegistrationRequest.create({
      car_user_id: userId,
      name,
      brand,
      category_id,
      vehicle_type: (vehicle_type || "CAR").toUpperCase(),
      car_details: car_details || null,
      city: city || null,
      year: year ? Number(year) : null,
      seats: seats ? Number(seats) : null,
      fuel_type: fuel_type || null,
      price_per_day: Number(price_per_day),
      price_per_km: Number(price_per_km),
      requested_category_id,
      
      // New fields
      vehicle_number,
      model_name,
      ac_type,
      extra_km_charge: Number(extra_km_charge),

      // Images
      front_image,
      back_image,
      left_image,
      right_image,
      interior_image,
      number_plate_image,

      // Documents
      rc_book,
      insurance_copy,
      puc_certificate,
      permit_document,
      id_proof,

      // Backward Compatibility
      cars_image: front_image,

      // Default status
      status: "PENDING",
    });

    return res.status(201).json({
      success: true,
      message: "Car submitted for approval ✅",
      carRequest: carReq,
    });
  } catch (err) {
    console.error("addCarRequest error:", err);
    return res.status(500).json({ message: err?.message || "Failed to register car request" });
  }
};
