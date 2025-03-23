const WebSocket = require("ws")
const http = require("http")
const { v4: uuidv4 } = require("uuid")

// Create HTTP server
const server = http.createServer()

// Create WebSocket server
const wss = new WebSocket.Server({ server })

// Game state
const gameState = {
  state: "waiting", // "waiting" | "active" | "crashed"
  multiplier: 1.0,
  countdown: 5,
  crashPoint: 0,
  players: [],
  activeBets: [],
}

// Player data - stored in memory
const players = new Map()

// Generate a random crash point between 1.0 and 10.0
// Sometimes it will crash early (below 2.0) to create excitement
function generateCrashPoint() {
  // 20% chance of early crash (1.0 to 2.0)
  if (Math.random() < 0.2) {
    return 1.0 + Math.random()
  }

  // Otherwise, use house edge algorithm
  // This creates an exponential distribution favoring lower values
  const houseEdge = 0.05 // 5% house edge
  const r = Math.random()
  return Math.max(1.0, 1 / (r * (1 - houseEdge)))
}

// Start game loop
function startGameLoop() {
  // Start countdown
  gameState.state = "waiting"
  gameState.multiplier = 1.0
  gameState.countdown = 5

  // Generate crash point for this round
  gameState.crashPoint = generateCrashPoint()
  console.log(`Next crash point: ${gameState.crashPoint.toFixed(2)}x`)

  // Countdown timer
  const countdownInterval = setInterval(() => {
    gameState.countdown -= 1
    broadcastGameState()

    if (gameState.countdown <= 0) {
      clearInterval(countdownInterval)
      startGame()
    }
  }, 1000)
}

// Start active game
function startGame() {
  gameState.state = "active"
  gameState.multiplier = 1.0
  broadcastGameState()

  // Multiplier increase interval
  const gameInterval = setInterval(() => {
    // Increase multiplier
    gameState.multiplier = Number.parseFloat((gameState.multiplier * 1.05).toFixed(2))

    // Check if game should crash
    if (gameState.multiplier >= gameState.crashPoint) {
      clearInterval(gameInterval)
      handleCrash()
      return
    }

    broadcastGameState()
  }, 100)
}

// Handle game crash
function handleCrash() {
  gameState.state = "crashed"
  broadcastGameState()

  // Process lost bets - players who didn't cash out lose their bet
  gameState.activeBets.forEach((bet) => {
    const player = players.get(bet.playerId)
    if (player) {
      player.lastBet = bet.amount
      player.lastCashout = null
      player.activeBet = null

      // Update player in the players list
      updatePlayerInList(player)
    }
  })

  // Clear active bets
  gameState.activeBets = []

  // Broadcast updated player list
  broadcastPlayers()

  // Wait before starting next round
  setTimeout(() => {
    startGameLoop()
  }, 3000)
}

// Broadcast game state to all connected clients
function broadcastGameState() {
  const message = JSON.stringify({
    type: "GAME_STATE",
    state: gameState.state,
    multiplier: gameState.multiplier,
    countdown: gameState.countdown,
    activeBets: gameState.activeBets,
  })

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  })
}

// Broadcast players list to all connected clients
function broadcastPlayers() {
  const playersList = Array.from(players.values()).map((player) => ({
    id: player.id,
    balance: player.balance,
    activeBet: player.activeBet,
    lastCashout: player.lastCashout,
  }))

  const message = JSON.stringify({
    type: "PLAYERS",
    players: playersList,
  })

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  })
}

// Update player in the players list
function updatePlayerInList(player) {
  // Find player in the list
  const playerIndex = gameState.players.findIndex((p) => p.id === player.id)

  if (playerIndex !== -1) {
    // Update existing player
    gameState.players[playerIndex] = {
      id: player.id,
      balance: player.balance,
      activeBet: player.activeBet,
      lastCashout: player.lastCashout,
    }
  } else {
    // Add new player
    gameState.players.push({
      id: player.id,
      balance: player.balance,
      activeBet: player.activeBet,
      lastCashout: player.lastCashout,
    })
  }
}

// Handle WebSocket connections
wss.on("connection", (ws) => {
  // Generate unique player ID
  const playerId = uuidv4()

  // Create player with initial balance
  players.set(playerId, {
    id: playerId,
    balance: 1000,
    activeBet: null,
    lastCashout: null,
  })

  // Add player to the list
  updatePlayerInList(players.get(playerId))

  // Send player ID to client
  ws.send(
    JSON.stringify({
      type: "PLAYER_ID",
      id: playerId,
    }),
  )

  // Send current game state
  ws.send(
    JSON.stringify({
      type: "GAME_STATE",
      state: gameState.state,
      multiplier: gameState.multiplier,
      countdown: gameState.countdown,
      activeBets: gameState.activeBets,
    }),
  )

  // Broadcast updated player list
  broadcastPlayers()

  // Handle messages from client
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message)

      switch (data.type) {
        case "PLACE_BET":
          handlePlaceBet(data)
          break
        case "CASH_OUT":
          handleCashOut(data)
          break
        default:
          console.log("Unknown message type:", data.type)
      }
    } catch (error) {
      console.error("Error processing message:", error)
    }
  })

  // Handle client disconnect
  ws.on("close", () => {
    // Remove player from the list
    const playerIndex = gameState.players.findIndex((p) => p.id === playerId)
    if (playerIndex !== -1) {
      gameState.players.splice(playerIndex, 1)
    }

    // Remove player's active bets
    gameState.activeBets = gameState.activeBets.filter((bet) => bet.playerId !== playerId)

    // Remove player from players map
    players.delete(playerId)

    // Broadcast updated player list
    broadcastPlayers()
  })
})

// Handle place bet
function handlePlaceBet(data) {
  const { playerId, amount } = data
  const player = players.get(playerId)

  if (!player) return
  if (gameState.state !== "waiting") return
  if (player.activeBet) return

  const betAmount = Number.parseFloat(amount)
  if (isNaN(betAmount) || betAmount <= 0) return
  if (betAmount > player.balance) return

  // Deduct bet amount from player balance
  player.balance -= betAmount
  player.activeBet = betAmount

  // Add bet to active bets
  gameState.activeBets.push({
    playerId,
    amount: betAmount,
  })

  // Update player in the list
  updatePlayerInList(player)

  // Send wallet update to player
  sendWalletUpdate(playerId)

  // Broadcast updated player list
  broadcastPlayers()
}

// Handle cash out
function handleCashOut(data) {
  const { playerId, multiplier } = data
  const player = players.get(playerId)

  if (!player) return
  if (gameState.state !== "active") return
  if (!player.activeBet) return

  // Find player's bet
  const betIndex = gameState.activeBets.findIndex((bet) => bet.playerId === playerId)
  if (betIndex === -1) return

  // Calculate winnings
  const bet = gameState.activeBets[betIndex]
  const winnings = bet.amount * gameState.multiplier

  // Add winnings to player balance
  player.balance += winnings
  player.lastCashout = gameState.multiplier
  player.activeBet = null

  // Remove bet from active bets
  gameState.activeBets.splice(betIndex, 1)

  // Update player in the list
  updatePlayerInList(player)

  // Send wallet update to player
  sendWalletUpdate(playerId)

  // Broadcast updated player list
  broadcastPlayers()
}

// Send wallet update to player
function sendWalletUpdate(playerId) {
  const player = players.get(playerId)
  if (!player) return

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "WALLET_UPDATE",
          playerId,
          balance: player.balance,
        }),
      )
    }
  })
}

// Start the server
const PORT = process.env.PORT || 8080
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)

  // Start the game loop
  startGameLoop()
})

