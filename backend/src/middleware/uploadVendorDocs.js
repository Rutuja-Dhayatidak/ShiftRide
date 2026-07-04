const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../../public/uploads/vendor-documents");
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
  const allowedExtensions = /jpeg|jpg|png|pdf/;
  const mimetype = allowedExtensions.test(file.mimetype);
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Only images (jpeg, jpg, png) and PDF files are allowed!"));
};

const uploadVendorDocs = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
}).fields([
  { name: "aadhaarCard", maxCount: 1 },
  { name: "panCard", maxCount: 1 }
]);

module.exports = uploadVendorDocs;
