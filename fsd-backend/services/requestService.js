const Request = require('../models/Request');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

class RequestService {
  // Get all requests with filters
  async getAllRequests(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = {};

    if (filters.status) query.status = filters.status;
    if (filters.userId) query.user = filters.userId;

    const requests = await Request.find(query)
      .populate('user', 'name email')
      .populate('resource', 'name description')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Request.countDocuments(query);
    return {
      requests,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get user requests
  async getUserRequests(userId) {
    const requests = await Request.find({ user: userId })
      .populate('resource', 'name description')
      .sort({ createdAt: -1 });
    return requests;
  }

  // Create request
  async createRequest(userId, resourceId) {
    const request = await Request.create({
      user: userId,
      resource: resourceId,
      status: 'PENDING',
    });

    await request.populate('user', 'name email');
    await request.populate('resource', 'name description');

    // Log activity
    await ActivityLog.create({
      userId,
      action: 'REQUEST_CREATED',
      description: `Created request for resource`,
      entityType: 'Request',
      entityId: request._id,
    });

    return request;
  }

  // Approve request
  async approveRequest(requestId) {
    const request = await Request.findByIdAndUpdate(
      requestId,
      { status: 'APPROVED' },
      { new: true }
    ).populate('user', 'name email').populate('resource', 'name description');

    if (!request) {
      throw new Error('Request not found');
    }

    // Create notification
    await Notification.create({
      user: request.user._id,
      title: 'Request Approved',
      message: `Your request for ${request.resource.name} has been approved`,
      type: 'APPROVAL',
      relatedRequest: request._id,
    });

    // Log activity
    await ActivityLog.create({
      userId: request.user._id,
      action: 'REQUEST_APPROVED',
      description: `Request approved for ${request.resource.name}`,
      entityType: 'Request',
      entityId: request._id,
    });

    return request;
  }

  // Reject request
  async rejectRequest(requestId) {
    const request = await Request.findByIdAndUpdate(
      requestId,
      { status: 'REJECTED' },
      { new: true }
    ).populate('user', 'name email').populate('resource', 'name description');

    if (!request) {
      throw new Error('Request not found');
    }

    // Create notification
    await Notification.create({
      user: request.user._id,
      title: 'Request Rejected',
      message: `Your request for ${request.resource.name} has been rejected`,
      type: 'REJECTION',
      relatedRequest: request._id,
    });

    // Log activity
    await ActivityLog.create({
      userId: request.user._id,
      action: 'REQUEST_REJECTED',
      description: `Request rejected for ${request.resource.name}`,
      entityType: 'Request',
      entityId: request._id,
    });

    return request;
  }

  // Get request by ID
  async getRequestById(requestId) {
    const request = await Request.findById(requestId)
      .populate('user', 'name email')
      .populate('resource', 'name description');

    if (!request) {
      throw new Error('Request not found');
    }
    return request;
  }

  // Get pending requests count
  async getPendingCount() {
    return await Request.countDocuments({ status: 'PENDING' });
  }

  // Get approved requests count
  async getApprovedCount() {
    return await Request.countDocuments({ status: 'APPROVED' });
  }

  // Get rejected requests count
  async getRejectedCount() {
    return await Request.countDocuments({ status: 'REJECTED' });
  }
}

module.exports = new RequestService();
