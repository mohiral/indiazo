const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const http = require("http")
const { Server } = require("socket.io")
const { v4: uuidv4 } = require("uuid")
const path = require("path")
const fs = require("fs")

// Import models
const CrashHistory = require("./models/crash-history")
const Bet = require("./models/bet")

// Import routes
const paymentRoutes = require("./routes/paymentRoutes")
const userRoutes = require("./routes/userRoutes")
const withdrawalRoutes = require("./routes/withdrawalRoutes")
const crashRoutes = require("./routes/crashRoutes")

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

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

// Start the game
function startGame() {
  gameState.status = "active"
  gameState.multiplier = 1.0
  io.emit("game_started")
  io.emit("game_state", gameState)

  const crashPoint = generateCrashPoint()
  console.log(`Game started. Will crash at ${crashPoint}x`)

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

    if (gameState.multiplier >= crashPoint) {
      endGame(crashPoint)
    }
  }, 100)
}

// End the game (crash)
async function endGame(crashPoint) {
  clearInterval(gameInterval)

  gameState.status = "crashed"
  gameState.lastCrashes.unshift(crashPoint)
  gameState.lastCrashes = gameState.lastCrashes.slice(0, 10)

  io.emit("game_crashed", crashPoint)
  io.emit("game_state", gameState)

  // Save crash to database
  try {
    const crashHistory = new CrashHistory({
      crashPoint: crashPoint,
      gameId: gameState.currentGameId,
    })
    await crashHistory.save()

    // Update all active bets as lost
    await Bet.updateMany({ gameId: gameState.currentGameId, status: "active" }, { status: "lost" })

    console.log(`Crash at ${crashPoint}x saved to database`)
  } catch (err) {
    console.error("Error saving crash history:", err)
  }

  // Schedule next game
  setTimeout(startCountdown, 3000)
}

// Generate a random crash point
function generateCrashPoint() {
  // This is a simple example - you might want a more sophisticated algorithm
  const house_edge = 0.05
  const r = Math.random()

  if (r < house_edge) {
    return 1.0 // Instant crash (house edge)
  }

  // Otherwise, follow a distribution that makes higher values less likely
  return Math.max(1.0, Number.parseFloat((0.9 / (1.0 - r - house_edge)).toFixed(2)))
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

// Start server
const PORT = process.env.PORT || 5001
server.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`)

  // Load last crashes from database
  await loadLastCrashes()

  // Start the first game
  startCountdown()
})

