const express = require("express");
const router = express.Router();

const {
  register,
  login,
  refreshToken,
  getCurrentUser,
  logout,
  registerAdmin,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const { authMiddleware } = require("../middleware/authMiddleware");
const { loginLimiter, registerLimiter } = require("../middleware/rateLimiter");
const {
  validate,
  validateRegister,
  validateLogin,
} = require("../utils/validators");

// Public routes
router.post("/register", registerLimiter, validateRegister, validate, register);
router.post("/login", loginLimiter, validateLogin, validate, login);
router.post("/refresh-token", refreshToken);
router.post("/register-admin", registerLimiter, validateRegister, validate, registerAdmin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected routes
router.get("/me", authMiddleware, getCurrentUser);
router.post("/logout", authMiddleware, logout);

module.exports = router;