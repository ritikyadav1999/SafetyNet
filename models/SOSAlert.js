const mongoose = require("mongoose");

const SOSAlertSchema = new mongoose.Schema(
  {
    victim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere",
      },
    },

    message: {
      type: String,
      default: "Emergency! Please help!", // Optional user message
    },

    status: {
      type: String,
      enum: ["active", "resolved", "cancelled"],
      default: "active",
    },

    responders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SOSAlert", SOSAlertSchema);
