const User = require("./User");
const Admin = require("./Admin");
const Category = require("./Category");
const Car = require("./Car");
const CarRegisterUser = require("./CarRegisterUser");
const Booking = require("./Booking");
const ToursPackage = require("./ToursPackage");
const TourBooking = require("./TourBooking");
const EventRequest = require("./EventRequest");
const CancelRequest = require("./CancelRequest");
const Contact = require("./Contact");
const Feedback = require("./Feedback");
const CarRegistrationRequest = require("./CarRegistrationRequest");

// Associations
Car.belongsTo(Category, { foreignKey: "category_id" });
Category.hasMany(Car, { foreignKey: "category_id" });

Booking.belongsTo(User, { foreignKey: "user_id" });
Booking.belongsTo(Car, { foreignKey: "car_id" });

TourBooking.belongsTo(User, { foreignKey: "user_id" });
TourBooking.belongsTo(ToursPackage, { foreignKey: "tour_id" });

Feedback.belongsTo(User, { foreignKey: "user_id" });
Feedback.belongsTo(Booking, { foreignKey: "booking_id" });
Feedback.belongsTo(Car, { foreignKey: "car_id" });

CancelRequest.belongsTo(Booking, { foreignKey: "booking_id" });
CancelRequest.belongsTo(User, { foreignKey: "user_id" });

EventRequest.belongsTo(User, { foreignKey: "user_id" });

CarRegistrationRequest.belongsTo(CarRegisterUser, { foreignKey: "car_user_id" });

module.exports = {
  User,
  Admin,
  Category,
  Car,
  CarRegisterUser,
  Booking,
  ToursPackage,
  TourBooking,
  EventRequest,
  CancelRequest,
  Contact,
  Feedback,
  CarRegistrationRequest,
};

