const express = require("express");
const router = express.Router();

const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const { authMiddleware } = require("../middleware/authMiddleware");

// All notification routes are protected
router.use(authMiddleware);

router.get("/", getNotifications);
router.get("/unread/count", getUnreadCount);
router.put("/:notificationId/read", markAsRead);
router.put("/mark-all/read", markAllAsRead);
router.delete("/:notificationId", deleteNotification);

module.exports = router;
