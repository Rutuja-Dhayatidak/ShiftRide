const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const ToursPackage = sequelize.define("ToursPackage", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  duration: {
    type: DataTypes.STRING,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  images: {
    type: DataTypes.TEXT,
  },
  routes: {
    type: DataTypes.TEXT,
  },
  itinerary: {
    type: DataTypes.TEXT,
  },
  inclusions: {
    type: DataTypes.TEXT,
  },
  exclusions: {
    type: DataTypes.TEXT,
  },
  tour_date: {
    type: DataTypes.DATEONLY,
  },
  tour_time: {
    type: DataTypes.TIME,
  },
  status: {
    type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
    defaultValue: "PENDING",
  },
  created_by: {
    type: DataTypes.INTEGER,
  },
  created_by_role: {
    type: DataTypes.ENUM("ADMIN", "CAR_REGISTER"),
    defaultValue: "ADMIN",
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
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
  tableName: "tours_packages",
  timestamps: false,
});

module.exports = ToursPackage;
