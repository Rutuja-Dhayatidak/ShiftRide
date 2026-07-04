const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Car = sequelize.define("Car", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  brand: {
    type: DataTypes.STRING,
  },
  car_details: {
    type: DataTypes.TEXT,
  },
  cars_image: {
    type: DataTypes.STRING,
  },
  category_id: {
    type: DataTypes.INTEGER,
  },
  vehicle_type: {
    type: DataTypes.ENUM("CAR"),
    defaultValue: "CAR",
  },
  price_per_day: {
    type: DataTypes.DECIMAL(10, 2),
  },
  price_per_km: {
    type: DataTypes.DECIMAL(10, 2),
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
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
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
  },
  badge: {
    type: DataTypes.STRING,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "cars",
  timestamps: false,
});

module.exports = Car;
