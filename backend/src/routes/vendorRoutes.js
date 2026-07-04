    const express = require("express");
    const router = express.Router();
    const uploadVendorDocs = require("../middleware/uploadVendorDocs");
    const vendorController = require("../controllers/vendorController");

    // Vendor Registration Endpoint
    router.post("/register", uploadVendorDocs, vendorController.registerVendor);
    router.post("/verify-register-otp", vendorController.verifyRegisterOtp);

    // Vendor Add Car Endpoint (Mounted before express-fileupload in server.js to allow Multer handling)
    const auth = require("../middleware/carRegisterAuth.middleware");
    const uploadCarDocs = require("../middleware/uploadCarDocs");
    router.post("/cars/add", auth, uploadCarDocs, vendorController.addCarRequest);

    module.exports = router;
