const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getRequestStats,
  getResourceAllocationStats,
  getUserActivityStats,
  getRecentActivity,
  getRequestTrends,
} = require("../controllers/analyticsController");

const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

// All analytics routes are admin only
router.use(authMiddleware, adminMiddleware);

router.get("/dashboard", getDashboardStats);
router.get("/requests", getRequestStats);
router.get("/resources", getResourceAllocationStats);
router.get("/activity", getUserActivityStats);
router.get("/logs", getRecentActivity);
router.get("/trends", getRequestTrends);

module.exports = router;
