const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const EventRequest = sequelize.define("EventRequest", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  event_type: {
    type: DataTypes.STRING,
  },
  city: {
    type: DataTypes.STRING,
  },
  start_date: {
    type: DataTypes.DATEONLY,
  },
  end_date: {
    type: DataTypes.DATEONLY,
  },
  start_time: {
    type: DataTypes.STRING,
  },
  cars_qty: {
    type: DataTypes.INTEGER,
  },
  badge: {
    type: DataTypes.STRING,
  },
  min_seats: {
    type: DataTypes.INTEGER,
  },
  billing_type: {
    type: DataTypes.STRING,
  },
  distance_km: {
    type: DataTypes.DECIMAL(10, 2),
  },
  pickup_location: {
    type: DataTypes.STRING,
  },
  pickup_lat: {
    type: DataTypes.DECIMAL(10, 8),
  },
  pickup_lng: {
    type: DataTypes.DECIMAL(11, 8),
  },
  drop_location: {
    type: DataTypes.STRING,
  },
  drop_lat: {
    type: DataTypes.DECIMAL(10, 8),
  },
  drop_lng: {
    type: DataTypes.DECIMAL(11, 8),
  },
  phone: {
    type: DataTypes.STRING,
  },
  note: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "PENDING",
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "event_requests",
  timestamps: false,
});

module.exports = EventRequest;
