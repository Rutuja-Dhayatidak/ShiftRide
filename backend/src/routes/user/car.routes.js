const router = require("express").Router();
const carCtrl = require("../../controllers/user/car.controller");

// Because this router is mounted at "/cars"
// the final URLs become:
// GET /cars
// GET /cars/available
// GET /cars/filter
// GET /cars/categories
// GET /cars/:id
// GET /cars/:id/reviews

router.get("/", carCtrl.getAllCars);
router.get("/available", carCtrl.availableCars);
router.get("/filter", carCtrl.filterCars);
router.get("/categories", carCtrl.getCategories);
router.get("/search", carCtrl.searchCars);
router.get("/:id", carCtrl.getCarById);
router.get("/:id/reviews", carCtrl.getCarReviews);
router.get("/suggest", carCtrl.suggestCars);



module.exports = router;
