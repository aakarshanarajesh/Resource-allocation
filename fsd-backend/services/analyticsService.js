const User = require('../models/User');
const Request = require('../models/Request');
const Resource = require('../models/Resource');
const ActivityLog = require('../models/ActivityLog');

class AnalyticsService {
  // Get dashboard stats
  async getDashboardStats() {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'ADMIN' });
    const totalResources = await Resource.countDocuments();
    const allocatedResources = await Resource.countDocuments({ isAllocated: true });
    const availableResources = await Resource.countDocuments({ isAllocated: false });

    const totalRequests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: 'PENDING' });
    const approvedRequests = await Request.countDocuments({ status: 'APPROVED' });
    const rejectedRequests = await Request.countDocuments({ status: 'REJECTED' });

    return {
      users: {
        total: totalUsers,
        admins: totalAdmins,
      },
      resources: {
        total: totalResources,
        allocated: allocatedResources,
        available: availableResources,
      },
      requests: {
        total: totalRequests,
        pending: pendingRequests,
        approved: approvedRequests,
        rejected: rejectedRequests,
      },
    };
  }

  // Get request statistics
  async getRequestStats() {
    const stats = await Request.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    return stats;
  }

  // Get resource allocation stats
  async getResourceAllocationStats() {
    const allocated = await Resource.countDocuments({ isAllocated: true });
    const unallocated = await Resource.countDocuments({ isAllocated: false });
    const total = await Resource.countDocuments();

    return {
      total,
      allocated,
      unallocated,
      utilizationRate: total > 0 ? ((allocated / total) * 100).toFixed(2) : 0,
    };
  }

  // Get user activity stats
  async getUserActivityStats(days = 30) {
    const date = new Date();
    date.setDate(date.getDate() - days);

    const activity = await ActivityLog.aggregate([
      {
        $match: {
          createdAt: { $gte: date },
        },
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    return activity;
  }

  // Get recent activity logs
  async getRecentActivity(limit = 20) {
    const logs = await ActivityLog.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);
    return logs;
  }

  // Get request trends (last 7 days)
  async getRequestTrends() {
    const date = new Date();
    date.setDate(date.getDate() - 7);

    const trends = await Request.aggregate([
      {
        $match: {
          createdAt: { $gte: date },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return trends;
  }
}

module.exports = new AnalyticsService();
