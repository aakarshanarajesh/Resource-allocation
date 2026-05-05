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
    totalUnits: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    availableUnits: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Set availableUnits to totalUnits when creating a new resource
resourceSchema.pre('save', function() {
  if (this.isNew && !this.availableUnits) {
    this.availableUnits = this.totalUnits;
  }
});

// Indexes for better query performance
resourceSchema.index({ availableUnits: 1 });
resourceSchema.index({ createdAt: -1 });
resourceSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model("Resource", resourceSchema);
