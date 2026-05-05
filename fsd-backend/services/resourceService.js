const Resource = require('../models/Resource');

class ResourceService {
  // Get all resources with pagination
  async getAllResources(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const resources = await Resource.find()
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
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      throw new Error('Resource not found');
    }
    return resource;
  }

  // Create resource
  async createResource(name, description, totalUnits = 1) {
    const resource = await Resource.create({
      name,
      description,
      totalUnits,
      availableUnits: totalUnits,
    });
    return resource;
  }

  // Update resource
  async updateResource(resourceId, updates) {
    // Prevent direct modification of availableUnits (should be managed by request approval/rejection)
    const { availableUnits, ...allowedUpdates } = updates;
    
    const resource = await Resource.findByIdAndUpdate(
      resourceId,
      allowedUpdates,
      { new: true }
    );

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

  // Check if enough units available
  async checkAvailability(resourceId, quantity) {
    const resource = await this.getResourceById(resourceId);
    if (resource.availableUnits < quantity) {
      throw new Error(`Not enough units available. Available: ${resource.availableUnits}, Requested: ${quantity}`);
    }
    return resource;
  }

  // Reduce available units (called on approval)
  async reduceAvailableUnits(resourceId, quantity) {
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      throw new Error('Resource not found');
    }

    if (resource.availableUnits < quantity) {
      throw new Error(`Cannot allocate ${quantity} units. Only ${resource.availableUnits} available.`);
    }

    resource.availableUnits -= quantity;
    await resource.save();
    return resource;
  }

  // Increase available units (called on rejection)
  async increaseAvailableUnits(resourceId, quantity) {
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      throw new Error('Resource not found');
    }

    // Ensure we don't exceed total units
    resource.availableUnits = Math.min(resource.availableUnits + quantity, resource.totalUnits);
    await resource.save();
    return resource;
  }

  // Get available resources (with availableUnits > 0)
  async getAvailableResources() {
    const resources = await Resource.find({ availableUnits: { $gt: 0 } }).sort({ createdAt: -1 });
    return resources;
  }

  // Get low stock resources (for admin alerts)
  async getLowStockResources(threshold = 5) {
    const resources = await Resource.find({ 
      availableUnits: { $lte: threshold, $gt: 0 } 
    }).sort({ availableUnits: 1 });
    return resources;
  }
}

module.exports = new ResourceService();
