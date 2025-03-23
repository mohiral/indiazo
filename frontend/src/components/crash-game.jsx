"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Rocket from "../assets/Rocket.gif"
import BetSection from "./bet-section"
import { useGameContext } from "./game-context"
import PlayersList from "./players-list"
import CrashHistory from "./crash-history"

// Hardcoded default user credentials - REMOVE IN PRODUCTION
const DEFAULT_USER_ID = "user123"
const DEFAULT_USERNAME = "Player123"

const CrashGame = () => {
  const {
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
  } = useGameContext()

  const [userId, setUserId] = useState(DEFAULT_USER_ID)
  const [username, setUsername] = useState(DEFAULT_USERNAME)
  const [serverUrl, setServerUrl] = useState("http://localhost:5173")
  const [walletBalance, setWalletBalance] = useState(1000)
  const [isLoading, setIsLoading] = useState(true)

  const [rocketLoaded, setRocketLoaded] = useState(false)
  const rocketRef = useRef(null)
  const [pathProgress, setPathProgress] = useState(0)
  const [slowMotionActive, setSlowMotionActive] = useState(false)
  const [rocketPosition, setRocketPosition] = useState({ x: 0, y: 0 })
  const [crashDirection, setCrashDirection] = useState({ x: 0, y: 0 })
  const [rocketPieces, setRocketPieces] = useState([])
  const [screenShake, setScreenShake] = useState(false)
  const [explosionActive, setExplosionActive] = useState(false)
  const [smokeParticles, setSmokeParticles] = useState([])
  const [dotPosition, setDotPosition] = useState(0)
  const [rocketAtCorner, setRocketAtCorner] = useState(false)

  const explosion = useState(0)

  const explosionSoundRef = useRef(null)
  const crashSoundRef = useRef(null)

  // Preload rocket image
  useEffect(() => {
    const img = new Image()
    img.src = Rocket || "/placeholder.svg"
    img.onload = () => setRocketLoaded(true)

    // Preload sounds
    explosionSoundRef.current = new Audio("/explosion.mp3")
    crashSoundRef.current = new Audio("/metal-crash.mp3")

    return () => {
      // Cleanup sounds
      if (explosionSoundRef.current) {
        explosionSoundRef.current.pause()
        explosionSoundRef.current.src = ""
      }
      if (crashSoundRef.current) {
        crashSoundRef.current.pause()
        crashSoundRef.current.src = ""
      }
    }
  }, [])

  // Initialize connection and authentication
  useEffect(() => {
    const initializeGame = async () => {
      setIsLoading(true)

      try {
        // Try to get stored credentials
        let storedUserId = localStorage.getItem("userId")
        let storedUsername = localStorage.getItem("username")

        // If no stored credentials, use defaults and save them
        if (!storedUserId || !storedUsername) {
          storedUserId = DEFAULT_USER_ID
          storedUsername = DEFAULT_USERNAME
          localStorage.setItem("userId", storedUserId)
          localStorage.setItem("username", storedUsername)
        }

        // Update state
        setUserId(storedUserId)
        setUsername(storedUsername)

        // Connect to server
        console.log("Connecting to server:", serverUrl)
        await connect(serverUrl)

        // Wait a moment for connection to stabilize
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Authenticate
        console.log("Authenticating with:", storedUserId, storedUsername)
        authenticate(storedUserId, storedUsername)
      } catch (error) {
        console.error("Error initializing game:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeGame()

    return () => {
      disconnect()
    }
  }, [])

  // Handle game state changes
  useEffect(() => {
    if (!gameState) return

    // Update local state based on server game state
    if (gameState.status === "active") {
      setRocketAtCorner(false)
      setPathProgress(0)
      setSlowMotionActive(false)
      setRocketPieces([])
      setScreenShake(false)
      setExplosionActive(false)
      setSmokeParticles([])
    } else if (gameState.status === "crashed") {
      handleCrash()
    }
  }, [gameState])

  // Handle multiplier updates
  useEffect(() => {
    if (!gameState || gameState.status !== "active") return

    // Update path progress based on multiplier
    // Assuming multiplier goes from 1.0 to ~10.0 in a typical game
    const progress = Math.min((currentMultiplier - 1) / 9, 1)
    setPathProgress(progress)

    // Update rocket position for crash animation
    const position = getRocketPosition(progress)
    setRocketPosition(position)

    // Calculate direction for crash
    if (progress > 0.1) {
      const prevPosition = getRocketPosition(progress - 0.1)
      setCrashDirection({
        x: position.x - prevPosition.x,
        y: position.y - prevPosition.y,
      })
    }

    if (progress >= 1) {
      setRocketAtCorner(true)
    }
  }, [currentMultiplier, gameState])

  // Handle rocket animation
  useEffect(() => {
    if (!rocketAtCorner || gameState?.status === "crashed") return
    const moveInterval = setInterval(() => {
      setDotPosition((prev) => (prev + 2) % 40)
    }, 150)
    return () => clearInterval(moveInterval)
  }, [rocketAtCorner, gameState])

  // Animate smoke particles
  useEffect(() => {
    if (smokeParticles.length === 0) return

    let animationId
    const updateSmoke = () => {
      setSmokeParticles((prevParticles) =>
        prevParticles
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.vx * 0.5,
            y: particle.y + particle.vy * 0.5,
            // Slow down the particles over time
            vx: particle.vx * 0.98,
            vy: particle.vy * 0.98,
            size: particle.size + 0.5, // Grow slightly
            opacity: particle.opacity > 0 ? particle.opacity - 0.01 : 0,
          }))
          .filter((particle) => particle.opacity > 0.05),
      )

      animationId = requestAnimationFrame(updateSmoke)
    }

    animationId = requestAnimationFrame(updateSmoke)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [smokeParticles.length])

  // Animate rocket pieces
  useEffect(() => {
    if (rocketPieces.length === 0) return

    let animationId
    const updatePieces = () => {
      setRocketPieces((prevPieces) =>
        prevPieces
          .map((piece) => ({
            ...piece,
            x: piece.x + piece.vx,
            y: piece.y + piece.vy,
            vy: piece.vy + 0.05, // reduced gravity for longer travel
            rotation: piece.rotation + piece.rotationSpeed,
            opacity: piece.opacity > 0 ? piece.opacity - 0.005 : 0, // slower fade for longer visibility
          }))
          .filter((piece) => piece.opacity > 0),
      )

      animationId = requestAnimationFrame(updatePieces)
    }

    animationId = requestAnimationFrame(updatePieces)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [rocketPieces.length])

  // Handle screen shake effect
  useEffect(() => {
    if (screenShake) {
      // Disable shake after a short duration
      const timeout = setTimeout(() => {
        setScreenShake(false)
      }, 1000)
      return () => clearTimeout(timeout)
    }
  }, [screenShake])

  // Enhanced crash function with immediate impact and effects
  const handleCrash = () => {
    // Play crash sounds immediately
    if (explosionSoundRef.current) {
      explosionSoundRef.current.currentTime = 0
      explosionSoundRef.current.play().catch((e) => console.log("Audio play failed:", e))
    }
    if (crashSoundRef.current) {
      crashSoundRef.current.currentTime = 0
      crashSoundRef.current.play().catch((e) => console.log("Audio play failed:", e))
    }

    // Immediate crash effects
    setExplosionActive(true)
    setScreenShake(true)

    // Generate rocket pieces for the explosion
    const pieces = []
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const speed = 5 + Math.random() * 8 // Increased speed
      pieces.push({
        id: i,
        x: rocketPosition.x,
        y: rocketPosition.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 20,
        size: 10 + Math.random() * 15,
        opacity: 1,
      })
    }
    setRocketPieces(pieces)

    // Create smoke particles that follow the rocket's trajectory
    const smokeParticles = []
    for (let i = 0; i < 15; i++) {
      // Create smoke that follows the main direction with slight variation
      smokeParticles.push({
        id: i,
        x: rocketPosition.x,
        y: rocketPosition.y,
        // Follow the crash direction but with some randomness
        vx: crashDirection.x * (2 + Math.random() * 2) + (Math.random() - 0.5) * 1,
        vy: crashDirection.y * (2 + Math.random() * 2) + (Math.random() - 0.5) * 1,
        size: 20 + Math.random() * 40,
        opacity: 0.7 + Math.random() * 0.3,
        delay: i * 100, // Stagger the smoke particles
      })
    }
    setSmokeParticles(smokeParticles)

    // Activate slow motion immediately after impact
    setSlowMotionActive(true)
  }

  // Handle place bet
  const handlePlaceBet = (amount) => {
    if (!isConnected || !isAuthenticated || !gameState || gameState.status !== "waiting") return false

    // Call the placeBet function from the context
    placeBet(amount)

    // Update local wallet balance
    setWalletBalance((prev) => prev - amount)

    return true
  }

  // Handle cash out
  const handleCashOut = () => {
    if (!isConnected || !isAuthenticated || !gameState || gameState.status !== "active") return false

    // Call the cashOut function from the context
    cashOut()

    return true
  }

  // Function to get path coordinates
  const getPathCoordinates = () => {
    const isMobile = window.innerWidth < 640
    const startY = isMobile ? 160 : 240 // Reduced from 180/270 to 160/240
    const controlX = isMobile ? 150 : 300
    const controlY = isMobile ? 100 : 160 // Reduced from 120/190 to 100/160
    const endX = isMobile ? 300 : 600
    const endY = 0

    return { startY, controlX, controlY, endX, endY }
  }

  // Calculate the path for the current progress
  const calculatePartialPath = () => {
    const isMobile = window.innerWidth < 640
    const startY = isMobile ? 160 : 240
    const controlX = isMobile ? 150 : 300
    const controlY = isMobile ? 100 : 160
    const endX = isMobile ? 300 : 600
    const endY = 0

    // If progress is 0, return just the starting point
    if (pathProgress <= 0) {
      return `M 0 ${startY}`
    }

    // Calculate intermediate point on the quadratic curve
    const t = pathProgress
    const x = (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * controlX + t * t * endX
    const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY

    return `M 0 ${startY} Q ${controlX * pathProgress} ${controlY + (startY - controlY) * (1 - pathProgress)} ${x} ${y}`
  }

  // Calculate the fill path for the current progress
  const calculatePartialFillPath = () => {
    const isMobile = window.innerWidth < 640
    const startY = isMobile ? 160 : 240
    const controlX = isMobile ? 150 : 300
    const controlY = isMobile ? 100 : 160
    const endX = isMobile ? 300 : 600
    const endY = 0

    // If progress is 0, return just a point
    if (pathProgress <= 0) {
      return `M 0 ${startY} L 0 ${startY}`
    }

    // Calculate intermediate point on the quadratic curve
    const t = pathProgress
    const x = (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * controlX + t * t * endX
    const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY

    // Create a fill path that goes from start to current point, then down and back
    return `M 0 ${startY} Q ${controlX * pathProgress} ${controlY + (startY - controlY) * (1 - pathProgress)} ${x} ${y} L ${x} ${startY} L 0 ${startY}`
  }

  // Get the current position of the rocket for crash animation
  const getRocketPosition = (progress = pathProgress) => {
    const isMobile = window.innerWidth < 640
    const startY = isMobile ? 160 : 240
    const controlX = isMobile ? 150 : 300
    const controlY = isMobile ? 100 : 160
    const endX = isMobile ? 300 : 600
    const endY = 0

    // Calculate position based on path progress
    const t = progress
    const x = (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * controlX + t * t * endX
    const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY

    return { x, y }
  }

  // Handle manual login
  const handleManualLogin = () => {
    // Save to localStorage
    localStorage.setItem("userId", userId)
    localStorage.setItem("username", username)

    // Authenticate
    authenticate(userId, username)
  }

  // If loading, show loading screen
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto bg-gradient-to-b from-black to-blue-900 flex flex-col items-center justify-center text-white p-6 rounded-lg h-screen">
        <h1 className="text-3xl font-bold mb-6">COSMIC CRASH</h1>
        <div className="w-16 h-16 border-t-4 border-cyan-500 border-solid rounded-full animate-spin"></div>
        <p className="mt-4">Connecting to game server...</p>
      </div>
    )
  }

  // If not connected or authenticated, show login form
  if (!isConnected || !isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto bg-gradient-to-b from-black to-blue-900 flex flex-col items-center justify-center text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-6">COSMIC CRASH</h1>
        <div className="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Login to Play</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Server URL</label>
              <input
                type="text"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white"
                placeholder="https://backend.indiazo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">User ID</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white"
                placeholder="Your user ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white"
                placeholder="Your display name"
              />
            </div>
            <button
              onClick={handleManualLogin}
              className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded font-medium hover:from-purple-700 hover:to-blue-700 transition-colors"
            >
              Connect & Play
            </button>

            {/* Connection status */}
            <div className="mt-4 text-center">
              <p className="text-sm">
                Connection Status:{" "}
                <span className={isConnected ? "text-green-400" : "text-red-400"}>
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </p>
              <p className="text-sm">
                Authentication Status:{" "}
                <span className={isAuthenticated ? "text-green-400" : "text-red-400"}>
                  {isAuthenticated ? "Authenticated" : "Not Authenticated"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`max-w-6xl mx-auto bg-gradient-to-b from-black to-blue-900 flex flex-col items-center justify-center text-white p-2 sm:p-4 relative ${screenShake ? "animate-screen-shake" : ""}`}
      onClick={(e) => e.stopPropagation()} // Prevent click propagation
    >
      {/* Navigation Bar */}
      <div className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center p-1 sm:p-2 rounded-t-lg font-bold text-sm sm:text-lg mb-1 shadow-lg">
        COSMIC CRASH
      </div>

      {/* Game Layout - Two columns on larger screens */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Game Area - Takes 2/3 of the space on larger screens */}
        <div className="lg:col-span-2">
          {/* Graph Container */}
          <div className="w-full h-auto min-h-[250px] md:min-h-[300px] bg-[#0a192f] p-2 sm:p-4 rounded-lg flex flex-col items-center relative border border-indigo-900 shadow-[0_0_15px_rgba(66,153,225,0.5)]">
            {/* Slow motion overlay when active */}
            {slowMotionActive && <div className="absolute inset-0 bg-blue-900/20 z-50 pointer-events-none"></div>}

            {/* Enhanced Stars Background */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="stars-small"></div>
              <div className="stars-medium"></div>
              <div className="stars-large"></div>
              <div className="shooting-stars"></div>

              {/* Enhanced Solar System */}
              <div className="sun"></div>
              <div className="mercury-orbit">
                <div className="mercury">
                  <div className="planet-glow mercury-glow"></div>
                </div>
              </div>
              <div className="venus-orbit">
                <div className="venus">
                  <div className="planet-glow venus-glow"></div>
                </div>
              </div>
              <div className="earth-orbit">
                <div className="earth">
                  <div className="planet-glow earth-glow"></div>
                </div>
              </div>
              <div className="mars-orbit">
                <div className="mars">
                  <div className="planet-glow mars-glow"></div>
                </div>
              </div>
              <div className="jupiter-orbit">
                <div className="jupiter">
                  <div className="planet-glow jupiter-glow"></div>
                </div>
              </div>
              <div className="saturn-orbit">
                <div className="saturn">
                  <div className="saturn-rings"></div>
                  <div className="planet-glow saturn-glow"></div>
                </div>
              </div>
            </div>

            {/* Game Status Display */}
            <div className="absolute top-2 left-4 z-10">
              <span
                className={`px-3 py-1 rounded-full text-sm font-bold ${
                  gameState?.status === "waiting"
                    ? "bg-gradient-to-r from-yellow-600 to-amber-500 animate-pulse"
                    : gameState?.status === "active"
                      ? "bg-gradient-to-r from-green-600 to-emerald-500"
                      : "bg-gradient-to-r from-red-600 to-rose-500"
                }`}
              >
                {gameState?.status === "waiting"
                  ? "WAITING"
                  : gameState?.status === "active"
                    ? "IN PROGRESS"
                    : "CRASHED"}
              </span>
            </div>

            {/* Last Crashes Display */}
            <div className="absolute top-2 right-4 z-10 flex space-x-2">
              {lastCrashes.slice(0, 5).map((crash, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    crash < 2 ? "bg-red-600" : crash < 5 ? "bg-yellow-600" : "bg-green-600"
                  }`}
                >
                  {crash.toFixed(2)}x
                </span>
              ))}
            </div>

            {/* Multiplier or Countdown Display */}
            <div className="z-10 mt-4 flex flex-col items-center h-[80px] justify-center">
              {gameState?.status === "active" ? (
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.9, repeat: Number.POSITIVE_INFINITY }}
                  className="text-4xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"
                >
                  {currentMultiplier.toFixed(2)}x
                </motion.div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="text-3xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
                    {gameState?.status === "crashed" ? "CRASHED" : "GETTING THE BETS"}
                  </div>
                  <div className="text-xl sm:text-3xl font-bold text-yellow-500 mb-2">{countdown}s</div>
                  <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-1000 ease-linear"
                      style={{ width: `${(countdown / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Game Area - Adjusted height for smaller container */}
            <div className="relative w-full h-48 sm:h-64 mt-2 overflow-visible">
              {/* Corner Labels */}
              <div className="absolute bottom-0 left-0 text-cyan-300 z-10 font-bold">A</div>
              <div className="absolute bottom-0 right-0 text-cyan-300 z-10 font-bold">B</div>
              <div className="absolute top-0 right-0 text-cyan-300 z-10 font-bold">C</div>
              <div className="absolute top-0 left-0 text-cyan-300 z-10 font-bold">D</div>

              {/* Path and Background Combined */}
              <svg className="absolute w-full h-full" style={{ zIndex: 1 }}>
                <defs>
                  <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>

                {/* Background that grows with the path */}
                {gameState?.status === "active" && (
                  <path d={calculatePartialFillPath()} fill="rgba(6, 182, 212, 0.1)" />
                )}

                {/* The curve path */}
                {gameState?.status === "active" && (
                  <path d={calculatePartialPath()} stroke="url(#pathGradient)" strokeWidth="3" fill="none" />
                )}

                {gameState?.status === "active" && (
                  <>
                    <path
                      d={`M 0 0 L 0 ${window.innerWidth < 640 ? 160 : 240}`}
                      stroke={rocketAtCorner ? "rgba(6, 182, 212, 0.6)" : "rgba(255,255,255,0.4)"}
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray={`${dotPosition},4,4,4,4,4,4,4,4,4`}
                      style={{ strokeDashoffset: -dotPosition }}
                    />

                    <path
                      d={`M 0 ${window.innerWidth < 640 ? 160 : 240} L ${window.innerWidth < 640 ? 300 : 840} ${window.innerWidth < 640 ? 160 : 240}`}
                      stroke={rocketAtCorner ? "rgba(6, 182, 212, 0.6)" : "rgba(255,255,255,0.4)"}
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray={`${dotPosition},4,4,4,4,4,4,4,4,4`}
                      style={{ strokeDashoffset: -dotPosition }}
                    />
                  </>
                )}
              </svg>

              {/* Enhanced Rocket with Cinematic Slow Motion Crash */}
              {(gameState?.status === "active" || gameState?.status === "crashed") && !explosionActive && (
                <div
                  className={`absolute w-16 h-16 sm:w-24 sm:h-24 rocket-element ${gameState?.status === "crashed" ? "rocket-crash-inertia" : ""}`}
                  style={{
                    left: gameState?.status === "crashed" ? `${rocketPosition.x}px` : undefined,
                    top: gameState?.status === "crashed" ? `${rocketPosition.y}px` : undefined,
                    offsetPath:
                      gameState?.status === "crashed"
                        ? undefined
                        : `path('M 0 ${window.innerWidth < 640 ? 160 : 240} Q ${window.innerWidth < 640 ? 150 : 300} ${window.innerWidth < 640 ? 100 : 160} ${window.innerWidth < 640 ? 300 : 600} 0')`,
                    offsetDistance: gameState?.status === "crashed" ? undefined : `${pathProgress * 100}%`,
                    offsetRotate: gameState?.status === "crashed" ? 0 : "auto",
                    filter: "drop-shadow(0 0 15px rgba(6,182,212,0.8))",
                    zIndex: 20,
                    transition:
                      slowMotionActive && gameState?.status !== "crashed"
                        ? "all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)"
                        : undefined,
                    transformOrigin: "center center",
                    "--crash-direction-x": gameState?.status === "crashed" ? crashDirection.x : 1,
                    "--crash-direction-y": gameState?.status === "crashed" ? crashDirection.y : 0,
                    "--crash-rotation":
                      gameState?.status === "crashed"
                        ? `${Math.atan2(crashDirection.y, crashDirection.x) * (180 / Math.PI)}deg`
                        : "45deg",
                  }}
                >
                  <div className="relative">
                    {/* Rocket flame effect */}
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-12 z-0">
                      <div className="w-full h-full relative">
                        <div
                          className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-8 bg-gradient-to-t from-orange-500 via-yellow-400 to-transparent rounded-full ${gameState?.status === "crashed" ? "animate-flame-crash" : slowMotionActive ? "animate-flame-slow-motion" : "animate-flame"}`}
                        ></div>
                        <div
                          className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-t from-red-500 via-orange-400 to-transparent rounded-full ${gameState?.status === "crashed" ? "animate-flame-crash-slow" : slowMotionActive ? "animate-flame-slow-slow-motion" : "animate-flame-slow"}`}
                        ></div>
                      </div>
                    </div>

                    {/* Rocket glow effect */}
                    <div
                      className={`absolute w-full h-full rounded-full bg-cyan-500 ${gameState?.status === "crashed" ? "opacity-40 animate-pulse-fast" : slowMotionActive ? "opacity-30 animate-pulse-slow-motion" : "opacity-20 animate-pulse"}`}
                      style={{ filter: "blur(10px)" }}
                    ></div>

                    {/* Rocket image with fallback */}
                    {rocketLoaded ? (
                      <img
                        ref={rocketRef}
                        src={Rocket || "/placeholder.svg"}
                        alt="Rocket"
                        className="w-full h-full object-contain relative z-10"
                        style={{ transform: gameState?.status === "crashed" ? "rotate(15deg)" : "rotate(45deg)" }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center relative z-10">
                        <div className="w-16 h-16 border-t-4 border-cyan-500 border-solid rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rocket Pieces after explosion */}
              {rocketPieces.map((piece) => (
                <div
                  key={piece.id}
                  className="absolute bg-orange-500"
                  style={{
                    left: `${piece.x}px`,
                    top: `${piece.y}px`,
                    width: `${piece.size}px`,
                    height: `${piece.size}px`,
                    opacity: piece.opacity,
                    transform: `rotate(${piece.rotation}deg)`,
                    borderRadius: "2px",
                    zIndex: 30,
                    boxShadow: "0 0 8px rgba(255, 165, 0, 0.8)",
                  }}
                />
              ))}

              {/* Smoke particles that follow the plane */}
              {smokeParticles.map((particle) => (
                <div
                  key={`smoke-${particle.id}`}
                  className="absolute bg-gray-300 rounded-full"
                  style={{
                    left: `${particle.x}px`,
                    top: `${particle.y}px`,
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    opacity: particle.opacity * 0.6,
                    transform: "translate(-50%, -50%)",
                    filter: "blur(8px)",
                    zIndex: 15,
                  }}
                />
              ))}
            </div>

            {/* Enhanced Cinematic Crash Effects */}
            {explosionActive && (
              <>
                {/* Main explosion */}
                <motion.div
                  className="absolute"
                  style={{
                    top: `${rocketPosition.y}px`,
                    left: `${rocketPosition.x}px`,
                    zIndex: 40,
                  }}
                >
                  <motion.div
                    className="w-28 h-28 bg-gradient-to-r from-red-600 to-rose-500 rounded-full opacity-75"
                    animate={{ scale: [1, 3, 0.5], opacity: [1, 0.7, 0] }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ transformOrigin: "center center" }}
                  />

                  {/* Explosion particles */}
                  <motion.div
                    className="absolute w-40 h-40"
                    style={{ top: "-20px", left: "-20px" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.1 }}
                  >
                    {[...Array(36)].map((_, i) => (
                      <motion.div
                        key={i}
                        className={`absolute w-2 h-2 rounded-full ${
                          i % 3 === 0 ? "bg-yellow-400" : i % 3 === 1 ? "bg-orange-500" : "bg-red-600"
                        }`}
                        initial={{ x: 0, y: 0 }}
                        animate={{
                          x: Math.cos(i * 10 * (Math.PI / 180)) * (80 + Math.random() * 60),
                          y: Math.sin(i * 10 * (Math.PI / 180)) * (80 + Math.random() * 60),
                          opacity: [1, 0],
                          scale: [1, 0.5],
                        }}
                        transition={{ duration: 1 + Math.random() * 0.5, ease: "easeOut" }}
                      />
                    ))}
                  </motion.div>

                  {/* Sparks */}
                  <motion.div
                    className="absolute w-60 h-60"
                    style={{ top: "-30px", left: "-30px" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.1 }}
                  >
                    {[...Array(24)].map((_, i) => (
                      <motion.div
                        key={`spark-${i}`}
                        className="absolute w-1 h-3 bg-yellow-300"
                        style={{
                          transformOrigin: "center bottom",
                          boxShadow: "0 0 5px rgba(255, 255, 0, 0.8)",
                        }}
                        initial={{
                          x: 0,
                          y: 0,
                          rotate: i * 15,
                        }}
                        animate={{
                          x: Math.cos(i * 15 * (Math.PI / 180)) * (100 + Math.random() * 50),
                          y: Math.sin(i * 15 * (Math.PI / 180)) * (100 + Math.random() * 50),
                          opacity: [1, 0],
                          scale: [1, 0.2],
                        }}
                        transition={{
                          duration: 0.6 + Math.random() * 0.4,
                          ease: "easeOut",
                        }}
                      />
                    ))}
                  </motion.div>
                </motion.div>

                {/* Enhanced smoke trail effect that follows the plane */}
                <div className="absolute" style={{ zIndex: 35, pointerEvents: "none" }}>
                  {gameState?.status === "crashed" &&
                    [...Array(20)].map((_, i) => (
                      <motion.div
                        key={`smoke-trail-${i}`}
                        className="absolute bg-white rounded-full opacity-20"
                        initial={{
                          width: 15 + Math.random() * 30,
                          height: 15 + Math.random() * 30,
                          x: rocketPosition.x,
                          y: rocketPosition.y,
                          opacity: 0,
                        }}
                        animate={{
                          x: rocketPosition.x + crashDirection.x * (i * 20 + Math.random() * 30),
                          y: rocketPosition.y + crashDirection.y * (i * 20 + Math.random() * 30),
                          opacity: [0, 0.6, 0],
                          scale: [0.2, 2],
                        }}
                        transition={{
                          duration: 3,
                          delay: i * 0.1,
                          ease: "easeOut",
                        }}
                      />
                    ))}
                </div>

                {/* Shockwave effect */}
                <motion.div
                  className="absolute rounded-full border-2 border-cyan-400 z-30"
                  style={{
                    top: `${rocketPosition.y}px`,
                    left: `${rocketPosition.x}px`,
                    transformOrigin: "center center",
                    marginTop: "-50%",
                    marginLeft: "-50%",
                  }}
                  initial={{ width: 0, height: 0, opacity: 0.8 }}
                  animate={{
                    width: [0, 300],
                    height: [0, 300],
                    opacity: [0.8, 0],
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </>
            )}
          </div>

          {/* Bet Section */}
          <div className="w-full mt-2" style={{ height: "auto", minHeight: "200px" }}>
            <BetSection
              onPlaceBet={handlePlaceBet}
              onCashOut={handleCashOut}
              gameState={gameState?.status}
              countdown={countdown}
              multiplier={currentMultiplier}
              walletBalance={walletBalance}
              resetBet={false}
            />
          </div>
        </div>

        {/* Sidebar - Takes 1/3 of the space on larger screens */}
        <div className="lg:col-span-1 space-y-4">
          {/* Crash History */}
          <div className="bg-[#0a192f] rounded-lg border border-indigo-900 shadow-lg p-4">
            <h3 className="text-lg font-bold mb-2 text-cyan-300">Crash History</h3>
            <CrashHistory crashes={lastCrashes} />
          </div>

          {/* Players List */}
          <div className="bg-[#0a192f] rounded-lg border border-indigo-900 shadow-lg p-4">
            <h3 className="text-lg font-bold mb-2 text-cyan-300">Players</h3>
            <PlayersList activeBets={activeBets} cashedOut={cashedOut} />
          </div>
        </div>
      </div>

      {/* Add global styles for animations */}
      <style jsx global>{`
        @keyframes flame {
          0%, 100% { height: 8px; opacity: 0.8; }
          50% { height: 12px; opacity: 1; }
        }
        
        @keyframes flame-slow {
          0%, 100% { height: 6px; opacity: 0.6; }
          50% { height: 10px; opacity: 0.8; }
        }
        
        .animate-flame {
          animation: flame 0.5s ease-in-out infinite;
        }
        
        .animate-flame-slow {
          animation: flame-slow 0.7s ease-in-out infinite;
        }

        /* Slow motion animations */
        @keyframes flame-slow-motion {
          0%, 100% { height: 8px; opacity: 0.8; }
          50% { height: 12px; opacity: 1; }
        }
        
        @keyframes flame-slow-slow-motion {
          0%, 100% { height: 6px; opacity: 0.6; }
          50% { height: 10px; opacity: 0.8; }
        }
        
        .animate-flame-slow-motion {
          animation: flame 1.5s ease-in-out infinite;
        }
        
        .animate-flame-slow-slow-motion {
          animation: flame-slow 2s ease-in-out infinite;
        }

        @keyframes flame-crash {
          0% { height: 12px; opacity: 1; }
          100% { height: 20px; opacity: 0; }
        }

        @keyframes flame-crash-slow {
          0% { height: 10px; opacity: 0.8; }
          100% { height: 16px; opacity: 0; }
        }

        .animate-pulse-fast {
          animation: pulse 0.3s ease-in-out infinite;
        }

        .animate-pulse-slow-motion {
          animation: pulse 1.5s ease-in-out infinite;
        }

        /* Screen shake animation */
        @keyframes screen-shake {
          0%, 100% { transform: translate(0, 0); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-5px, 2px); }
          20%, 40%, 60%, 80% { transform: translate(5px, -2px); }
        }

        .animate-screen-shake {
          animation: screen-shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>

      {/* Hidden audio elements for sound effects */}
      <audio id="explosion-sound" src="/explosion.mp3" preload="auto" />
      <audio id="metal-crash-sound" src="/metal-crash.mp3" preload="auto" />
    </div>
  )
}

export default CrashGame

