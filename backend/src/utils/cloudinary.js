const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a local file (from Multer path, express-fileupload path, etc) to Cloudinary.
 * Deletes the local temporary file after upload.
 * 
 * @param {string|object} file - Can be a path string, or a file object with tempFilePath or path
 * @returns {Promise<string>} The secure Cloudinary URL
 */
const uploadToCloudinary = async (file) => {
  if (!file) return null;
  
  let filePath = "";
  if (typeof file === "string") {
    filePath = file;
  } else if (file.tempFilePath) {
    filePath = file.tempFilePath;
  } else if (file.path) {
    filePath = file.path;
  } else {
    throw new Error("Invalid file format passed to uploadToCloudinary");
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "shiftride",
      resource_type: "auto",
    });
    
    // Clean up local temp file if it exists
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.error("Failed to delete temp file:", e);
      }
    }

    return result.secure_url;
  } catch (error) {
    // Make sure to clean up even if upload fails
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        // ignore
      }
    }
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
};
