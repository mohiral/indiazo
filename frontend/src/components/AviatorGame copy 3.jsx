"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Rocket from "../assets/Rocket.gif"
import BetSection from "./bet-section"

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

  // Preload rocket image
  useEffect(() => {
    const img = new Image()
    img.src = Rocket || "/placeholder.svg"
    img.onload = () => setRocketLoaded(true)
  }, [])

  // Game loop - runs continuously
  useEffect(() => {
    const gameLoop = () => {
      // Start countdown
      setGameState("waiting")
      setCrashed(false)
      setMultiplier(1.0)
      setPathProgress(0)

      let count = 5
      const countdownInterval = setInterval(() => {
        count--
        setCountdown(count)

        if (count <= 0) {
          clearInterval(countdownInterval)
          startGame()
        }
      }, 1000)
    }

    // Initial game start
    gameLoop()

    // Add a flag to track if component is mounted
    let isMounted = true
    return () => {
      isMounted = false
      // Clear any intervals when component unmounts
    }
  }, []) // Empty dependency array ensures this only runs once on mount

  // Handle active game state
  useEffect(() => {
    if (!gameActive) return

    const interval = setInterval(() => {
      setMultiplier((prev) => {
        // Calculate the growth rate needed to go from 1.0 to 2.0 in 10 seconds
        // With 100ms interval, that's 100 steps in 10 seconds
        // Using the formula: finalValue = initialValue * (1 + rate)^steps
        // 2.0 = 1.0 * (1 + rate)^100
        // Solving for rate: rate = (2.0)^(1/100) - 1 ≈ 0.00693
        const growthRate = 0.00993
        const newValue = Number.parseFloat((prev * (1 + growthRate)).toFixed(2))
        if (newValue >= customCrashValue) {
          handleCrash()
          return prev
        }
        return newValue
      })
    }, 100)

    // Animate path progress
    const startTime = Date.now()
    const duration = 3500 // 3.5 seconds in milliseconds
    let animationFrameId = null

    const animateProgress = () => {
      if (!gameActive) return
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      setPathProgress(progress)

      if (progress < 1 && gameActive) {
        animationFrameId = requestAnimationFrame(animateProgress)
      } else if (progress >= 1) {
        setRocketAtCorner(true)
      }
    }

    animationFrameId = requestAnimationFrame(animateProgress)

    return () => {
      clearInterval(interval)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [gameActive, customCrashValue])

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

  const startGame = () => {
    // Reset game state
    setMultiplier(1.0)
    setCrashed(false)
    setRocketAtCorner(false)
    setGameState("active")
    setGameActive(true)
    setPathProgress(0)
  }

  const handleCrash = () => {
    setCrashed(true)

    // Keep the rocket's current position when crash happens
    const rocketElement = document.querySelector(".rocket-element")
    if (rocketElement) {
      const rect = rocketElement.getBoundingClientRect()
      rocketElement.style.position = "absolute"
      rocketElement.style.left = `${rect.left}px`
      rocketElement.style.top = `${rect.top}px`
    }

    setGameState("crashed")
    setGameActive(false)

    // Handle lost bets - users who didn't cash out lose their bet
    setActiveBets((prevBets) => {
      // Process lost bets
      const lostBets = [...prevBets]
      setActiveBets([]) // Clear active bets
      return []
    })

    // Start countdown for next game after a short delay
    const restartTimer = setTimeout(() => {
      let count = 5
      setCountdown(count)
      setGameState("waiting") // Set game state to allow new bets

      const countdownInterval = setInterval(() => {
        count--
        setCountdown(count)

        if (count <= 0) {
          clearInterval(countdownInterval)
          startGame()
        }
      }, 1000)
    }, 1000) // Wait 1 second after crash before starting countdown

    // Store the timer reference so it can be cleared if needed
    return () => clearTimeout(restartTimer)
  }

  const handlePlaceBet = (amount, userId) => {
    if (gameState !== "waiting") return false

    // Add bet to active bets
    setActiveBets((prev) => [...prev, { userId, amount }])

    // Deduct amount from wallet
    setWalletBalance((prev) => prev - amount)

    return true // Bet was placed successfully
  }

  const handleCashOut = (userId, betAmount) => {
    if (gameState !== "active") return false

    // Find and remove the bet
    const betIndex = activeBets.findIndex((bet) => bet.userId === userId)
    if (betIndex === -1) return false

    // Calculate winnings
    const winnings = betAmount * multiplier

    // Add winnings to wallet
    setWalletBalance((prev) => prev + winnings)

    // Remove bet from active bets
    setActiveBets((prev) => prev.filter((_, index) => index !== betIndex))

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

  return (
    <div
      className=" max-w-3xl mx-auto bg-gradient-to-b from-black to-blue-900 flex flex-col items-center justify-center text-white p-2 sm:p-4 relative"
      onClick={(e) => e.stopPropagation()} // Prevent click propagation
    >
      {/* Navigation Bar */}
      <div className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center p-1 sm:p-2 rounded-t-lg font-bold text-sm sm:text-lg mb-1 shadow-lg">
        COSMIC CRASH
      </div>

      {/* Graph Container - Adjusted height to match the reference image */}
      <div
        className="w-full h-auto min-h-[250px] md:min-h-[300px]  bg-[#0a192f] p-2 sm:p-4 rounded-lg flex flex-col items-center relative border border-indigo-900 overflow-hidden shadow-[0_0_15px_rgba(66,153,225,0.5)]"
      >

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
        `}</style>

        {/* Custom Crash Value Input */}
        <div className="absolute top-2 right-4 z-10">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-cyan-300">Crash At:</span>
            <input
              type="number"
              value={customCrashValue}
              onChange={(e) => setCustomCrashValue(Math.max(1.0, Number.parseFloat(e.target.value) || 1.0))}
              className="bg-gray-800 text-white px-3 py-1 rounded border border-indigo-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none w-24 text-center"
              placeholder="Crash at..."
              min="1.0"
              step="0.1"
            />
          </div>
        </div>

        {/* Game Status Display */}
        <div className="absolute top-2 left-4 z-10">
          <span
            className={`px-3 py-1 rounded-full text-sm font-bold ${gameState === "waiting"
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
        <div className="relative w-full h-48 sm:h-64 mt-2">
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
            {gameActive && !crashed && <path d={calculatePartialFillPath()} fill="rgba(6, 182, 212, 0.1)" />}

            {/* The curve path */}
            {gameActive && !crashed && (
              <path d={calculatePartialPath()} stroke="url(#pathGradient)" strokeWidth="3" fill="none" />
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

          {/* Enhanced Rocket with Glow */}
          {gameActive && (
            <motion.div
              className="absolute w-16 h-16 sm:w-24 sm:h-24 rocket-element"
              animate={crashed ? { x: "100vw", y: 0, transition: { duration: 1, ease: "easeIn" } } : {}}
              style={{
                left: crashed ? undefined : pathProgress <= 0 ? 0 : undefined,
                top: crashed ? undefined : pathProgress <= 0 ? (window.innerWidth < 640 ? 160 : 240) : undefined,
                offsetPath: crashed
                  ? undefined
                  : `path('M 0 ${window.innerWidth < 640 ? 160 : 240} Q ${window.innerWidth < 640 ? 150 : 300} ${window.innerWidth < 640 ? 100 : 160} ${window.innerWidth < 640 ? 300 : 600} 0')`,
                offsetDistance: crashed ? undefined : `${pathProgress * 100}%`,
                offsetRotate: crashed ? 0 : "auto",
                filter: "drop-shadow(0 0 15px rgba(6,182,212,0.8))",
                zIndex: 20,
              }}
            >
              <div className="relative">
                {/* Rocket flame effect */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-12 z-0">
                  <div className="w-full h-full relative">
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-8 bg-gradient-to-t from-orange-500 via-yellow-400 to-transparent rounded-full animate-flame"></div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-t from-red-500 via-orange-400 to-transparent rounded-full animate-flame-slow"></div>
                  </div>
                </div>

                {/* Rocket glow effect */}
                <div
                  className="absolute w-full h-full rounded-full bg-cyan-500 opacity-20 animate-pulse"
                  style={{ filter: "blur(10px)" }}
                ></div>

                {/* Rocket image with fallback */}
                {rocketLoaded ? (
                  <img
                    ref={rocketRef}
                    src={Rocket || "/placeholder.svg"}
                    alt="Rocket"
                    className="w-full h-full object-contain relative z-10"
                    style={{ transform: "rotate(45deg)" }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center relative z-10">
                    <div className="w-16 h-16 border-t-4 border-cyan-500 border-solid rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Crash Effect */}
        {crashed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <motion.div
              className="w-28 h-28 bg-gradient-to-r from-red-600 to-rose-500 rounded-full opacity-75"
              animate={{ scale: [1, 1.7, 1], opacity: [1, 0.5, 0] }}
              transition={{ duration: 1, repeat: 3 }}
            />
            {/* Explosion particles */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-40 h-40 -translate-x-1/2 -translate-y-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  initial={{ x: 0, y: 0 }}
                  animate={{
                    x: Math.cos(i * 30 * (Math.PI / 180)) * 60,
                    y: Math.sin(i * 30 * (Math.PI / 180)) * 60,
                    opacity: [1, 0],
                  }}
                  transition={{ duration: 1 }}
                />
              ))}
            </motion.div>
          </motion.div>
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
          resetBet={false} // Changed from gameState === "waiting" to false to prevent automatic bet reset
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
      `}</style>
    </div>
  )
}

export default CrashGame

