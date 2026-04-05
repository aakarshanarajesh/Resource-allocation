const analyticsService = require("../services/analyticsService");
const { asyncHandler } = require("../utils/errorHandler");

// Get dashboard stats (admin only)
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getDashboardStats();

  res.json({
    success: true,
    stats,
  });
});

// Get request statistics
exports.getRequestStats = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getRequestStats();

  res.json({
    success: true,
    stats,
  });
});

// Get resource allocation stats
exports.getResourceAllocationStats = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getResourceAllocationStats();

  res.json({
    success: true,
    stats,
  });
});

// Get user activity stats
exports.getUserActivityStats = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const activity = await analyticsService.getUserActivityStats(days);

  res.json({
    success: true,
    activity,
  });
});

// Get recent activity logs
exports.getRecentActivity = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const logs = await analyticsService.getRecentActivity(limit);

  res.json({
    success: true,
    logs,
  });
});

// Get request trends (last 7 days)
exports.getRequestTrends = asyncHandler(async (req, res) => {
  const trends = await analyticsService.getRequestTrends();

  res.json({
    success: true,
    trends,
  });
});
