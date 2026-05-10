const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resource",
    required: true
  },

  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
  },

  approvedQuantity: {
    type: Number,
    default: 0,
    min: 0,
  },

  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING"
  }

}, { timestamps: true });

// Indexes for better query performance
RequestSchema.index({ user: 1 });
RequestSchema.index({ status: 1 });
RequestSchema.index({ createdAt: -1 });
RequestSchema.index({ user: 1, status: 1 });
RequestSchema.index({ resource: 1 });

module.exports = mongoose.model("Request", RequestSchema);
