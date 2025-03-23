"use client"

// This file provides a React context for the game state
import { createContext, useContext, useEffect, useState } from "react"
import socketService from "./socket-service"

const defaultGameState = {
  status: "waiting",
  countdown: 0,
  multiplier: 1.0,
  activeBets: [],
  cashedOut: [],
  lastCrashes: [],
  currentGameId: null,
}

const GameContext = createContext({
  isConnected: false,
  isAuthenticated: false,
  gameState: defaultGameState,
  currentMultiplier: 1.0,
  countdown: 0,
  activeBets: [],
  cashedOut: [],
  lastCrashes: [],
  connect: async () => {},
  authenticate: () => {},
  disconnect: () => {},
  placeBet: () => {},
  cashOut: () => {},
})

export const useGameContext = () => useContext(GameContext)

export const GameProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [gameState, setGameState] = useState(defaultGameState)
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0)
  const [countdown, setCountdown] = useState(0)
  const [activeBets, setActiveBets] = useState([])
  const [cashedOut, setCashedOut] = useState([])
  const [lastCrashes, setLastCrashes] = useState([])
  // Add auth error handling
  const [authError, setAuthError] = useState(null)

  const connect = async (serverUrl) => {
    try {
      await socketService.connect(serverUrl)
      setIsConnected(true)
    } catch (error) {
      console.error("Failed to connect:", error)
      setIsConnected(false)
    }
  }

  const authenticate = (userId, username) => {
    if (!isConnected) {
      console.error("Cannot authenticate: Not connected to server")
      return
    }

    try {
      console.log("Authenticating with:", userId, username)
      socketService.authenticate(userId, username)
      setIsAuthenticated(true)
    } catch (error) {
      console.error("Authentication error:", error)
    }
  }

  const disconnect = () => {
    socketService.disconnect()
    setIsConnected(false)
    setIsAuthenticated(false)
  }

  const placeBet = (amount) => {
    if (!isConnected || !isAuthenticated) return
    socketService.placeBet(amount)
  }

  const cashOut = () => {
    if (!isConnected || !isAuthenticated) return
    socketService.cashOut()
  }

  useEffect(() => {
    // Set up event listeners when the component mounts
    const gameStateUnsubscribe = socketService.onGameState((state) => {
      setGameState(state)
      setActiveBets(state.activeBets)
      setCashedOut(state.cashedOut)
    })

    const multiplierUnsubscribe = socketService.onMultiplierUpdate((multiplier) => {
      setCurrentMultiplier(multiplier)
    })

    const countdownUnsubscribe = socketService.onCountdown((count) => {
      setCountdown(count)
    })

    const newBetUnsubscribe = socketService.onNewBet((bet) => {
      setActiveBets((prev) => [...prev, bet])
    })

    const playerCashedOutUnsubscribe = socketService.onPlayerCashedOut((cashout) => {
      setCashedOut((prev) => [...prev, cashout])
      setActiveBets((prev) => prev.filter((bet) => bet.userId !== cashout.userId))
    })

    const gameCrashedUnsubscribe = socketService.onGameCrashed((crashPoint) => {
      setLastCrashes((prev) => [crashPoint, ...prev].slice(0, 10))
    })

    const lastCrashesUnsubscribe = socketService.onLastCrashes((crashes) => {
      setLastCrashes(crashes)
    })

    // Add auth error handling
    const authErrorUnsubscribe = socketService.onAuthError((error) => {
      console.error("Authentication error:", error)
      setAuthError(error)
      setIsAuthenticated(false)
    })

    // Clean up event listeners when the component unmounts
    return () => {
      gameStateUnsubscribe()
      multiplierUnsubscribe()
      countdownUnsubscribe()
      newBetUnsubscribe()
      playerCashedOutUnsubscribe()
      gameCrashedUnsubscribe()
      lastCrashesUnsubscribe()
      authErrorUnsubscribe()
    }
  }, [])

  return (
    <GameContext.Provider
      value={{
        isConnected,
        isAuthenticated,
        gameState,
        currentMultiplier,
        countdown,
        activeBets,
        cashedOut,
        lastCrashes,
        connect,
        authenticate,
        disconnect,
        placeBet,
        cashOut,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

