const express = require("express")
const User = require("../models/User.js")

const router = express.Router()

// Create or Update User
router.post("/users", async (req, res) => {
  try {
    const { userId, name, email, password, clientId = "" } = req.body
    if (!userId || !name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    let user = await User.findOne({ userId })

    if (user) {
      user.name = name
      user.email = email
      user.password = password // Update password
      user.clientId = clientId
      user.isLoggedIn = true // Mark user as logged in
    } else {
      user = new User({
        userId,
        name,
        email,
        password,
        clientId,
        isLoggedIn: true,
      })
    }

    await user.save()
    res.status(200).json({ message: "User logged in", user })
  } catch (error) {
    console.error("Error saving user:", error)
    res.status(500).json({ message: "Error saving user", error: error.message })
  }
})

// Make sure this route is exactly as shown here
router.post("/users/logout", async (req, res) => {
  try {
    const { userId } = req.body
    if (!userId) return res.status(400).json({ message: "User ID is required" })

    const user = await User.findOne({ userId })
    if (!user) return res.status(404).json({ message: "User not found" })

    user.isLoggedIn = false // Mark user as logged out
    await user.save()

    res.status(200).json({ message: "User logged out successfully" })
  } catch (error) {
    res.status(500).json({ message: "Error logging out user", error: error.message })
  }
})

// Get all users
router.get("/users", async (req, res) => {
  try {
    const mobile = req.query.mobile
    const query = {}

    if (mobile) {
      query.userId = mobile
    }

    const users = await User.find(query)
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message })
  }
})

module.exports = router

