const express = require("express")
const router = express.Router()
const UpiSetting = require("../models/UpiSetting")

// Get all UPI settings
router.get("/", async (req, res) => {
  try {
    const upiSettings = await UpiSetting.find().sort({ createdAt: -1 })
    res.json(upiSettings)
  } catch (error) {
    console.error("Error fetching UPI settings:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get active UPI setting (public)
router.get("/active", async (req, res) => {
  try {
    const activeSetting = await UpiSetting.findOne({ isActive: true })
    if (!activeSetting) {
      return res.status(404).json({ message: "No active UPI setting found" })
    }
    res.json(activeSetting)
  } catch (error) {
    console.error("Error fetching active UPI setting:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add new UPI setting
router.post("/", async (req, res) => {
  try {
    const { upiId, name, isActive } = req.body

    if (!upiId || !name) {
      return res.status(400).json({ message: "UPI ID and name are required" })
    }

    // Check if UPI ID already exists
    const existingUpi = await UpiSetting.findOne({ upiId })
    if (existingUpi) {
      return res.status(400).json({ message: "UPI ID already exists" })
    }

    const newUpiSetting = new UpiSetting({
      upiId,
      name,
      isActive: isActive || false,
    })

    await newUpiSetting.save()
    res.status(201).json(newUpiSetting)
  } catch (error) {
    console.error("Error adding UPI setting:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update UPI setting
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { upiId, name, isActive } = req.body

    const upiSetting = await UpiSetting.findById(id)
    if (!upiSetting) {
      return res.status(404).json({ message: "UPI setting not found" })
    }

    // Update fields if provided
    if (upiId) upiSetting.upiId = upiId
    if (name) upiSetting.name = name
    if (isActive !== undefined) upiSetting.isActive = isActive

    await upiSetting.save()
    res.json(upiSetting)
  } catch (error) {
    console.error("Error updating UPI setting:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete UPI setting
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const upiSetting = await UpiSetting.findById(id)
    if (!upiSetting) {
      return res.status(404).json({ message: "UPI setting not found" })
    }

    // Don't allow deletion of the active UPI setting
    if (upiSetting.isActive) {
      return res.status(400).json({ message: "Cannot delete active UPI setting. Please activate another UPI first." })
    }

    await UpiSetting.findByIdAndDelete(id)
    res.json({ message: "UPI setting deleted successfully" })
  } catch (error) {
    console.error("Error deleting UPI setting:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router

