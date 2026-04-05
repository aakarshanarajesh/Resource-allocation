const express = require("express");
const router = express.Router();

const {
  createResource,
  getResources,
  getAvailableResources,
  getResource,
  updateResource,
  deleteResource,
} = require("../controllers/resourceController");

const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const { validateResource, validate } = require("../utils/validators");

// Public routes (protected by auth)
router.get("/", authMiddleware, getResources);
router.get("/available", authMiddleware, getAvailableResources);
router.get("/:id", authMiddleware, getResource);

// Admin routes
router.post("/", authMiddleware, adminMiddleware, validateResource, validate, createResource);
router.put("/:id", authMiddleware, adminMiddleware, validateResource, validate, updateResource);
router.delete("/:id", authMiddleware, adminMiddleware, deleteResource);

module.exports = router;