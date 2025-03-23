// This file handles all WebSocket communication
import { io } from "socket.io-client"

// Game events
export const GameEvents = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  AUTHENTICATE: "authenticate",
  GAME_STATE: "game_state",
  PLACE_BET: "place_bet",
  BET_CONFIRMED: "bet_confirmed",
  BET_ERROR: "bet_error",
  CASH_OUT: "cash_out",
  CASHOUT_CONFIRMED: "cashout_confirmed",
  CASHOUT_ERROR: "cashout_error",
  NEW_BET: "new_bet",
  PLAYER_CASHED_OUT: "player_cashed_out",
  GAME_CRASHED: "game_crashed",
  GAME_STARTING: "game_starting",
  GAME_STARTED: "game_started",
  COUNTDOWN: "countdown",
  MULTIPLIER_UPDATE: "multiplier_update",
  LAST_CRASHES: "last_crashes",
  AUTH_ERROR: "auth_error",
}

class SocketService {
  constructor() {
    this.socket = null
    this.gameStateListeners = []
    this.multiplierListeners = []
    this.countdownListeners = []
    this.newBetListeners = []
    this.playerCashedOutListeners = []
    this.gameCrashedListeners = []
    this.gameStartedListeners = []
    this.lastCrashesListeners = []
    this.betConfirmedListeners = []
    this.betErrorListeners = []
    this.cashoutConfirmedListeners = []
    this.cashoutErrorListeners = []
    this.authErrorListeners = []
  }

  // Initialize the socket connection
  connect(serverUrl) {
    return new Promise((resolve, reject) => {
      try {
        console.log("Attempting to connect to:", serverUrl)

        // Close existing connection if any
        if (this.socket) {
          this.socket.disconnect()
        }

        this.socket = io(serverUrl, {
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000,
        })

        // Set up connection event handlers
        this.socket.on(GameEvents.CONNECT, () => {
          console.log("Connected to game server successfully")
          this.setupEventListeners()
          resolve()
        })

        this.socket.on("connect_error", (error) => {
          console.error("Socket connection error:", error)
          reject(error)
        })

        this.socket.on("connect_timeout", () => {
          console.error("Socket connection timeout")
          reject(new Error("Connection timeout"))
        })

        this.socket.on(GameEvents.DISCONNECT, (reason) => {
          console.log("Disconnected from game server:", reason)
        })

        // Set a timeout for connection
        setTimeout(() => {
          if (!this.socket.connected) {
            console.error("Connection timed out")
            reject(new Error("Connection timed out"))
          }
        }, 10000)
      } catch (error) {
        console.error("Socket connection error:", error)
        reject(error)
      }
    })
  }

  // Authenticate user
  authenticate(userId, username) {
    if (!this.socket) {
      console.error("Cannot authenticate: Socket not connected")
      return
    }

    console.log("Emitting authenticate event with:", userId, username)
    this.socket.emit(GameEvents.AUTHENTICATE, { userId, username })

    // Add a listener for authentication errors
    this.socket.once(GameEvents.AUTH_ERROR, (error) => {
      console.error("Authentication error from server:", error)
      this.authErrorListeners.forEach((listener) => listener(error))
    })
  }

  // Set up all the event listeners
  setupEventListeners() {
    if (!this.socket) return

    this.socket.on(GameEvents.GAME_STATE, (state) => {
      console.log("Received game state:", state)
      this.gameStateListeners.forEach((listener) => listener(state))
    })

    this.socket.on(GameEvents.MULTIPLIER_UPDATE, (multiplier) => {
      this.multiplierListeners.forEach((listener) => listener(multiplier))
    })

    this.socket.on(GameEvents.COUNTDOWN, (countdown) => {
      this.countdownListeners.forEach((listener) => listener(countdown))
    })

    this.socket.on(GameEvents.NEW_BET, (bet) => {
      this.newBetListeners.forEach((listener) => listener(bet))
    })

    this.socket.on(GameEvents.PLAYER_CASHED_OUT, (cashout) => {
      this.playerCashedOutListeners.forEach((listener) => listener(cashout))
    })

    this.socket.on(GameEvents.GAME_CRASHED, (crashPoint) => {
      this.gameCrashedListeners.forEach((listener) => listener(crashPoint))
    })

    this.socket.on(GameEvents.GAME_STARTED, () => {
      this.gameStartedListeners.forEach((listener) => listener())
    })

    this.socket.on(GameEvents.LAST_CRASHES, (crashes) => {
      this.lastCrashesListeners.forEach((listener) => listener(crashes))
    })

    this.socket.on(GameEvents.BET_CONFIRMED, (data) => {
      this.betConfirmedListeners.forEach((listener) => listener(data))
    })

    this.socket.on(GameEvents.BET_ERROR, (error) => {
      this.betErrorListeners.forEach((listener) => listener(error))
    })

    this.socket.on(GameEvents.CASHOUT_CONFIRMED, (data) => {
      this.cashoutConfirmedListeners.forEach((listener) => listener(data))
    })

    this.socket.on(GameEvents.CASHOUT_ERROR, (error) => {
      this.cashoutErrorListeners.forEach((listener) => listener(error))
    })
  }

  // Disconnect from the server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // Place a bet
  placeBet(amount) {
    if (this.socket) {
      this.socket.emit(GameEvents.PLACE_BET, { amount })
    }
  }

  // Cash out
  cashOut() {
    if (this.socket) {
      this.socket.emit(GameEvents.CASH_OUT)
    }
  }

  // Add event listeners
  onGameState(listener) {
    this.gameStateListeners.push(listener)
    return () => {
      this.gameStateListeners = this.gameStateListeners.filter((l) => l !== listener)
    }
  }

  onMultiplierUpdate(listener) {
    this.multiplierListeners.push(listener)
    return () => {
      this.multiplierListeners = this.multiplierListeners.filter((l) => l !== listener)
    }
  }

  onCountdown(listener) {
    this.countdownListeners.push(listener)
    return () => {
      this.countdownListeners = this.countdownListeners.filter((l) => l !== listener)
    }
  }

  onNewBet(listener) {
    this.newBetListeners.push(listener)
    return () => {
      this.newBetListeners = this.newBetListeners.filter((l) => l !== listener)
    }
  }

  onPlayerCashedOut(listener) {
    this.playerCashedOutListeners.push(listener)
    return () => {
      this.playerCashedOutListeners = this.playerCashedOutListeners.filter((l) => l !== listener)
    }
  }

  onGameCrashed(listener) {
    this.gameCrashedListeners.push(listener)
    return () => {
      this.gameCrashedListeners = this.gameCrashedListeners.filter((l) => l !== listener)
    }
  }

  onGameStarted(listener) {
    this.gameStartedListeners.push(listener)
    return () => {
      this.gameStartedListeners = this.gameStartedListeners.filter((l) => l !== listener)
    }
  }

  onLastCrashes(listener) {
    this.lastCrashesListeners.push(listener)
    return () => {
      this.lastCrashesListeners = this.lastCrashesListeners.filter((l) => l !== listener)
    }
  }

  onBetConfirmed(listener) {
    this.betConfirmedListeners.push(listener)
    return () => {
      this.betConfirmedListeners = this.betConfirmedListeners.filter((l) => l !== listener)
    }
  }

  onBetError(listener) {
    this.betErrorListeners.push(listener)
    return () => {
      this.betErrorListeners = this.betErrorListeners.filter((l) => l !== listener)
    }
  }

  onCashoutConfirmed(listener) {
    this.cashoutConfirmedListeners.push(listener)
    return () => {
      this.cashoutConfirmedListeners = this.cashoutConfirmedListeners.filter((l) => l !== listener)
    }
  }

  onCashoutError(listener) {
    this.cashoutErrorListeners.push(listener)
    return () => {
      this.cashoutErrorListeners = this.cashoutErrorListeners.filter((l) => l !== listener)
    }
  }

  onAuthError(listener) {
    this.authErrorListeners.push(listener)
    return () => {
      this.authErrorListeners = this.authErrorListeners.filter((l) => l !== listener)
    }
  }
}

// Create a singleton instance
export const socketService = new SocketService()
export default socketService

