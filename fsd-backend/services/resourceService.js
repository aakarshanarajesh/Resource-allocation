const Resource = require('../models/Resource');

class ResourceService {
  // Get all resources with pagination
  async getAllResources(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const resources = await Resource.find()
      .populate('allocatedTo', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Resource.countDocuments();
    return {
      resources,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get single resource
  async getResourceById(resourceId) {
    const resource = await Resource.findById(resourceId).populate('allocatedTo', 'name email');
    if (!resource) {
      throw new Error('Resource not found');
    }
    return resource;
  }

  // Create resource
  async createResource(name, description) {
    const resource = await Resource.create({
      name,
      description,
      isAllocated: false,
    });
    return resource;
  }

  // Update resource
  async updateResource(resourceId, updates) {
    const resource = await Resource.findByIdAndUpdate(
      resourceId,
      updates,
      { new: true }
    ).populate('allocatedTo', 'name email');

    if (!resource) {
      throw new Error('Resource not found');
    }
    return resource;
  }

  // Delete resource
  async deleteResource(resourceId) {
    const resource = await Resource.findByIdAndDelete(resourceId);
    if (!resource) {
      throw new Error('Resource not found');
    }
    return resource;
  }

  // Allocate resource to user
  async allocateResource(resourceId, userId) {
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      throw new Error('Resource not found');
    }

    if (resource.isAllocated) {
      throw new Error('Resource already allocated');
    }

    resource.isAllocated = true;
    resource.allocatedTo = userId;
    await resource.save();

    return resource.populate('allocatedTo', 'name email');
  }

  // Deallocate resource
  async deallocateResource(resourceId) {
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      throw new Error('Resource not found');
    }

    resource.isAllocated = false;
    resource.allocatedTo = null;
    await resource.save();

    return resource;
  }

  // Get available resources
  async getAvailableResources() {
    const resources = await Resource.find({ isAllocated: false }).sort({ createdAt: -1 });
    return resources;
  }
}

module.exports = new ResourceService();
