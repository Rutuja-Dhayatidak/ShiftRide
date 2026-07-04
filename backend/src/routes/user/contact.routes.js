const router = require("express").Router();
const contactController = require("../../controllers/user/contact.controller");

router.post("/", contactController.createContact);

module.exports = router;
