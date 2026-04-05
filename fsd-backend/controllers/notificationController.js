const Notification = require("../models/Notification");
const { asyncHandler, AppError } = require("../utils/errorHandler");

// Get user notifications
exports.getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ user: userId })
    .populate("relatedRequest")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Notification.countDocuments({ user: userId });

  res.json({
    success: true,
    notifications,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
});

// Get unread notifications count
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const unreadCount = await Notification.countDocuments({
    user: userId,
    isRead: false,
  });

  res.json({
    success: true,
    unreadCount,
  });
});

// Mark notification as read
exports.markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { notificationId } = req.params;

  const notification = await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  // Verify ownership
  if (notification.user.toString() !== userId) {
    throw new AppError("Unauthorized", 403);
  }

  res.json({
    success: true,
    message: "Notification marked as read",
    notification,
  });
});

// Mark all as read
exports.markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true }
  );

  res.json({
    success: true,
    message: "All notifications marked as read",
  });
});

// Delete notification
exports.deleteNotification = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { notificationId } = req.params;

  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  // Verify ownership
  if (notification.user.toString() !== userId) {
    throw new AppError("Unauthorized", 403);
  }

  await Notification.findByIdAndDelete(notificationId);

  res.json({
    success: true,
    message: "Notification deleted",
  });
});
