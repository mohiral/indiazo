import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plane, Volume2, VolumeX, History, BarChart3 } from 'lucide-react'

const CrashGame = () => {
  const [multiplier, setMultiplier] = useState(1.0)
  const [crashed, setCrashed] = useState(false)
  const [isBetting, setIsBetting] = useState(true)
  const [isCashOutActive, setIsCashOutActive] = useState(false)
  const [betAmount, setBetAmount] = useState(10)
  const [balance, setBalance] = useState(1000)
  const [gameHistory, setGameHistory] = useState([]) // Removed TypeScript annotation
  const [showHistory, setShowHistory] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false) // Default to false to avoid audio errors
  const [autoCashout, setAutoCashout] = useState(2.0)
  const [winAmount, setWinAmount] = useState(0)
  // Add a new state for custom crash value
  const [customCrashValue, setCustomCrashValue] = useState(20.0)

  const canvasRef = useRef(null)
  const animationFrameRef = useRef(0)
  const lastPointRef = useRef({ x: 0, y: 400 })
  const crashPointRef = useRef(generateCrashPoint())

  // Audio refs without initial loading
  const audioRef = useRef(null)
  const cashoutAudioRef = useRef(null)
  const crashAudioRef = useRef(null)

  // Generate a random crash point with a house edge
  function generateCrashPoint() {
    if (customCrashValue > 1.0) {
      return customCrashValue
    }

    // Reduced house edge to 2%
    const houseEdge = 0.98
    const randomValue = Math.random()

    // Using a more balanced formula for crash point
    // This creates a more fair distribution with less frequent early crashes
    const crashPoint = Math.max(1.0, 1 / (1 - randomValue * houseEdge))

    // Limit maximum crash point to 100x for fairness
    return Math.min(crashPoint, 100)
  }

  // Safe audio play function
  const safePlayAudio = (audioElement) => {
    if (soundEnabled && audioElement) {
      audioElement.play().catch((error) => {
        // Silently handle audio play errors
        console.log("Audio play failed:", error)
      })
    }
  }

  // Initialize audio elements safely
  useEffect(() => {
    // Only try to create audio elements if sound is enabled
    if (soundEnabled) {
      try {
        // Create audio elements only when needed
        const tickAudio = new Audio()
        tickAudio.src =
          "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAkJCQkJCQkJCQkJCQkJCQwMDAwMDAwMDAwMDAwMDAwMD//////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAYAAAAAAAAAAbA2hVvkAAAAAAAD/+M4xAAUmtqgRUMQAIXhYRnVYYhkICAgICAgICAgQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBA"

        const cashoutAudio = new Audio()
        cashoutAudio.src =
          "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAkJCQkJCQkJCQkJCQkJCQwMDAwMDAwMDAwMDAwMDAwMD//////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAYAAAAAAAAAAbBEi2L8AAAAAAAD/+M4xAAdmtqgRUMQAKngRnGmGIhkICAgICAgICAgQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBA"

        const crashAudio = new Audio()
        crashAudio.src =
          "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAkJCQkJCQkJCQkJCQkJCQwMDAwMDAwMDAwMDAwMDAwMD//////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAYAAAAAAAAAAbCFi5LFAAAAAAAD/+M4xAAeCtqgRUMQAMXgRnVYYhkICAgICAgICAgQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBA"

        audioRef.current = tickAudio
        cashoutAudioRef.current = cashoutAudio
        crashAudioRef.current = crashAudio

        // Preload audio
        tickAudio.load()
        cashoutAudio.load()
        crashAudio.load()
      } catch (error) {
        console.log("Audio initialization failed:", error)
        // Disable sound if there's an error
        setSoundEnabled(false)
      }
    }

    return () => {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [soundEnabled])

  // Handle game reset
  const resetGame = () => {
    setMultiplier(1.0)
    setCrashed(false)
    setIsBetting(true)
    setIsCashOutActive(false)
    lastPointRef.current = { x: 0, y: 400 }
    crashPointRef.current = generateCrashPoint()
    setWinAmount(0)

    // Clear canvas
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }

  // Start the game
  const startGame = () => {
    if (betAmount > balance) return

    setBalance((prev) => prev - betAmount)
    setIsBetting(false)
    setIsCashOutActive(true)
    startAnimation()
  }

  // Cash out
  const handleCashOut = () => {
    if (!isCashOutActive) return

    const winnings = betAmount * Number.parseFloat(multiplier.toString())
    setBalance((prev) => prev + winnings)
    setIsCashOutActive(false)
    setWinAmount(winnings)

    safePlayAudio(cashoutAudioRef.current)
  }

  // Updated animation timing and multiplier calculation
  const startAnimation = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set up canvas
    ctx.lineWidth = 3
    ctx.strokeStyle = "#ff4757"
    ctx.beginPath()
    ctx.moveTo(0, 400)

    let currentMultiplier = 1.0
    const startTime = Date.now()
    const canvasWidth = canvas.width - 42 // Account for plane width (32px) + 10px margin
    const canvasHeight = canvas.height

    const animate = () => {
      // Calculate time elapsed in seconds
      const elapsed = (Date.now() - startTime) / 1000

      // Slower, more controlled multiplier growth
      currentMultiplier = 1.0 + elapsed * 0.5
      const formattedMultiplier = Number.parseFloat(currentMultiplier.toFixed(2))

      // Update state
      setMultiplier(formattedMultiplier)

      // Calculate base coordinates
      const baseX = elapsed * 100
      const maxX = canvasWidth - 10 // Leave 10px margin

      // Calculate x position with smooth deceleration near the edge
      let x = Math.min(baseX, maxX)

      // Calculate y position with smooth curve
      const progress = x / canvasWidth
      const baseY = 400 - Math.log(currentMultiplier) * 100

      // Add upward curve when near the right edge
      let y
      if (x < maxX * 0.8) {
        // Normal curve in the first 80% of the width
        y = baseY
      } else {
        // Enhanced upward curve in the last 20%
        const edgeProgress = (x - maxX * 0.8) / (maxX * 0.2)
        const curveIntensity = Math.pow(edgeProgress, 2) // Quadratic curve
        y = baseY - curveIntensity * 150 // Increase the multiplier for more curve
      }

      // Ensure y stays within bounds
      y = Math.max(30, Math.min(y, canvasHeight - 30))

      // Draw line with smoother curve
      ctx.lineTo(x, y)
      ctx.stroke()

      // Update last point
      lastPointRef.current = { x, y }

      // Play tick sound occasionally
      if (Math.floor(elapsed * 2) % 2 === 0) {
        safePlayAudio(audioRef.current)
      }

      // Check for auto cashout
      if (formattedMultiplier >= autoCashout && isCashOutActive) {
        handleCashOut()
      }

      // Check if crashed
      if (formattedMultiplier >= crashPointRef.current && !crashed) {
        setCrashed(true)
        setIsCashOutActive(false)
        setGameHistory((prev) => [Number.parseFloat(formattedMultiplier.toFixed(2)), ...prev].slice(0, 10))
        safePlayAudio(crashAudioRef.current)
        setTimeout(resetGame, 3000)
        return
      }

      if (!crashed) {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-950 flex flex-col items-center justify-center text-white p-4 relative">
      <div className="w-full max-w-3xl bg-yellow-500 text-black text-center p-2 rounded-t-lg font-bold text-lg flex justify-between items-center">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-full hover:bg-yellow-400 transition-colors"
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
        <span>CRASH GAME - FUN MODE</span>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="p-2 rounded-full hover:bg-yellow-400 transition-colors"
        >
          <History size={20} />
        </button>
      </div>

      <div className="w-full max-w-3xl bg-gray-900 p-4 rounded-b-lg flex flex-col items-center relative border border-gray-700 overflow-hidden">
        {/* Game history panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 right-4 bg-gray-800 p-3 rounded-lg z-10 border border-gray-700"
            >
              <h3 className="text-center font-bold mb-2 flex items-center justify-center">
                <BarChart3 className="mr-2" size={16} />
                Game History
              </h3>
              <div className="flex flex-wrap gap-2 max-w-[200px]">
                {gameHistory.map((point, index) => (
                  <div key={index} className={`text-sm px-2 py-1 rounded ${point < 2 ? "bg-red-500" : "bg-green-500"}`}>
                    {point.toFixed(2)}x
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Multiplier display */}
        <motion.div
          initial={{ scale: 1 }}
          animate={{
            scale: crashed ? [1, 1.5, 1] : [1, 1.05, 1],
            color: crashed ? "#ff4757" : "#ffffff",
          }}
          transition={{
            duration: crashed ? 0.8 : 0.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
          className="text-7xl font-bold mb-4 z-10"
        >
          {Number.parseFloat(multiplier.toString()).toFixed(2)}x
        </motion.div>

        {/* Win amount display */}
        <AnimatePresence>
          {winAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-2xl font-bold text-green-500 mb-4"
            >
              +{winAmount.toFixed(2)}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game canvas */}
        <div className="relative w-full h-[400px] border-l-2 border-b-2 border-gray-700 mb-4 overflow-hidden">
          <canvas ref={canvasRef} width={800} height={400} className="absolute top-0 left-0 w-full h-full" />

          {/* Plane with constrained movement */}
          <motion.div
            className="absolute z-10"
            animate={{
              x: Math.min(lastPointRef.current.x, canvasRef.current?.width - 42 || 0),
              y: lastPointRef.current.y,
              rotate: crashed ? 90 : Math.min(-10 - multiplier * 2, -45),
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              mass: 0.5,
            }}
          >
            <Plane
              size={32}
              className={`${crashed ? "text-red-500" : "text-yellow-400"} drop-shadow-glow`}
              fill={crashed ? "#ff4757" : "#ffc107"}
            />
          </motion.div>

          {/* Crash explosion */}
          {crashed && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.5, 0.8],
                opacity: [0, 0.8, 0],
              }}
              transition={{ duration: 1 }}
              style={{
                position: "absolute",
                left: Math.min(lastPointRef.current.x - 50, canvasRef.current?.width - 100 || 0),
                top: lastPointRef.current.y - 50,
                width: "100px",
                height: "100px",
              }}
              className="rounded-full bg-red-500 z-5"
            />
          )}
        </div>

        {/* Game controls */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Balance</div>
            <div className="text-xl font-bold">${balance.toFixed(2)}</div>

            {isBetting && (
              <>
                <div className="text-sm text-gray-400 mt-4 mb-1">Bet Amount</div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-gray-700 rounded p-2 text-white"
                    min="1"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2">
                  <button
                    onClick={() => setBetAmount((prev) => Math.max(1, Math.floor(prev / 2)))}
                    className="bg-gray-700 hover:bg-gray-600 rounded p-1 text-sm"
                  >
                    ½
                  </button>
                  <button
                    onClick={() => setBetAmount((prev) => Math.min(balance, prev * 2))}
                    className="bg-gray-700 hover:bg-gray-600 rounded p-1 text-sm"
                  >
                    2×
                  </button>
                  <button
                    onClick={() => setBetAmount(Math.max(1, balance))}
                    className="bg-gray-700 hover:bg-gray-600 rounded p-1 text-sm"
                  >
                    Max
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            {isBetting && (
              <>
                <div className="text-sm text-gray-400 mb-1">Auto Cashout At</div>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={autoCashout}
                    onChange={(e) => setAutoCashout(Math.max(1.1, Number(e.target.value)))}
                    className="w-full bg-gray-700 rounded p-2 text-white"
                    min="1.1"
                    step="0.1"
                  />
                  <span className="text-xl">×</span>
                </div>
                {/* Add custom crash value input here */}
                <div className="text-sm text-gray-400 mt-4 mb-1">Custom Crash At</div>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={customCrashValue}
                    onChange={(e) => setCustomCrashValue(Math.max(1.1, Number(e.target.value)))}
                    className="w-full bg-gray-700 rounded p-2 text-white"
                    min="1.1"
                    step="0.1"
                  />
                  <span className="text-xl">×</span>
                </div>

                <button
                  onClick={startGame}
                  disabled={betAmount > balance}
                  className={`w-full mt-4 py-3 rounded-lg text-lg font-bold transition-all ${
                    betAmount <= balance ? "bg-green-500 hover:bg-green-600" : "bg-gray-600 cursor-not-allowed"
                  }`}
                >
                  Place Bet
                </button>
              </>
            )}

            {!isBetting && (
              <button
                onClick={handleCashOut}
                disabled={!isCashOutActive || crashed}
                className={`w-full h-full py-3 rounded-lg text-xl font-bold transition-all ${
                  isCashOutActive && !crashed
                    ? "bg-green-500 hover:bg-green-600 animate-pulse"
                    : "bg-gray-600 cursor-not-allowed"
                }`}
              >
                {isCashOutActive
                  ? `Cash Out ${(betAmount * Number.parseFloat(multiplier.toString())).toFixed(2)}`
                  : "Cashed Out"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CrashGame
