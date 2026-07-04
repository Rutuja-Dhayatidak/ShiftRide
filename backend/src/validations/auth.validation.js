const { body } = require("express-validator");

exports.userRegisterValidation = [
  body("name")
    .notEmpty().withMessage("Name is required"),

  body("email")
    .isEmail().withMessage("Valid email is required"),

  body("password")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
    .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter")
    .matches(/[a-z]/).withMessage("Password must contain a lowercase letter")
    .matches(/[0-9]/).withMessage("Password must contain a number")
    .matches(/[@$!%*?&]/).withMessage("Password must contain a special character"),
];

exports.userLoginValidation = [
  body("email")
    .isEmail().withMessage("Valid email is required"),

  body("password")
    .notEmpty().withMessage("Password is required"),
];

exports.adminLoginValidation = [
  body("email")
    .isEmail().withMessage("Valid email is required"),

  body("password")
    .notEmpty().withMessage("Password is required"),
];
