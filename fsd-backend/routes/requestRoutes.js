const express = require("express");
const router = express.Router();

const {
  requestResource,
  getRequests,
  getUserRequests,
  getRequest,
  approveRequest,
  rejectRequest,
} = require("../controllers/requestController");

const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const { validateRequestCreate, validate } = require("../utils/validators");

// User routes
router.post("/", authMiddleware, validateRequestCreate, validate, requestResource);
router.get("/my-requests", authMiddleware, getUserRequests);

// Admin routes
router.get("/", authMiddleware, adminMiddleware, getRequests);
router.get("/:id", authMiddleware, getRequest);
router.put("/:id/approve", authMiddleware, adminMiddleware, approveRequest);
router.put("/:id/reject", authMiddleware, adminMiddleware, rejectRequest);

module.exports = router;
