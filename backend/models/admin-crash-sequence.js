const mongoose = require("mongoose")

const adminCrashSequenceSchema = new mongoose.Schema({
  crashValues: {
    type: [Number],
    required: true,
    validate: {
      validator: (values) => values.length > 0 && values.every((val) => val >= 1.01),
      message: "All crash values must be at least 1.01",
    },
  },
  currentIndex: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
})

const AdminCrashSequence = mongoose.model("AdminCrashSequence", adminCrashSequenceSchema)

module.exports = AdminCrashSequence

