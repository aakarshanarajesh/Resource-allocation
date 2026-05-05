const mongoose = require("mongoose");

const allocationRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

// Index for querying requests by user and resource
allocationRequestSchema.index({ userId: 1, resourceId: 1 });
allocationRequestSchema.index({ status: 1 });
allocationRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AllocationRequest", allocationRequestSchema);