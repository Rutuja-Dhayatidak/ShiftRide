const router = require("express").Router();
const authController = require("../../controllers/user/auth.controller");
const ctrl = require("../../controllers/user/forgotPassword.controller");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/verify-otp", authController.verifyOtp);
router.post("/forgot-password", ctrl.forgotPassword);
router.post("/reset-password", ctrl.resetPassword);
router.post("/google", authController.googleLogin);
router.get("/logout", authController.logout);
module.exports = router;
