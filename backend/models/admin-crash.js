const mongoose = require("mongoose")

const adminCrashSchema = new mongoose.Schema({
  crashValue: {
    type: Number,
    required: true,
    min: 1.01,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  isEnabled: {
    type: Boolean,
    default: true,
  },
  sequence: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  usedAt: {
    type: Date,
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
})

const AdminCrash = mongoose.model("AdminCrash", adminCrashSchema)

module.exports = AdminCrash

