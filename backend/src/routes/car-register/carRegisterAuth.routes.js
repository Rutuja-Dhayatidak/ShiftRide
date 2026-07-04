const express = require("express");
const router = express.Router();

const controller = require("../../controllers/car-register/carRegisterAuth.controller");
const carRegisterAuth = require("../../middleware/carRegisterAuth.middleware");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/me", carRegisterAuth, controller.me);
router.get("/logout", controller.logout);

module.exports = router;
