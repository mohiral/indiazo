const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const http = require("http")
const { Server } = require("socket.io")
const { v4: uuidv4 } = require("uuid")
const path = require("path")
const fs = require("fs")
const bcrypt = require("bcrypt")

// Debug mode
const DEBUG = true

function debugLog(...args) {
  if (DEBUG) {
    console.log("[DEBUG]", ...args)
  }
}

// Import models
const CrashHistory = require("./models/crash-history")
const Bet = require("./models/bet")
const AdminCrash = require("./models/admin-crash")
const Admin = require("./models/admin")
const AdminCrashSequence = require("./models/admin-crash-sequence")
const upiSettingsRoutes = require("./routes/upiSettingsRoutes") // Add this line

// Import routes
const paymentRoutes = require("./routes/paymentRoutes")
const userRoutes = require("./routes/userRoutes")
const withdrawalRoutes = require("./routes/withdrawalRoutes")
const crashRoutes = require("./routes/crashRoutes")
const adminRoutes = require("./routes/adminRoutes")

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

// Make io instance available to routes
app.set("io", io)

app.use(cors())
app.use(express.json())

// Create 'uploads' directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// MongoDB connection
mongoose
  .connect("mongodb+srv://harishkumawatkumawat669:7FiBpE7v7lNyDp6G@cluster0.ogeix.mongodb.net/Avitor", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err))

// Game state
const gameState = {
  status: "waiting", // waiting, active, crashed
  countdown: 5,
  multiplier: 1.0,
  activeBets: [],
  cashedOut: [],
  lastCrashes: [],
  currentGameId: null,
}

let gameInterval = null
let countdownInterval = null

// Load last 10 crashes from database on startup
async function loadLastCrashes() {
  try {
    const crashes = await CrashHistory.find().sort({ timestamp: -1 }).limit(10).select("crashPoint -_id")

    gameState.lastCrashes = crashes.map((crash) => crash.crashPoint)
    console.log("Loaded last crashes:", gameState.lastCrashes)
  } catch (err) {
    console.error("Error loading crash history:", err)
    gameState.lastCrashes = []
  }
}

// Start game countdown
function startCountdown() {
  gameState.status = "waiting"
  gameState.countdown = 5
  gameState.multiplier = 1.0
  gameState.activeBets = []
  gameState.cashedOut = []
  gameState.currentGameId = uuidv4()

  io.emit("game_state", gameState)

  countdownInterval = setInterval(() => {
    gameState.countdown -= 1
    io.emit("countdown", gameState.countdown)

    if (gameState.countdown <= 0) {
      clearInterval(countdownInterval)
      startGame()
    }
  }, 1000)
}

// Start the game - UPDATED with async/await
async function startGame() {
  gameState.status = "active"
  gameState.multiplier = 1.0
  io.emit("game_started")
  io.emit("game_state", gameState)

  debugLog("Getting crash point...")
  // IMPORTANT: Use await here to get the crash point
  const crashPoint = await generateCrashPoint()
  debugLog(`Game started. Will crash at ${crashPoint}x`)

  let lastUpdate = Date.now()

  gameInterval = setInterval(() => {
    const now = Date.now()
    const elapsed = now - lastUpdate
    lastUpdate = now

    // Update multiplier (similar to client-side logic)
    const growthRate = 0.00993
    gameState.multiplier *= 1 + growthRate
    gameState.multiplier = Number.parseFloat(gameState.multiplier.toFixed(2))

    io.emit("multiplier_update", gameState.multiplier)

    // IMPORTANT: Make sure to compare with the exact crash point
    if (gameState.multiplier >= crashPoint) {
      debugLog(`Current multiplier ${gameState.multiplier}x reached or exceeded crash point ${crashPoint}x`)
      endGame(crashPoint)
    }
  }, 100)
}

// End the game (crash) - UPDATED with debug logs
async function endGame(crashPoint) {
  debugLog(`Game ending with crash at ${crashPoint}x`)
  clearInterval(gameInterval)

  gameState.status = "crashed"
  gameState.lastCrashes.unshift(crashPoint)
  gameState.lastCrashes = gameState.lastCrashes.slice(0, 10)

  io.emit("game_crashed", crashPoint)
  io.emit("game_state", gameState)

  // Save crash to database
  try {
    // Check if this was an admin-set crash
    const adminCrash = await AdminCrash.findOne({
      isUsed: true,
      usedAt: { $gte: new Date(Date.now() - 10000) }, // Used in the last 10 seconds
    })

    const isAdminSet = !!adminCrash

    const crashHistory = new CrashHistory({
      crashPoint: crashPoint,
      gameId: gameState.currentGameId,
      isAdminSet: isAdminSet,
    })
    await crashHistory.save()

    // Update all active bets as lost
    await Bet.updateMany({ gameId: gameState.currentGameId, status: "active" }, { status: "lost" })

    console.log(`Crash at ${crashPoint}x saved to database${isAdminSet ? " (admin-set)" : ""}`)
  } catch (err) {
    console.error("Error saving crash history:", err)
  }

  // Schedule next game
  setTimeout(startCountdown, 3000)
}

// Generate a random crash point - UPDATED with sequence support
async function generateCrashPoint() {
  try {
    debugLog("Checking for admin-set crash sequence...")
    // Check if there's an active admin-set crash sequence
    const crashSequence = await AdminCrashSequence.findOne({ isActive: true })

    if (crashSequence && crashSequence.crashValues.length > 0) {
      // Get the current crash value from the sequence
      const currentIndex = crashSequence.currentIndex
      const crashValue = crashSequence.crashValues[currentIndex]

      debugLog(
        `Using admin-set crash point from sequence: ${crashValue}x (index ${currentIndex + 1}/${crashSequence.crashValues.length})`,
      )

      // Update the index to the next value in the sequence
      const nextIndex = (currentIndex + 1) % crashSequence.crashValues.length
      crashSequence.currentIndex = nextIndex
      await crashSequence.save()

      // Create a crash history entry that indicates this was admin-set
      const crashHistory = new CrashHistory({
        crashPoint: crashValue,
        gameId: gameState.currentGameId,
        isAdminSet: true,
      })
      await crashHistory.save()

      return crashValue
    }

    // Check for legacy single crash value (for backward compatibility)
    const adminCrash = await AdminCrash.findOne({ isUsed: false })

    if (adminCrash) {
      debugLog(`Found legacy admin-set crash point: ${adminCrash.crashValue}x`)
      // Mark as used
      adminCrash.isUsed = true
      adminCrash.usedAt = Date.now()
      await adminCrash.save()

      // Create a crash history entry that indicates this was admin-set
      const crashHistory = new CrashHistory({
        crashPoint: adminCrash.crashValue,
        gameId: gameState.currentGameId,
        isAdminSet: true,
      })
      await crashHistory.save()

      return adminCrash.crashValue
    }

    debugLog("No admin-set crash value found, using random algorithm")
    // If no admin crash value, use the original algorithm
    const house_edge = 0.05
    const r = Math.random()

    if (r < house_edge) {
      debugLog("Random crash at 1.0x (house edge)")
      return 1.0 // Instant crash (house edge)
    }

    // Otherwise, follow a distribution that makes higher values less likely
    const crashPoint = Math.max(1.0, Number.parseFloat((0.9 / (1.0 - r - house_edge)).toFixed(2)))
    debugLog(`Random crash point generated: ${crashPoint}x`)
    return crashPoint
  } catch (error) {
    console.error("Error generating crash point:", error)
    debugLog("Error in generateCrashPoint, using fallback algorithm")
    // Fallback to original algorithm if there's an error
    const house_edge = 0.05
    const r = Math.random()

    if (r < house_edge) {
      return 1.0
    }

    return Math.max(1.0, Number.parseFloat((0.9 / (1.0 - r - house_edge)).toFixed(2)))
  }
}

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id)

  // Send current game state to the new user
  socket.emit("game_state", gameState)

  // Handle user authentication
  socket.on("authenticate", async (data) => {
    const { userId, username } = data

    if (!userId) {
      socket.emit("auth_error", { message: "User ID is required" })
      return
    }

    // Store user info in socket
    socket.userId = userId
    socket.username = username || "Anonymous"

    console.log(`User authenticated: ${socket.username} (${socket.userId})`)

    // Send last crashes to the user
    socket.emit("last_crashes", gameState.lastCrashes)
  })

  // Handle bet placement
  socket.on("place_bet", async (data) => {
    if (gameState.status !== "waiting" || !socket.userId) return

    const { amount } = data

    if (!amount || amount <= 0) {
      socket.emit("bet_error", { message: "Invalid bet amount" })
      return
    }

    try {
      // Create bet in database
      const bet = new Bet({
        userId: socket.userId,
        gameId: gameState.currentGameId,
        amount: amount,
        status: "active",
      })

      await bet.save()

      // Add to active bets
      const betInfo = {
        userId: socket.userId,
        username: socket.username,
        amount: amount,
        timestamp: Date.now(),
      }

      gameState.activeBets.push(betInfo)

      // Broadcast new bet to all users
      io.emit("new_bet", betInfo)

      // Confirm bet to the user
      socket.emit("bet_confirmed", { betId: bet._id })

      console.log(`Bet placed: ${socket.username} bet ${amount} on game ${gameState.currentGameId}`)
    } catch (err) {
      console.error("Error saving bet:", err)
      socket.emit("bet_error", { message: "Failed to place bet" })
    }
  })

  // Handle cash out
  socket.on("cash_out", async () => {
    if (gameState.status !== "active" || !socket.userId) return

    // Find user's active bet
    const betIndex = gameState.activeBets.findIndex((bet) => bet.userId === socket.userId)

    if (betIndex === -1) {
      socket.emit("cashout_error", { message: "No active bet found" })
      return
    }

    const bet = gameState.activeBets[betIndex]
    gameState.activeBets.splice(betIndex, 1)

    const cashoutMultiplier = gameState.multiplier
    const profit = bet.amount * cashoutMultiplier - bet.amount

    const cashout = {
      userId: socket.userId,
      username: socket.username,
      amount: bet.amount,
      multiplier: cashoutMultiplier,
      profit: profit,
      timestamp: Date.now(),
    }

    gameState.cashedOut.push(cashout)

    try {
      // Update bet in database
      await Bet.findOneAndUpdate(
        { userId: socket.userId, gameId: gameState.currentGameId, status: "active" },
        {
          cashoutMultiplier: cashoutMultiplier,
          profit: profit,
          status: "won",
        },
      )

      // Broadcast cashout to all users
      io.emit("player_cashed_out", cashout)

      // Confirm cashout to the user
      socket.emit("cashout_confirmed", cashout)

      console.log(`Cashout: ${socket.username} cashed out at ${cashoutMultiplier}x with profit ${profit}`)
    } catch (err) {
      console.error("Error updating bet:", err)
      socket.emit("cashout_error", { message: "Failed to cash out" })
    }
  })

  // NEW: Handle setting crash point from the game UI
  socket.on("set_crash_point", async (data) => {
    if (!socket.userId) {
      socket.emit("error", { message: "You must be logged in to set crash points" })
      return
    }

    try {
      // Check if user is admin (optional, remove if you want any user to set crash points)
      const isAdmin = await Admin.findOne({ userId: socket.userId })

      if (!isAdmin) {
        // For testing, allow any user to set crash points
        // In production, you might want to uncomment this check
        // socket.emit("error", { message: "Only admins can set crash points" })
        // return
      }

      const { value } = data
      if (!value || value < 1.01) {
        socket.emit("error", { message: "Invalid crash value" })
        return
      }

      // Check if there's already an unused admin crash value
      const existingCrash = await AdminCrash.findOne({ isUsed: false })

      if (existingCrash) {
        // Update existing unused crash value
        existingCrash.crashValue = value
        existingCrash.createdAt = Date.now()
        await existingCrash.save()

        socket.emit("message", { message: `Crash value updated to ${value}x for the next game` })
        return
      }

      // Create new admin crash value
      const adminCrash = new AdminCrash({
        crashValue: value,
        isUsed: false,
      })

      await adminCrash.save()
      socket.emit("message", { message: `Crash value set to ${value}x for the next game` })

      console.log(`User ${socket.username} set crash point to ${value}x`)
    } catch (error) {
      console.error("Error setting crash point:", error)
      socket.emit("error", { message: "Failed to set crash point" })
    }
  })

  // NEW: Handle setting crash sequence from the game UI
  socket.on("set_crash_sequence", async (data) => {
    if (!socket.userId) {
      socket.emit("error", { message: "You must be logged in to set crash sequences" })
      return
    }

    try {
      // Check if user is admin (optional, remove if you want any user to set crash points)
      const isAdmin = await Admin.findOne({ userId: socket.userId })

      if (!isAdmin) {
        // For testing, allow any user to set crash points
        // In production, you might want to uncomment this check
        // socket.emit("error", { message: "Only admins can set crash sequences" })
        // return
      }

      const { values } = data
      if (!values || !Array.isArray(values) || values.length === 0) {
        socket.emit("error", { message: "Invalid crash sequence" })
        return
      }

      // Validate all values
      for (const value of values) {
        if (value < 1.01) {
          socket.emit("error", { message: `Invalid crash value: ${value}. All values must be at least 1.01` })
          return
        }
      }

      // Check if there's already an active crash sequence
      const existingSequence = await AdminCrashSequence.findOne({ isActive: true })

      if (existingSequence) {
        // Update existing sequence
        existingSequence.crashValues = values
        existingSequence.currentIndex = 0 // Reset to start of sequence
        await existingSequence.save()

        socket.emit("message", { message: `Crash sequence updated: ${values.join(", ")}x` })
        return
      }

      // Create new crash sequence
      const crashSequence = new AdminCrashSequence({
        crashValues: values,
        currentIndex: 0,
        isActive: true,
      })

      await crashSequence.save()

      // Deactivate any single crash values for clarity
      await AdminCrash.updateMany({}, { isUsed: true })

      socket.emit("message", { message: `Crash sequence set: ${values.join(", ")}x` })
      console.log(`User ${socket.username} set crash sequence: ${values.join(", ")}x`)
    } catch (error) {
      console.error("Error setting crash sequence:", error)
      socket.emit("error", { message: "Failed to set crash sequence" })
    }
  })

  // Listen for admin force crash event
  socket.on("admin_force_crash", async () => {
    if (gameState.status === "active") {
      console.log("Admin forced crash")
      // End the game with current multiplier
      endGame(gameState.multiplier)
    }
  })

  // Also listen for the global event
  io.on("admin_force_crash", async (data) => {
    if (gameState.status === "active") {
      console.log("Admin forced crash via API")
      // End the game with current multiplier
      endGame(gameState.multiplier)
    }
  })

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id)
  })
})

// Use routes
app.use("/api", paymentRoutes)
app.use("/api", userRoutes)
app.use("/api", withdrawalRoutes)
app.use("/api", crashRoutes)
app.use("/api", adminRoutes)
app.use("/api/upi-settings", upiSettingsRoutes) // Add this line

// Start server
const PORT = process.env.PORT || 5001
server.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`)

  // Load last crashes from database
  await loadLastCrashes()

  // Start the first game
  startCountdown()
})

