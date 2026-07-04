const express = require("express");
const router = express.Router();
const auth = require("../../middleware/carRegisterAuth.middleware");
const ctrl = require("../../controllers/car-register/carRegister.controller");

/* ===== FILE UPLOAD ===== */


router.get("/categories", auth, ctrl.getCategories);
router.post("/cars/add", auth, ctrl.addCarRequest); 
router.get("/cars/my", auth, ctrl.getMyCars);
router.get("/cars/my/all", auth, ctrl.getMyCarsAll);
router.get("/dashboard/stats", auth, ctrl.getDashboardStats);
router.get("/bookings/my", auth, ctrl.getMyBookings);
router.put("/cars/:id", auth, ctrl.updateCarBothTables);
router.delete("/cars/:id", auth, ctrl.deleteCarBothTables);

/* ===== TOURS ===== */
const toursCtrl = require("../../controllers/car-register/car-register.tours.controller");
router.post("/tours", auth, toursCtrl.addTour);
router.get("/tours", auth, toursCtrl.getMyTours);
router.get("/tours/:id", auth, toursCtrl.getTour);
router.put("/tours/:id", auth, toursCtrl.updateTour);
router.delete("/tours/:id", auth, toursCtrl.deleteTour);

/* ===== DRIVERS ===== */
const driverCtrl = require("../../controllers/car-register/carRegister.driver.controller");
router.post("/drivers/add", auth, driverCtrl.addDriver);
router.get("/drivers", auth, driverCtrl.getDrivers);
router.put("/drivers/:id", auth, driverCtrl.updateDriver);
router.delete("/drivers/:id", auth, driverCtrl.deleteDriver);
router.patch("/drivers/:id/status", auth, driverCtrl.updateDriverStatus);

module.exports = router;
