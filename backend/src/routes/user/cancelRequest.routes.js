const router = require("express").Router();
const jwtUtils = require("../../utils/jwt");
const ctrl = require("../../controllers/user/cancelRequest.controller");

// POST /bookings/cancel-request/:id
router.post("/cancel-request/:id", jwtUtils.authMiddleware("user"), ctrl.createCancelRequest);

module.exports = router;
