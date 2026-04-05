const requestService = require("../services/requestService");
const resourceService = require("../services/resourceService");
const { asyncHandler, AppError } = require("../utils/errorHandler");

// USER requests resource
exports.requestResource = asyncHandler(async (req, res) => {
  const { resourceId } = req.body;
  const userId = req.user.id;

  // Verify resource exists and is available
  const resource = await resourceService.getResourceById(resourceId);
  if (resource.isAllocated) {
    throw new AppError("Resource is already allocated", 400);
  }

  const request = await requestService.createRequest(userId, resourceId);

  res.status(201).json({
    success: true,
    message: "Resource request created successfully",
    request,
  });
});

// USER gets their requests
exports.getUserRequests = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const requests = await requestService.getUserRequests(userId);

  res.json({
    success: true,
    requests,
  });
});

// ADMIN views all requests
exports.getRequests = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const filters = {
    status: req.query.status ? req.query.status.toUpperCase() : null,
  };

  const result = await requestService.getAllRequests(filters, page, limit);

  res.json({
    success: true,
    ...result,
  });
});

// GET single request
exports.getRequest = asyncHandler(async (req, res) => {
  const request = await requestService.getRequestById(req.params.id);

  res.json({
    success: true,
    request,
  });
});

// ADMIN approves request
exports.approveRequest = asyncHandler(async (req, res) => {
  const request = await requestService.approveRequest(req.params.id);

  // Allocate resource to user
  await resourceService.allocateResource(request.resource._id, request.user._id);

  res.json({
    success: true,
    message: "Request approved successfully",
    request,
  });
});

// ADMIN rejects request
exports.rejectRequest = asyncHandler(async (req, res) => {
  const request = await requestService.rejectRequest(req.params.id);

  res.json({
    success: true,
    message: "Request rejected successfully",
    request,
  });
});