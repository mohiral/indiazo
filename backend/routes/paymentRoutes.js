const express = require("express")
const router = express.Router()
const Payment = require("../models/Payment")

router.post("/submit-payment", async (req, res) => {
  try {
    const { userId, userName, userEmail, className, amount, utr, upiId } = req.body

    // Create new payment
    const newPayment = new Payment({
      userId,
      userName,
      userEmail,
      className,
      amount,
      utr,
      upiId,
    })

    // Save the payment
    await newPayment.save()

    res.status(201).json({ message: "Payment submitted successfully", payment: newPayment })
  } catch (error) {
    console.error("Error submitting payment:", error)
    res.status(500).json({ message: "Error submitting payment", error: error.message })
  }
})

// New route to get user's transaction history
router.get("/user-transactions/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const transactions = await Payment.find({ userId }).sort({ createdAt: -1 })
    res.status(200).json(transactions)
  } catch (error) {
    console.error("Error fetching user transactions:", error)
    res.status(500).json({ message: "Error fetching user transactions", error: error.message })
  }
})

// New route for admin to get all pending payments
router.get("/admin/pending-payments", async (req, res) => {
  try {
    const pendingPayments = await Payment.find({ status: "pending" }).sort({ createdAt: -1 })
    res.status(200).json(pendingPayments)
  } catch (error) {
    console.error("Error fetching pending payments:", error)
    res.status(500).json({ message: "Error fetching pending payments", error: error.message })
  }
})

// Updated route for admin to get all payments
router.get("/admin/all-payments", async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 })
    res.status(200).json(payments)
  } catch (error) {
    console.error("Error fetching payments:", error)
    res.status(500).json({ message: "Error fetching payments", error: error.message })
  }
})

// Updated route for admin to update payment status
// New route for admin to update all payment fields
router.put("/admin/update-payment/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params
    const { 
      userId,
      userName, 
      userEmail, 
      className, 
      amount, 
      utr, 
      upiId, 
      status,
      transactionType
    } = req.body

    // Validate status if provided
    if (status && !["pending", "confirmed", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    // Create update object with all provided fields
    const updateData = {}
    if (userId !== undefined) updateData.userId = userId
    if (userName !== undefined) updateData.userName = userName
    if (userEmail !== undefined) updateData.userEmail = userEmail
    if (className !== undefined) updateData.className = className
    if (amount !== undefined) updateData.amount = amount
    if (utr !== undefined) updateData.utr = utr
    if (upiId !== undefined) updateData.upiId = upiId
    if (status !== undefined) updateData.status = status
    if (transactionType !== undefined) updateData.transactionType = transactionType

    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId, 
      updateData, 
      { new: true }
    )

    if (!updatedPayment) {
      return res.status(404).json({ message: "Payment not found" })
    }

    res.status(200).json({
      message: "Payment updated successfully",
      payment: updatedPayment,
    })
  } catch (error) {
    console.error("Error updating payment:", error)
    res.status(500).json({ message: "Error updating payment", error: error.message })
  }
})

// New route for admin to delete a payment
router.delete("/admin/delete-payment/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params
    
    const deletedPayment = await Payment.findByIdAndDelete(paymentId)
    
    if (!deletedPayment) {
      return res.status(404).json({ message: "Payment not found" })
    }
    
    res.status(200).json({
      message: "Payment deleted successfully",
      payment: deletedPayment,
    })
  } catch (error) {
    console.error("Error deleting payment:", error)
    res.status(500).json({ message: "Error deleting payment", error: error.message })
  }
})

// Route to get wallet balance for a user (including pending amounts)
router.get("/wallet-balance/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const payments = await Payment.find({ userId })

    res.status(200).json({ payments })
  } catch (error) {
    console.error("Error fetching wallet balances:", error)
    res.status(500).json({ message: "Error fetching wallet balances" })
  }
})

// New route to update user balance after game win/loss
router.post("/update-balance", async (req, res) => {
  try {
    const { userId, newBalance, gameResult, betAmount, winAmount, gameId } = req.body

    // Log the received data
    console.log("Received update-balance request:", {
      userId,
      newBalance,
      gameResult,
      betAmount,
      winAmount,
      gameId,
    })

    // Create a new payment record to track the game transaction
    const gameTransaction = new Payment({
      userId,
      amount: gameResult === "win" ? winAmount : -betAmount, // Positive for win, negative for loss
      status: "confirmed", // Auto-confirm game transactions
      transactionType: gameResult === "win" ? "game_win" : "game_loss",
      gameDetails: {
        betAmount,
        multiplier: gameResult === "win" ? winAmount / betAmount : 0,
        result: gameResult,
        gameId: gameId || "unknown", // Provide a default if gameId is undefined
      },
    })

    // Log the transaction object before saving
    console.log("Game transaction to save:", gameTransaction)

    // Save the game transaction
    await gameTransaction.save()

    // Log the saved transaction
    console.log("Game transaction saved successfully")

    res.status(200).json({
      message: `Balance updated successfully after game ${gameResult}`,
      newBalance,
      transaction: gameTransaction,
    })
  } catch (error) {
    console.error("Error updating balance after game:", error)
    res.status(500).json({ message: "Error updating balance", error: error.message })
  }
})

module.exports = router

