const express = require("express")
const router = express.Router()
const Withdrawal = require("../models/Withdrawal")
const Payment = require("../models/Payment")

// Submit withdrawal request
router.post("/submit-withdrawal", async (req, res) => {
  try {
    const { userId, userName, userEmail, amount, upiId, accountHolderName } = req.body

    // Validate amount
    if (amount < 500) {
      return res.status(400).json({ message: "Minimum withdrawal amount is ₹500" })
    }

    // Check if user has sufficient balance
    const payments = await Payment.find({ userId })

    let balance = 0
    payments.forEach((payment) => {
      if (payment.status === "confirmed") {
        if (payment.transactionType === "deposit" || payment.transactionType === "game_win") {
          balance += payment.amount
        } else if (payment.transactionType === "withdrawal" || payment.transactionType === "game_loss") {
          balance -= payment.amount
        }
      }
    })

    if (balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" })
    }

    // Create withdrawal request
    const newWithdrawal = new Withdrawal({
      userId,
      userName,
      userEmail,
      amount,
      upiId,
      accountHolderName,
    })

    // Save the withdrawal request
    await newWithdrawal.save()

    // Create a pending payment record to deduct the amount from user's balance
    const withdrawalPayment = new Payment({
      userId,
      userName,
      userEmail,
      amount: -amount, // Make the amount negative to deduct from balance
      status: "confirmed", // Immediately deduct from available balance
      transactionType: "withdrawal",
      upiId,
    })

    await withdrawalPayment.save()

    res.status(201).json({
      message: "Withdrawal request submitted successfully",
      withdrawal: newWithdrawal,
    })
  } catch (error) {
    console.error("Error submitting withdrawal request:", error)
    res.status(500).json({ message: "Error submitting withdrawal request", error: error.message })
  }
})

// Get user's withdrawal history
router.get("/user-withdrawals/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const withdrawals = await Withdrawal.find({ userId }).sort({ createdAt: -1 })
    res.status(200).json(withdrawals)
  } catch (error) {
    console.error("Error fetching user withdrawals:", error)
    res.status(500).json({ message: "Error fetching user withdrawals", error: error.message })
  }
})

// Admin routes for withdrawal management
router.get("/admin/pending-withdrawals", async (req, res) => {
  try {
    const pendingWithdrawals = await Withdrawal.find({ status: "pending" }).sort({ createdAt: -1 })
    res.status(200).json(pendingWithdrawals)
  } catch (error) {
    console.error("Error fetching pending withdrawals:", error)
    res.status(500).json({ message: "Error fetching pending withdrawals", error: error.message })
  }
})

router.get("/admin/all-withdrawals", async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().sort({ createdAt: -1 })
    res.status(200).json(withdrawals)
  } catch (error) {
    console.error("Error fetching withdrawals:", error)
    res.status(500).json({ message: "Error fetching withdrawals", error: error.message })
  }
})

// New route for admin to update all withdrawal fields
router.put("/admin/update-withdrawal/:withdrawalId", async (req, res) => {
    try {
      const { withdrawalId } = req.params
      const { 
        userName, 
        userEmail, 
        amount, 
        upiId, 
        accountHolderName, 
        status, 
        rejectionReason, 
        transactionId 
      } = req.body
  
      // Validate status if provided
      if (status && !["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" })
      }
  
      // Create update object with all provided fields
      const updateData = {}
      if (userName !== undefined) updateData.userName = userName
      if (userEmail !== undefined) updateData.userEmail = userEmail
      if (amount !== undefined) updateData.amount = amount
      if (upiId !== undefined) updateData.upiId = upiId
      if (accountHolderName !== undefined) updateData.accountHolderName = accountHolderName
      if (status !== undefined) updateData.status = status
      if (rejectionReason !== undefined) updateData.rejectionReason = rejectionReason
      if (transactionId !== undefined) updateData.transactionId = transactionId
  
      const updatedWithdrawal = await Withdrawal.findByIdAndUpdate(
        withdrawalId, 
        updateData, 
        { new: true }
      )
  
      if (!updatedWithdrawal) {
        return res.status(404).json({ message: "Withdrawal request not found" })
      }
  
      res.status(200).json({
        message: "Withdrawal updated successfully",
        withdrawal: updatedWithdrawal,
      })
    } catch (error) {
      console.error("Error updating withdrawal:", error)
      res.status(500).json({ message: "Error updating withdrawal", error: error.message })
    }
  })
  
  // New route for admin to delete a withdrawal
  router.delete("/admin/delete-withdrawal/:withdrawalId", async (req, res) => {
    try {
      const { withdrawalId } = req.params
      
      const deletedWithdrawal = await Withdrawal.findByIdAndDelete(withdrawalId)
      
      if (!deletedWithdrawal) {
        return res.status(404).json({ message: "Withdrawal request not found" })
      }
      
      res.status(200).json({
        message: "Withdrawal deleted successfully",
        withdrawal: deletedWithdrawal,
      })
    } catch (error) {
      console.error("Error deleting withdrawal:", error)
      res.status(500).json({ message: "Error deleting withdrawal", error: error.message })
    }
  })

module.exports = router

