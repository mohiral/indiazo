const mongoose = require("mongoose")

const betSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: {
    type: String,
    default: "Anonymous",
  },
  gameId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  cashoutMultiplier: {
    type: Number,
    default: null,
  },
  profit: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["active", "won", "lost"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Bet = mongoose.model("Bet", betSchema)

module.exports = Bet

