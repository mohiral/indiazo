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
  }

  // Initialize the socket connection
  connect(serverUrl) {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(serverUrl, {
          transports: ["websocket"],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        })

        this.socket.on(GameEvents.CONNECT, () => {
          console.log("Connected to game server")
          this.setupEventListeners()
          resolve()
        })

        this.socket.on(GameEvents.DISCONNECT, () => {
          console.log("Disconnected from game server")
        })
      } catch (error) {
        console.error("Socket connection error:", error)
        reject(error)
      }
    })
  }

  // Authenticate user
  authenticate(userId, username) {
    if (!this.socket) return
    this.socket.emit(GameEvents.AUTHENTICATE, { userId, username })
  }

  // Set up all the event listeners
  setupEventListeners() {
    if (!this.socket) return

    this.socket.on(GameEvents.GAME_STATE, (state) => {
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
}

// Create a singleton instance
export const socketService = new SocketService()
export default socketService

