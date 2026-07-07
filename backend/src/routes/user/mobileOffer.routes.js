const router = require("express").Router();
const mobileOfferCtrl = require("../../controllers/user/mobileOffer.controller");

router.get("/", mobileOfferCtrl.getActiveOffers);

module.exports = router;
