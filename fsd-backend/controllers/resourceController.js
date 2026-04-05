const resourceService = require("../services/resourceService");
const { asyncHandler, AppError } = require("../utils/errorHandler");

// CREATE RESOURCE
exports.createResource = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const resource = await resourceService.createResource(name, description);

  res.status(201).json({
    success: true,
    message: "Resource created successfully",
    resource,
  });
});

// GET ALL RESOURCES
exports.getResources = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await resourceService.getAllResources(page, limit);

  res.json({
    success: true,
    ...result,
  });
});

// GET AVAILABLE RESOURCES
exports.getAvailableResources = asyncHandler(async (req, res) => {
  const resources = await resourceService.getAvailableResources();

  res.json({
    success: true,
    resources,
  });
});

// GET SINGLE RESOURCE
exports.getResource = asyncHandler(async (req, res) => {
  const resource = await resourceService.getResourceById(req.params.id);

  res.json({
    success: true,
    resource,
  });
});

// UPDATE RESOURCE
exports.updateResource = asyncHandler(async (req, res) => {
  const resource = await resourceService.updateResource(req.params.id, req.body);

  res.json({
    success: true,
    message: "Resource updated successfully",
    resource,
  });
});

// DELETE RESOURCE
exports.deleteResource = asyncHandler(async (req, res) => {
  const resource = await resourceService.deleteResource(req.params.id);

  res.json({
    success: true,
    message: "Resource deleted successfully",
    resource,
  });
});