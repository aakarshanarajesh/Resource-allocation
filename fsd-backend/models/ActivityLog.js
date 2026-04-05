const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'LOGIN',
        'LOGOUT',
        'REGISTER',
        'REQUEST_CREATED',
        'REQUEST_APPROVED',
        'REQUEST_REJECTED',
        'RESOURCE_CREATED',
        'RESOURCE_UPDATED',
        'RESOURCE_DELETED',
        'RESOURCE_ALLOCATED',
      ],
    },
    description: {
      type: String,
    },
    entityType: {
      type: String,
      enum: ['User', 'Request', 'Resource'],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  { timestamps: true }
);

// Index for faster queries
ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ action: 1 });
ActivityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
