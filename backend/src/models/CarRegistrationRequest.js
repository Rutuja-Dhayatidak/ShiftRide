const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const CarRegistrationRequest = sequelize.define("CarRegistrationRequest", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  car_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  vehicle_type: {
    type: DataTypes.ENUM("CAR"),
    defaultValue: "CAR",
  },
  car_details: {
    type: DataTypes.TEXT,
  },
  city: {
    type: DataTypes.STRING,
  },
  year: {
    type: DataTypes.INTEGER,
  },
  seats: {
    type: DataTypes.INTEGER,
  },
  fuel_type: {
    type: DataTypes.STRING,
  },
  cars_image: {
    type: DataTypes.STRING,
  },
  requested_category_id: {
    type: DataTypes.INTEGER,
  },
  approved_category_id: {
    type: DataTypes.INTEGER,
  },
  price_per_day: {
    type: DataTypes.DECIMAL(10, 2),
  },
  price_per_km: {
    type: DataTypes.DECIMAL(10, 2),
  },
  rc_book: {
    type: DataTypes.STRING,
  },
  insurance_copy: {
    type: DataTypes.STRING,
  },
  puc_certificate: {
    type: DataTypes.STRING,
  },
  id_proof: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.STRING, // PENDING, APPROVED, REJECTED
    defaultValue: "PENDING",
  },
  admin_remark: {
    type: DataTypes.TEXT,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "car_registration_requests",
  timestamps: false,
});

module.exports = CarRegistrationRequest;
