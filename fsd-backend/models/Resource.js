const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    isAllocated: {
      type: Boolean,
      default: false,
    },
    allocatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
resourceSchema.index({ isAllocated: 1 });
resourceSchema.index({ allocatedTo: 1 });
resourceSchema.index({ createdAt: -1 });
resourceSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model("Resource", resourceSchema);