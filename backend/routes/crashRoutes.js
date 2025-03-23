const express = require("express")
const router = express.Router()
const CrashHistory = require("../models/crash-history")
const Bet = require("../models/bet")
const auth = require("../middleware/auth")

// Get last 50 crash points
router.get("/crash/history", async (req, res) => {
  try {
    const crashes = await CrashHistory.find().sort({ timestamp: -1 }).limit(50).select("crashPoint timestamp -_id")

    res.json(crashes)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Get user's bet history (requires authentication)
router.get("/crash/bets", auth, async (req, res) => {
  try {
    const bets = await Bet.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50)

    res.json(bets)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Get statistics
router.get("/crash/stats", async (req, res) => {
  try {
    // Get highest crash point in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const highestCrash = await CrashHistory.findOne({
      timestamp: { $gte: oneDayAgo },
    })
      .sort({ crashPoint: -1 })
      .select("crashPoint -_id")

    // Get average crash point in last 100 games
    const recentCrashes = await CrashHistory.find().sort({ timestamp: -1 }).limit(100).select("crashPoint -_id")

    const averageCrash =
      recentCrashes.length > 0
        ? recentCrashes.reduce((sum, crash) => sum + crash.crashPoint, 0) / recentCrashes.length
        : 0

    // Count crashes below 2x in last 100 games
    const lowCrashesCount = recentCrashes.filter((crash) => crash.crashPoint < 2).length

    res.json({
      highestCrash: highestCrash ? highestCrash.crashPoint : 0,
      averageCrash: Number.parseFloat(averageCrash.toFixed(2)),
      lowCrashesPercentage:
        recentCrashes.length > 0 ? Number.parseFloat(((lowCrashesCount / recentCrashes.length) * 100).toFixed(2)) : 0,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router

