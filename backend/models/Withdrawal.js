const mongoose = require("mongoose")

const WithdrawalSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: true,
    },
    upiId: {
      type: String,
      required: true,
    },
    accountHolderName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
    },
    transactionId: {
      type: String,
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model("Withdrawal", WithdrawalSchema)
