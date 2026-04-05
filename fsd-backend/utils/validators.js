const { body, validationResult } = require('express-validator');

// Validation middleware runner
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

// Auth validations
const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
];

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Resource validations
const validateResource = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Resource name is required')
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 5 })
    .withMessage('Description must be at least 5 characters'),
];

// Request validations
const validateRequestCreate = [
  body('resourceId')
    .isMongoId()
    .withMessage('Invalid resource ID'),
];

module.exports = {
  validate,
  validateRegister,
  validateLogin,
  validateResource,
  validateRequestCreate,
};
