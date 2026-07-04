const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Feedback = sequelize.define("Feedback", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  booking_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  car_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "feedback",
  timestamps: false,
});

module.exports = Feedback;
