const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const CarRegisterUser = sequelize.define("CarRegisterUser", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: "CAR_REGISTER",
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "ACTIVE",
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
  tableName: "car_register_users",
  timestamps: false,
});

module.exports = CarRegisterUser;
