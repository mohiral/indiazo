const mongoose = require("mongoose")

const crashHistorySchema = new mongoose.Schema({
  crashPoint: {
    type: Number,
    required: true,
  },
  gameId: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isAdminSet: {
    type: Boolean,
    default: false,
  },
})

const CrashHistory = mongoose.model("CrashHistory", crashHistorySchema)

module.exports = CrashHistory

