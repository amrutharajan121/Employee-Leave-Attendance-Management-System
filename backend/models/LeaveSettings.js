const mongoose = require("mongoose");

const leaveSettingsSchema = new mongoose.Schema(
  {
    casual: {
      type: Number,
      default: 12,
      min: 0,
    },

    sick: {
      type: Number,
      default: 10,
      min: 0,
    },

    annual: {
      type: Number,
      default: 15,
      min: 0,
    },

    other: {
      type: Number,
      default: 5,
      min: 0,
    },

    year: {
      type: Number,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "LeaveSettings",
  leaveSettingsSchema
);