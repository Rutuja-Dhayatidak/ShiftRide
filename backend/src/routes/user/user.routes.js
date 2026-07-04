const router = require("express").Router();
const userCtrl = require("../../controllers/user/user.controller");
const auth = require("../../middleware/auth.middleware");

router.get("/", auth, userCtrl.getAllUsers);
router.get("/:id", auth, userCtrl.getProfile);
router.put("/:id", auth, userCtrl.updateProfile);

module.exports = router;
