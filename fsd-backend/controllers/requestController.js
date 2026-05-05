const requestService = require("../services/requestService");
const resourceService = require("../services/resourceService");
const { asyncHandler, AppError } = require("../utils/errorHandler");

// USER requests resource with quantity
exports.requestResource = asyncHandler(async (req, res) => {
  const { resourceId, quantity = 1 } = req.body;
  const userId = req.user.id;

  // Verify resource exists
  const resource = await resourceService.getResourceById(resourceId);
  
  // Check availability
  if (resource.availableUnits < quantity) {
    throw new AppError(`Not enough units available. Available: ${resource.availableUnits}, Requested: ${quantity}`, 400);
  }

  const request = await requestService.createRequest(userId, resourceId, quantity);

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

// ADMIN approves request and reduces available units
exports.approveRequest = asyncHandler(async (req, res) => {
  try {
    const request = await requestService.approveRequest(req.params.id);

    res.json({
      success: true,
      message: "Request approved successfully and stock updated",
      request,
    });
  } catch (error) {
    throw new AppError(error.message, 400);
  }
});

// ADMIN rejects request
exports.rejectRequest = asyncHandler(async (req, res) => {
  try {
    const request = await requestService.rejectRequest(req.params.id);

    res.json({
      success: true,
      message: "Request rejected successfully",
      request,
    });
  } catch (error) {
    throw new AppError(error.message, 400);
  }
});