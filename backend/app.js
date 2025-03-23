import express from "express"
import http from "http"
import { Server } from "socket.io"
import cors from "cors"
import mongoose from "mongoose"

const app = express()
app.use(cors())
app.use(express.json())

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

// MongoDB connection (replace with your connection string)
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/crashgame")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Game state
let gameState = "waiting" // 'waiting' | 'active' | 'crashed'
let multiplier = 1.0
let countdown = 5
let gameActive = false
let crashed = false
let rocketAtCorner = false
let activeBets = []
let recentWinners = []

// User schema
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  balance: { type: Number, default: 1000 },
  username: String,
  gameHistory: [
    {
      timestamp: { type: Date, default: Date.now },
      gameResult: String,
      betAmount: Number,
      winAmount: Number,
      multiplier: Number,
    },
  ],
})

const User = mongoose.model("User", userSchema)

// Socket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  // Send current game state to new connection
  socket.emit("gameState", {
    gameState,
    countdown,
    multiplier,
    crashed,
    gameActive,
    rocketAtCorner,
  })

  // Send active bets
  socket.emit("activeBets", { bets: activeBets })

  // Send recent winners
  socket.emit("recentWinners", { winners: recentWinners })

  // Update connected users count
  io.emit("connectedUsers", io.engine.clientsCount)

  // Handle get balance request
  socket.on("getBalance", async ({ userId }) => {
    try {
      let user = await User.findOne({ userId })

      if (!user) {
        user = new User({ userId, balance: 1000 })
        await user.save()
      }

      socket.emit(`balance:${userId}`, { balance: user.balance })

      // Check if user has an active bet
      const activeBet = activeBets.find((bet) => bet.userId === userId)
      if (activeBet) {
        socket.emit(`betStatus:${userId}`, {
          hasBet: true,
          betAmount: activeBet.amount,
        })
      } else {
        socket.emit(`betStatus:${userId}`, { hasBet: false })
      }
    } catch (error) {
      console.error("Error getting balance:", error)
    }
  })

  // Handle place bet
  socket.on("placeBet", async ({ userId, amount }) => {
    try {
      if (gameState !== "waiting") return

      const user = await User.findOne({ userId })
      if (!user || user.balance < amount) return

      // Update user balance
      user.balance -= amount
      await user.save()

      // Add to active bets
      activeBets.push({
        userId,
        amount,
        socketId: socket.id,
        username: user.username,
      })

      // Notify user of new balance and bet status
      socket.emit(`balance:${userId}`, { balance: user.balance })
      socket.emit(`betStatus:${userId}`, {
        hasBet: true,
        betAmount: amount,
      })

      // Broadcast updated bets to all clients
      io.emit("allBets", { bets: activeBets })
    } catch (error) {
      console.error("Error placing bet:", error)
    }
  })

  // Handle cash out
  socket.on("cashOut", async ({ userId, betAmount, multiplier }) => {
    try {
      if (gameState !== "active") return

      // Find the bet
      const betIndex = activeBets.findIndex((bet) => bet.userId === userId)
      if (betIndex === -1) return

      const bet = activeBets[betIndex]

      // Calculate winnings
      const winnings = bet.amount * multiplier

      // Update user balance
      const user = await User.findOne({ userId })
      if (!user) return

      user.balance += winnings

      // Add to game history
      user.gameHistory.push({
        gameResult: "win",
        betAmount: bet.amount,
        winAmount: winnings,
        multiplier,
      })

      await user.save()

      // Add to recent winners
      recentWinners.unshift({
        userId,
        username: user.username,
        winAmount: winnings,
        multiplier,
        timestamp: new Date(),
      })

      // Keep only the last 10 winners
      if (recentWinners.length > 10) {
        recentWinners = recentWinners.slice(0, 10)
      }

      // Remove from active bets
      activeBets.splice(betIndex, 1)

      // Notify user of new balance and bet status
      socket.emit(`balance:${userId}`, { balance: user.balance })
      socket.emit(`betStatus:${userId}`, { hasBet: false })

      // Broadcast updated bets and winners to all clients
      io.emit("allBets", { bets: activeBets })
      io.emit("recentWinners", { winners: recentWinners })
    } catch (error) {
      console.error("Error cashing out:", error)
    }
  })

  // Handle cancel bet
  socket.on("cancelBet", async ({ userId }) => {
    try {
      if (gameState === "active") return

      // Find the bet
      const betIndex = activeBets.findIndex((bet) => bet.userId === userId)
      if (betIndex === -1) return

      const bet = activeBets[betIndex]

      // Update user balance
      const user = await User.findOne({ userId })
      if (!user) return

      user.balance += bet.amount
      await user.save()

      // Remove from active bets
      activeBets.splice(betIndex, 1)

      // Notify user of new balance and bet status
      socket.emit(`balance:${userId}`, { balance: user.balance })
      socket.emit(`betStatus:${userId}`, { hasBet: false })

      // Broadcast updated bets to all clients
      io.emit("allBets", { bets: activeBets })
    } catch (error) {
      console.error("Error cancelling bet:", error)
    }
  })

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
    io.emit("connectedUsers", io.engine.clientsCount)
  })
})

// Game loop
function startGameLoop() {
  // Start with waiting state
  gameState = "waiting"
  countdown = 5
  multiplier = 1.0
  crashed = false
  rocketAtCorner = false
  gameActive = false

  // Broadcast initial state
  io.emit("gameState", {
    gameState,
    countdown,
    multiplier,
    crashed,
    gameActive,
    rocketAtCorner,
  })

  // Countdown timer
  const countdownInterval = setInterval(() => {
    countdown--

    // Broadcast updated countdown
    io.emit("gameState", {
      gameState,
      countdown,
      multiplier,
      crashed,
      gameActive,
      rocketAtCorner,
    })

    if (countdown <= 0) {
      clearInterval(countdownInterval)
      startGame()
    }
  }, 1000)
}

function startGame() {
  // Set game to active
  gameState = "active"
  gameActive = true
  multiplier = 1.0
  crashed = false
  rocketAtCorner = false

  // Broadcast game start
  io.emit("gameState", {
    gameState,
    countdown: 0,
    multiplier,
    crashed,
    gameActive,
    rocketAtCorner,
  })

  // Generate random crash point between 1.1 and 10.0
  // Higher values are less likely
  const crashPoint = Math.max(1.1, Math.pow(Math.random() * 0.99, -1) * 0.9)
  console.log("Game started, will crash at:", crashPoint.toFixed(2))

  // Increase multiplier
  const multiplierInterval = setInterval(() => {
    multiplier = Number.parseFloat((multiplier * 1.07).toFixed(2))

    // Broadcast updated multiplier
    io.emit("gameState", {
      gameState,
      countdown: 0,
      multiplier,
      crashed,
      gameActive,
      rocketAtCorner,
    })

    // Check if game should crash
    if (multiplier >= crashPoint) {
      clearInterval(multiplierInterval)
      handleCrash()
    }
  }, 100)
}

async function handleCrash() {
  // Set game to crashed
  gameState = "crashed"
  gameActive = false
  crashed = true

  // Broadcast crash
  io.emit("gameState", {
    gameState,
    countdown: 0,
    multiplier,
    crashed,
    gameActive,
    rocketAtCorner,
  })

  // Handle lost bets
  for (const bet of activeBets) {
    try {
      const user = await User.findOne({ userId: bet.userId })
      if (!user) continue

      // Add to game history
      user.gameHistory.push({
        gameResult: "loss",
        betAmount: bet.amount,
        winAmount: 0,
        multiplier: 0,
      })

      await user.save()

      // Notify user of bet status
      io.to(bet.socketId).emit(`betStatus:${bet.userId}`, { hasBet: false })
    } catch (error) {
      console.error("Error handling lost bet:", error)
    }
  }

  // Clear active bets
  activeBets = []
  io.emit("allBets", { bets: activeBets })

  // Wait before starting next game
  setTimeout(() => {
    startGameLoop()
  }, 3000)
}

// Start the game loop
startGameLoop()

// Start server
const PORT = process.env.PORT || 5002
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

