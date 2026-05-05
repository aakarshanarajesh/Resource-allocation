const Request = require('../models/Request');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const resourceService = require('./resourceService');

class RequestService {
  // Get all requests with filters
  async getAllRequests(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = {};

    if (filters.status) query.status = filters.status;
    if (filters.userId) query.user = filters.userId;

    const requests = await Request.find(query)
      .populate('user', 'name email')
      .populate('resource', 'name description totalUnits availableUnits')
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
      .populate('resource', 'name description totalUnits availableUnits')
      .sort({ createdAt: -1 });
    return requests;
  }

  // Create request with quantity validation
  async createRequest(userId, resourceId, quantity = 1) {
    // Validate quantity
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    // Check resource availability
    const resource = await resourceService.getResourceById(resourceId);
    if (resource.availableUnits < quantity) {
      throw new Error(`Not enough units available. Available: ${resource.availableUnits}, Requested: ${quantity}`);
    }

    const request = await Request.create({
      user: userId,
      resource: resourceId,
      quantity,
      status: 'PENDING',
    });

    await request.populate('user', 'name email');
    await request.populate('resource', 'name description totalUnits availableUnits');

    // Log activity
    await ActivityLog.create({
      userId,
      action: 'REQUEST_CREATED',
      description: `Created request for ${quantity} unit(s) of resource`,
      entityType: 'Request',
      entityId: request._id,
    });

    return request;
  }

  // Approve request and reduce available units
  async approveRequest(requestId) {
    const request = await Request.findById(requestId)
      .populate('user', 'name email')
      .populate('resource', 'name description totalUnits availableUnits');

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== 'PENDING') {
      throw new Error(`Cannot approve request with status: ${request.status}`);
    }

    // Final availability check before approval
    if (request.resource.availableUnits < request.quantity) {
      throw new Error(`Cannot approve: Only ${request.resource.availableUnits} units available, but ${request.quantity} requested`);
    }

    // Reduce available units
    await resourceService.reduceAvailableUnits(request.resource._id, request.quantity);

    // Update request status
    const updatedRequest = await Request.findByIdAndUpdate(
      requestId,
      { status: 'APPROVED' },
      { new: true }
    ).populate('user', 'name email').populate('resource', 'name description totalUnits availableUnits');

    // Create notification
    await Notification.create({
      user: request.user._id,
      title: 'Request Approved',
      message: `Your request for ${request.quantity} unit(s) of ${request.resource.name} has been approved`,
      type: 'APPROVAL',
      relatedRequest: requestId,
    });

    // Log activity
    await ActivityLog.create({
      userId: request.user._id,
      action: 'REQUEST_APPROVED',
      description: `Request approved for ${request.quantity} unit(s) of ${request.resource.name}`,
      entityType: 'Request',
      entityId: requestId,
    });

    return updatedRequest;
  }

  // Reject request and restore available units
  async rejectRequest(requestId) {
    const request = await Request.findById(requestId)
      .populate('user', 'name email')
      .populate('resource', 'name description totalUnits availableUnits');

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== 'PENDING') {
      throw new Error(`Cannot reject request with status: ${request.status}`);
    }

    // Update request status
    const updatedRequest = await Request.findByIdAndUpdate(
      requestId,
      { status: 'REJECTED' },
      { new: true }
    ).populate('user', 'name email').populate('resource', 'name description totalUnits availableUnits');

    // Create notification
    await Notification.create({
      user: request.user._id,
      title: 'Request Rejected',
      message: `Your request for ${request.quantity} unit(s) of ${request.resource.name} has been rejected`,
      type: 'REJECTION',
      relatedRequest: requestId,
    });

    // Log activity
    await ActivityLog.create({
      userId: request.user._id,
      action: 'REQUEST_REJECTED',
      description: `Request rejected for ${request.quantity} unit(s) of ${request.resource.name}`,
      entityType: 'Request',
      entityId: requestId,
    });

    return updatedRequest;
  }

  // Get request by ID
  async getRequestById(requestId) {
    const request = await Request.findById(requestId)
      .populate('user', 'name email')
      .populate('resource', 'name description totalUnits availableUnits');

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
