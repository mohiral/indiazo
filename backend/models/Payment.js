const mongoose = require("mongoose")

const PaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
    },
    userEmail: {
      type: String,
    },
    className: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    utr: {
      type: String,
    },
    upiId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected"],
      default: "pending",
    },
    transactionType: {
      type: String,
      enum: ["deposit", "withdrawal", "game_win", "game_loss"],
      default: "deposit",
    },
    gameDetails: {
      betAmount: Number,
      multiplier: Number,
      result: String,
      gameId: String, // Add gameId field
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Payment", PaymentSchema)

