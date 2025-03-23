"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { io } from "socket.io-client"
import Rocket from "../assets/Rocket.gif"
import BetSection from "./bet-section"

// Initialize socket connection
const socket = io("http://localhost:5001") // Change to your server URL in production

const CrashGame = () => {
  const [multiplier, setMultiplier] = useState(1.0)
  const [crashed, setCrashed] = useState(false)
  const [customCrashValue, setCustomCrashValue] = useState(200.0)
  const [dotPosition, setDotPosition] = useState(0)
  const [rocketAtCorner, setRocketAtCorner] = useState(false)
  const [gameActive, setGameActive] = useState(false)
  const [gameState, setGameState] = useState("waiting") // "waiting" | "active" | "crashed"
  const [countdown, setCountdown] = useState(5)
  const [walletBalance, setWalletBalance] = useState(1000) // Initialize wallet balance
  const [activeBets, setActiveBets] = useState([]) // Track active bets
  const [rocketLoaded, setRocketLoaded] = useState(false)
  const rocketRef = useRef(null)
  const [pathProgress, setPathProgress] = useState(0)
  const [slowMotionActive, setSlowMotionActive] = useState(false)
  const [rocketPosition, setRocketPosition] = useState({ x: 0, y: 0 })
  const [crashDirection, setCrashDirection] = useState({ x: 0, y: 0 })
  const [rocketPieces, setRocketPieces] = useState([])
  const [screenShake, setScreenShake] = useState(false)
  const [explosionActive, setExplosionActive] = useState(false)
  const explosionSoundRef = useRef(null)
  const crashSoundRef = useRef(null)
  const [smokeParticles, setSmokeParticles] = useState([])
  const [lastCrashes, setLastCrashes] = useState([])
  const [betConfirmed, setBetConfirmed] = useState(false)
  const [userBet, setUserBet] = useState(null)
  const [userId, setUserId] = useState(null)
  const [username, setUsername] = useState(null)

  // Get user info from localStorage on mount
  useEffect(() => {
    const userString = localStorage.getItem("user")
    if (userString) {
      const user = JSON.parse(userString)
      setUserId(user.userId)
      setUsername(user.name)

      // Authenticate with socket server
      socket.emit("authenticate", {
        userId: user.userId,
        username: user.name,
      })
    }
  }, [])

  // Socket connection and event listeners
  useEffect(() => {
    // Connection status
    socket.on("connect", () => {
      console.log("Connected to server:", socket.id)
    })

    socket.on("disconnect", () => {
      console.log("Disconnected from server")
    })

    // Game state updates
    socket.on("game_state", (state) => {
      console.log("Game state update:", state)
      setGameState(state.status)
      setActiveBets(state.activeBets || [])
    })

    socket.on("countdown", (count) => {
      setCountdown(count)
    })

    socket.on("game_started", () => {
      setGameState("active")
      setGameActive(true)
      setCrashed(false)
      setRocketAtCorner(false)
      setPathProgress(0)
      setSlowMotionActive(false)
      setRocketPieces([])
      setScreenShake(false)
      setExplosionActive(false)
      setSmokeParticles([])
    })

    socket.on("multiplier_update", (newMultiplier) => {
      setMultiplier(newMultiplier)

      // Calculate path progress based on multiplier - INCREASE SPEED HERE
      // Change from dividing by 20 to dividing by 5 for faster movement
      const estimatedProgress = Math.min((newMultiplier - 1) / 0.8, 1) // Reduced divisor from 1.5 to 0.8 for faster movement
      setPathProgress(estimatedProgress)

      // Update rocket position for crash animation
      const position = getRocketPosition(estimatedProgress)
      setRocketPosition(position)

      // Calculate direction for crash
      if (estimatedProgress > 0.1) {
        const prevPosition = getRocketPosition(estimatedProgress - 0.1)
        setCrashDirection({
          x: position.x - prevPosition.x,
          y: position.y - prevPosition.y,
        })
      }

      if (estimatedProgress >= 1) {
        setRocketAtCorner(true)
      }
    })

    socket.on("game_crashed", (crashPoint) => {
      console.log("Game crashed at:", crashPoint)
      handleCrash()

      // Update last crashes
      setLastCrashes((prev) => [crashPoint, ...prev].slice(0, 10))
    })

    socket.on("last_crashes", (crashes) => {
      console.log("Last crashes:", crashes)
      setLastCrashes(crashes)
    })

    // Bet handling
    socket.on("new_bet", (betInfo) => {
      console.log("New bet placed:", betInfo)
      // You might want to show this in a feed or notification
    })

    socket.on("bet_confirmed", (data) => {
      console.log("Bet confirmed:", data)
      setBetConfirmed(true)
      setUserBet({
        amount: activeBets.find((bet) => bet.userId === userId)?.amount || 0,
        status: "active",
      })
    })

    socket.on("bet_error", (error) => {
      console.error("Bet error:", error)
      alert(`Bet error: ${error.message}`)
    })

    // Cashout handling
    socket.on("player_cashed_out", (cashout) => {
      console.log("Player cashed out:", cashout)
      // You might want to show this in a feed or notification
    })

    socket.on("cashout_confirmed", (cashout) => {
      console.log("Your cashout confirmed:", cashout)
      setUserBet(null)
      setBetConfirmed(false)
      setWalletBalance((prev) => prev + cashout.amount + cashout.profit)
    })

    socket.on("cashout_error", (error) => {
      console.error("Cashout error:", error)
      alert(`Cashout error: ${error.message}`)
    })

    return () => {
      // Clean up event listeners
      socket.off("connect")
      socket.off("disconnect")
      socket.off("game_state")
      socket.off("countdown")
      socket.off("game_started")
      socket.off("multiplier_update")
      socket.off("game_crashed")
      socket.off("last_crashes")
      socket.off("new_bet")
      socket.off("bet_confirmed")
      socket.off("bet_error")
      socket.off("player_cashed_out")
      socket.off("cashout_confirmed")
      socket.off("cashout_error")
    }
  }, [userId])

  // Preload rocket image
  useEffect(() => {
    const img = new Image()
    img.src = Rocket || "/placeholder.svg"
    img.onload = () => setRocketLoaded(true)

    // Preload sounds with proper error handling
    try {
      explosionSoundRef.current = new Audio()
      crashSoundRef.current = new Audio()

      // Only set src after audio elements are created
      if (explosionSoundRef.current) explosionSoundRef.current.src = "/explosion.mp3"
      if (crashSoundRef.current) crashSoundRef.current.src = "/metal-crash.mp3"
    } catch (error) {
      console.log("Audio initialization error:", error)
    }

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

  // Handle rocket animation
  useEffect(() => {
    if (!rocketAtCorner || crashed) return
    const moveInterval = setInterval(() => {
      setDotPosition((prev) => (prev + 2) % 40)
    }, 150)
    return () => clearInterval(moveInterval)
  }, [rocketAtCorner, crashed])

  // Handle window resize for responsive paths
  useEffect(() => {
    const handleResize = () => {
      // Only update the path without restarting the game
      // Force a re-render when window size changes
      if (gameState === "active") {
        // Just update the path without restarting
        const currentGameState = gameState
        setGameActive(false)
        setTimeout(() => {
          if (currentGameState === "active") {
            setGameActive(true)
          }
        }, 100)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [gameState])

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

  // Enhanced crash function with immediate impact and effects
  const handleCrash = () => {
    // Play crash sounds with proper error handling
    if (explosionSoundRef.current) {
      explosionSoundRef.current.currentTime = 0
      const playPromise = explosionSoundRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch((e) => console.log("Audio play failed, this is normal in some browsers:", e))
      }
    }
    if (crashSoundRef.current) {
      crashSoundRef.current.currentTime = 0
      const playPromise = crashSoundRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch((e) => console.log("Audio play failed, this is normal in some browsers:", e))
      }
    }

    // Rest of the crash handling code remains the same...
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

    // Set crashed state immediately
    setCrashed(true)
    setGameState("crashed")
    setGameActive(false)

    // Reset bet state
    setUserBet(null)
    setBetConfirmed(false)
  }

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

  const handlePlaceBet = (amount, userId) => {
    if (gameState !== "waiting" || !userId) return false

    // Emit bet placement to server
    socket.emit("place_bet", { amount })

    return true // Bet was placed successfully
  }

  const handleCashOut = (userId, betAmount) => {
    if (gameState !== "active" || !userId) return false

    // Emit cashout to server
    socket.emit("cash_out")

    return true // Cash out successful
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
    const startY = isMobile ? 160 : 240 // Reduced from 180/270 to 160/240
    const controlX = isMobile ? 150 : 300
    const controlY = isMobile ? 100 : 160 // Reduced from 120/190 to 100/160
    const endX = isMobile ? 300 : 600
    const endY = 0

    // If progress is 0, return just the starting point
    if (pathProgress <= 0) {
      return `M 0 ${startY}`
    }

    // Calculate intermediate point on the quadratic curve
    // Using the formula for points on a quadratic Bezier curve:
    // B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
    // where P₀ is start point, P₁ is control point, P₂ is end point

    const t = pathProgress
    const x = (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * controlX + t * t * endX
    const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY

    return `M 0 ${startY} Q ${controlX * pathProgress} ${controlY + (startY - controlY) * (1 - pathProgress)} ${x} ${y}`
  }

  // Calculate the fill path for the current progress
  const calculatePartialFillPath = () => {
    const isMobile = window.innerWidth < 640
    const startY = isMobile ? 160 : 240 // Reduced from 180/270 to 160/240
    const controlX = isMobile ? 150 : 300
    const controlY = isMobile ? 100 : 160 // Reduced from 120/190 to 100/160
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

  return (
    <div
      className={`max-w-3xl mx-auto bg-gradient-to-b from-black to-blue-900 flex flex-col items-center justify-center text-white p-2 sm:p-4 relative ${screenShake ? "animate-screen-shake" : ""}`}
      onClick={(e) => e.stopPropagation()} // Prevent click propagation
    >
      {/* Navigation Bar */}
      <div className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center p-1 sm:p-2 rounded-t-lg font-bold text-sm sm:text-lg mb-1 shadow-lg">
        COSMIC CRASH
      </div>

      {/* Last Crashes Display */}
      <div className="w-full bg-gray-900/70 mb-2 p-2 rounded flex flex-wrap justify-center gap-2">
        <span className="text-cyan-300 text-sm">Recent Crashes:</span>
        {lastCrashes.map((crash, index) => (
          <span
            key={index}
            className={`text-sm font-semibold ${
              crash <= 1.2 ? "text-red-500" : crash <= 2 ? "text-orange-400" : "text-green-400"
            }`}
          >
            {crash.toFixed(2)}x{index < lastCrashes.length - 1 ? " • " : ""}
          </span>
        ))}
      </div>

      {/* Graph Container - Adjusted height to match the reference image */}
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

        <style jsx>{`
          /* Enhanced Stars */
          .stars-small, .stars-medium, .stars-large {
            position: absolute;
            width: 100%;
            height: 100%;
            background-repeat: repeat;
            pointer-events: none;
          }

          .stars-small {
            background-image: radial-gradient(1px 1px at 10px 10px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 20px 50px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 30px 30px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 40px 70px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 50px 90px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 60px 40px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 70px 30px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 80px 60px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 90px 10px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 100px 80px, #fff, rgba(0,0,0,0));
            background-size: 100px 100px;
            animation: twinkle 4s ease-in-out infinite;
          }

          .stars-medium {
            background-image: radial-gradient(1.5px 1.5px at 150px 150px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1.5px 1.5px at 200px 220px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1.5px 1.5px at 250px 180px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1.5px 1.5px at 300px 250px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1.5px 1.5px at 350px 200px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1.5px 1.5px at 400px 150px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1.5px 1.5px at 450px 220px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1.5px 1.5px at 500px 180px, #fff, rgba(0,0,0,0));
            background-size: 200px 200px;
            animation: twinkle 6s ease-in-out infinite;
            animation-delay: 1s;
          }

          .stars-large {
            background-image: radial-gradient(2px 2px at 120px 120px, #fff, rgba(0,0,0,0)),
                              radial-gradient(2px 2px at 170px 250px, #fff, rgba(0,0,0,0)),
                              radial-gradient(2px 2px at 220px 200px, #fff, rgba(0,0,0,0)),
                              radial-gradient(2px 2px at 270px 300px, #fff, rgba(0,0,0,0)),
                              radial-gradient(2px 2px at 320px 180px, #fff, rgba(0,0,0,0)),
                              radial-gradient(2.5px 2.5px at 370px 280px, #fff, rgba(0,0,0,0)),
                              radial-gradient(2.5px 2.5px at 420px 220px, #fff, rgba(0,0,0,0)),
                              radial-gradient(2.5px 2.5px at 470px 150px, #fff, rgba(0,0,0,0)),
                              radial-gradient(3px 3px at 520px 275px, #fff, rgba(0,0,0,0));
            background-size: 300px 300px;
            animation: twinkle 8s ease-in-out infinite;
            animation-delay: 2s;
          }

          /* Shooting stars */
          .shooting-stars {
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }

          .shooting-stars::before, .shooting-stars::after {
            content: "";
            position: absolute;
            width: 100px;
            height: 2px;
            background: linear-gradient(to right, rgba(0,0,0,0), rgba(255,255,255,0.8), rgba(0,0,0,0));
            border-radius: 50%;
            animation: shooting-star 6s linear infinite;
            top: 0;
            transform: rotate(45deg);
          }

          .shooting-stars::after {
            animation-delay: 3s;
            top: 30%;
            width: 80px;
          }

          @keyframes shooting-star {
            0% {
              transform: translateX(-100%) translateY(0) rotate(45deg);
              opacity: 1;
            }
            70% {
              opacity: 1;
            }
            100% {
              transform: translateX(200%) translateY(300%) rotate(45deg);
              opacity: 0;
            }
          }

          @keyframes twinkle {
            0% { opacity: 0.3; }
            50% { opacity: 1; }
            100% { opacity: 0.3; }
          }

          /* Enhanced Sun */
          .sun {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 50px;
            height: 50px;
            background: radial-gradient(circle, #fff 0%, #ffff00 20%, #ffa500 40%, #ff4500 100%);
            border-radius: 50%;
            box-shadow: 0 0 80px #ff4500, 0 0 30px #ff8c00;
            transform: translate(-50%, -50%);
            z-index: 10;
            animation: pulse 4s ease-in-out infinite;
          }

          @keyframes pulse {
            0% { box-shadow: 0 0 80px #ff4500, 0 0 30px #ff8c00; }
            50% { box-shadow: 0 0 100px #ff4500, 0 0 50px #ff8c00; }
            100% { box-shadow: 0 0 80px #ff4500, 0 0 30px #ff8c00; }
          }

          /* Enhanced Orbit Animations */
          @keyframes orbit {
            from { transform: rotate(0deg) translateX(var(--orbit-radius)) rotate(0deg); }
            to { transform: rotate(360deg) translateX(var(--orbit-radius)) rotate(-360deg); }
          }

          .mercury-orbit, .venus-orbit, .earth-orbit, .mars-orbit, .jupiter-orbit, .saturn-orbit {
            position: absolute;
            top: 50%;
            left: 50%;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            transform: translate(-50%, -50%);
          }

          .mercury255,255,0.1);
            border-radius: 50%;
            transform: translate(-50%, -50%);
          }

          .mercury-orbit {
            width: 90px;
            height: 90px;
            --orbit-radius: 45px;
          }

          .venus-orbit {
            width: 140px;
            height: 140px;
            --orbit-radius: 70px;
          }

          .earth-orbit {
            width: 190px;
            height: 190px;
            --orbit-radius: 95px;
          }

          .mars-orbit {
            width: 240px;
            height: 240px;
            --orbit-radius: 120px;
          }

          .jupiter-orbit {
            width: 290px;
            height: 290px;
            --orbit-radius: 145px;
          }

          .saturn-orbit {
            width: 340px;
            height: 340px;
            --orbit-radius: 170px;
          }

          /* Enhanced Planets */
          .mercury, .venus, .earth, .mars, .jupiter, .saturn {
            position: absolute;
            top: 50%;
            left: 0;
            transform: translate(-50%, -50%);
            border-radius: 50%;
          }

          .mercury {
            width: 8px;
            height: 8px;
            background: radial-gradient(circle, #e6e6e6, #bdc3c7);
            animation: orbit 5s linear infinite;
          }

          .venus {
            width: 12px;
            height: 12px;
            background: radial-gradient(circle, #ffd700, #e67e22);
            animation: orbit 8s linear infinite;
          }

          .earth {
            width: 14px;
            height: 14px;
            background: radial-gradient(circle, #3498db, #2980b9);
            animation: orbit 12s linear infinite;
          }

          .mars {
            width: 10px;
            height: 10px;
            background: radial-gradient(circle, #ff6b6b, #e74c3c);
            animation: orbit 15s linear infinite;
          }

          .jupiter {
            width: 22px;
            height: 22px;
            background: radial-gradient(circle, #f39c12, #d35400);
            animation: orbit 20s linear infinite;
          }

          .saturn {
            width: 18px;
            height: 18px;
            background: radial-gradient(circle, #f1c40f, #e67e22);
            animation: orbit 25s linear infinite;
          }

          /* Saturn Rings */
          .saturn-rings {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 36px;
            height: 8px;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 50%;
            transform: translate(-50%, -50%) rotate(30deg);
          }

          /* Planet Glows */
          .planet-glow {
            position: absolute;
            top: 50%;
            left: 50%;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            filter: blur(2px);
            opacity: 0.6;
          }

          .mercury-glow {
            width: 12px;
            height: 12px;
            background: rgba(189, 195, 199, 0.3);
          }

          .venus-glow {
            width: 18px;
            height: 18px;
            background: rgba(230, 126, 34, 0.3);
          }

          .earth-glow {
            width: 20px;
            height: 20px;
            background: rgba(52, 152, 219, 0.3);
          }

          .mars-glow {
            width: 16px;
            height: 16px;
            background: rgba(231, 76, 60, 0.3);
          }

          .jupiter-glow {
            width: 30px;
            height: 30px;
            background: rgba(211, 84, 0, 0.3);
          }

          .saturn-glow {
            width: 26px;
            height: 26px;
            background: rgba(241, 196, 15, 0.3);
          }

          /* Screen shake animation */
          @keyframes screen-shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }

          .animate-screen-shake {
            animation: screen-shake 0.8s cubic-bezier(.36,.07,.19,.97) both;
          }

          /* Enhanced crash inertia animation */
          @keyframes crash-inertia {
            0% { 
              transform: translate(0, 0) rotate(var(--crash-rotation)); 
              opacity: 1;
            }
            100% { 
              transform: translate(calc(var(--crash-direction-x) * 800%), calc(var(--crash-direction-y) * 800%)) rotate(calc(var(--crash-rotation) + 15deg));
              opacity: 0.2;
            }
          }

          .rocket-crash-inertia {
            --crash-direction-x: 1;
            --crash-direction-y: 0;
            --crash-rotation: 45deg;
            animation: crash-inertia 4s cubic-bezier(0.17, 0.67, 0.83, 0.67) forwards;
          }

          @keyframes smooth-fly {
            from { offset-distance: 0%; }
            to { offset-distance: 100%; }
          }

          .rocket-element {
            will-change: transform, offset-distance;
            transform: translateZ(0);
            backface-visibility: hidden;
            perspective: 1000px;
            transition: offset-distance 0.05s cubic-bezier(0.4, 0, 0.2, 1);
          }
        `}</style>

        {/* Game Status Display */}
        <div className="absolute top-2 left-4 z-10">
          <span
            className={`px-3 py-1 rounded-full text-sm font-bold ${
              gameState === "waiting"
                ? "bg-gradient-to-r from-yellow-600 to-amber-500 animate-pulse"
                : gameState === "active"
                  ? "bg-gradient-to-r from-green-600 to-emerald-500"
                  : "bg-gradient-to-r from-red-600 to-rose-500"
            }`}
          >
            {gameState === "waiting" ? "WAITING" : gameState === "active" ? "IN PROGRESS" : "CRASHED"}
          </span>
        </div>

        {/* Multiplier or Countdown Display - Adjusted height for smaller container */}
        <div className="z-10 mt-4 flex flex-col items-center h-[80px] justify-center">
          {gameState === "active" ? (
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.9, repeat: Number.POSITIVE_INFINITY }}
              className="text-4xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"
            >
              {multiplier.toFixed(2)}x
            </motion.div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="text-3xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
                {gameState === "crashed" ? "CRASHED" : "GETTING THE BETS"}
              </div>
              {gameState === "waiting" && (
                <div className="mb-2">
                  <input
                    type="number"
                    value={customCrashValue}
                    onChange={(e) => setCustomCrashValue(Number.parseFloat(e.target.value) || 1.0)}
                    className="bg-gray-800 text-white px-2 py-1 rounded border border-gray-700 w-24 text-center"
                    placeholder="Crash at"
                    min="1.01"
                    step="0.01"
                  />
                  <button
                    onClick={() => socket.emit("set_crash_point", { value: customCrashValue })}
                    className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm"
                  >
                    Set
                  </button>
                </div>
              )}
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
            {gameActive && !crashed && (
              <path
                d={calculatePartialFillPath()}
                fill="rgba(6, 182, 212, 0.1)"
                style={{ transition: "all 0.05s cubic-bezier(0.4, 0, 0.2, 1)" }}
              />
            )}

            {/* The curve path */}
            {gameActive && !crashed && (
              <path
                d={calculatePartialPath()}
                stroke="url(#pathGradient)"
                strokeWidth="3"
                fill="none"
                style={{ transition: "all 0.05s cubic-bezier(0.4, 0, 0.2, 1)" }}
              />
            )}

            {gameActive && !crashed && (
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
          {(gameActive || crashed) && !explosionActive && (
            <div
              className={`absolute w-16 h-16 sm:w-24 sm:h-24 rocket-element ${crashed ? "rocket-crash-inertia" : ""}`}
              style={{
                left: crashed ? `${rocketPosition.x}px` : undefined,
                top: crashed ? `${rocketPosition.y}px` : undefined,
                offsetPath: crashed
                  ? undefined
                  : `path('M 0 ${window.innerWidth < 640 ? 160 : 240} Q ${window.innerWidth < 640 ? 150 : 300} ${window.innerWidth < 640 ? 100 : 160} ${window.innerWidth < 640 ? 300 : 600} 0')`,
                offsetDistance: crashed ? undefined : `${pathProgress * 100}%`,
                offsetRotate: crashed ? 0 : "auto",
                filter: "drop-shadow(0 0 15px rgba(6,182,212,0.8))",
                zIndex: 20,
                transition: crashed ? "none" : "offset-distance 0.05s cubic-bezier(0.4, 0, 0.2, 1)",
                transformOrigin: "center center",
                "--crash-direction-x": crashed ? crashDirection.x : 1,
                "--crash-direction-y": crashed ? crashDirection.y : 0,
                "--crash-rotation": crashed
                  ? `${Math.atan2(crashDirection.y, crashDirection.x) * (180 / Math.PI)}deg`
                  : "45deg",
              }}
            >
              <div className="relative">
                {/* Rocket flame effect */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-12 z-0">
                  <div className="w-full h-full relative">
                    <div
                      className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-8 bg-gradient-to-t from-orange-500 via-yellow-400 to-transparent rounded-full ${crashed ? "animate-flame-crash" : slowMotionActive ? "animate-flame-slow-motion" : "animate-flame"}`}
                    ></div>
                    <div
                      className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-t from-red-500 via-orange-400 to-transparent rounded-full ${crashed ? "animate-flame-crash-slow" : slowMotionActive ? "animate-flame-slow-slow-motion" : "animate-flame-slow"}`}
                    ></div>
                  </div>
                </div>

                {/* Rocket glow effect */}
                <div
                  className={`absolute w-full h-full rounded-full bg-cyan-500 ${crashed ? "opacity-40 animate-pulse-fast" : slowMotionActive ? "opacity-30 animate-pulse-slow-motion" : "opacity-20 animate-pulse"}`}
                  style={{ filter: "blur(10px)" }}
                ></div>

                {/* Rocket image with fallback */}
                {rocketLoaded ? (
                  <img
                    ref={rocketRef}
                    src={Rocket || "/placeholder.svg"}
                    alt="Rocket"
                    className="w-full h-full object-contain relative z-10"
                    style={{ transform: crashed ? "rotate(15deg)" : "rotate(45deg)" }}
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
            </motion.div>
          </>
        )}
      </div>

      {/* Bet Section - Fixed height container */}
      <div className="w-full mt-2" style={{ height: "auto", minHeight: "200px" }}>
        <BetSection
          onPlaceBet={handlePlaceBet}
          onCashOut={handleCashOut}
          gameState={gameState}
          countdown={countdown}
          multiplier={multiplier}
          walletBalance={walletBalance}
          resetBet={false}
          userId={userId}
          betConfirmed={betConfirmed}
          userBet={userBet}
        />
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

        @keyframes smooth-fly {
          from { offset-distance: 0%; }
          to { offset-distance: 100%; }
        }

        .rocket-element {
          will-change: transform, offset-distance;
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
          transition: offset-distance 0.05s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      {/* Hidden audio elements for sound effects */}
      <audio id="explosion-sound" src="/explosion.mp3" preload="auto" />
      <audio id="metal-crash-sound" src="/metal-crash.mp3" preload="auto" />
    </div>
  )
}

export default CrashGame

