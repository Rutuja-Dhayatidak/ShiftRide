const { validationResult } = require("express-validator");

module.exports = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log("VALIDATION ERRORS DETECTED:", errors.array());
    return res.status(422).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  next();
};
