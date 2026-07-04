const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../../public/uploads/cars");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const cleanOriginalName = file.originalname.replace(/\s+/g, "");
    cb(null, uniqueSuffix + "-" + cleanOriginalName);
  }
});

// File Filter (Images and PDFs)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|pdf|webp/;
  const mimetype = allowedExtensions.test(file.mimetype);
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Only images (jpeg, jpg, png, webp) and PDF files are allowed!"));
};

const uploadCarDocs = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
}).fields([
  { name: "front_image", maxCount: 1 },
  { name: "back_image", maxCount: 1 },
  { name: "left_image", maxCount: 1 },
  { name: "right_image", maxCount: 1 },
  { name: "interior_image", maxCount: 1 },
  { name: "number_plate_image", maxCount: 1 },
  { name: "rc_book", maxCount: 1 },
  { name: "insurance_copy", maxCount: 1 },
  { name: "puc_certificate", maxCount: 1 },
  { name: "permit_document", maxCount: 1 },
  { name: "id_proof", maxCount: 1 }
]);

module.exports = uploadCarDocs;
