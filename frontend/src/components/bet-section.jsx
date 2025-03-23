"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"

export default function BetSection({
  onPlaceBet,
  onCashOut,
  gameState,
  countdown,
  multiplier,
  walletBalance,
  resetBet,
  gameId,
}) {
  const [activeTab, setActiveTab] = useState("bet")
  const [betAmount, setBetAmount] = useState(10.0)
  const [autoBetAmount, setAutoBetAmount] = useState(10.0)
  const [autoTargetMultiplier, setAutoTargetMultiplier] = useState(2.0)
  const [autoEnabled, setAutoEnabled] = useState(false)
  const [showLoginAlert, setShowLoginAlert] = useState(false)
  const [showFundAlert, setShowFundAlert] = useState(false)
  const [confirmedBalance, setConfirmedBalance] = useState(0)
  const [isPlacingBet, setIsPlacingBet] = useState(false)
  const [hasBet, setHasBet] = useState(false)
  const [potentialWinnings, setPotentialWinnings] = useState(0)
  const [autoCashoutEnabled, setAutoCashoutEnabled] = useState(true)
  const [autoStopAfter, setAutoStopAfter] = useState(5)
  const [autoStopLoss, setAutoStopLoss] = useState(100)
  const [autoStopProfit, setAutoStopProfit] = useState(100)
  const [autoBetsPlaced, setAutoBetsPlaced] = useState(0)
  const [totalProfit, setTotalProfit] = useState(0)
  const [autoHistory, setAutoHistory] = useState([])
  const navigate = useNavigate()
  const hasAutoPlacedBet = useRef(false)
  const [errorMessage, setErrorMessage] = useState("")
  const currentGameId = useRef(gameId)

  const presetAmounts = [100.0, 200.0, 500.0, 1000.0]
  const presetMultipliers = [1.5, 2.0, 5.0, 10.0]

  // Update current gameId when it changes
  useEffect(() => {
    if (gameId) {
      console.log("Game ID updated:", gameId)
      currentGameId.current = gameId
    }
  }, [gameId])

  useEffect(() => {
    const fetchWalletBalances = async () => {
      const user = JSON.parse(localStorage.getItem("user"))
      if (!user || !user.userId) return

      try {
        const response = await fetch(`https://backend.indiazo.com/api/wallet-balance/${user.userId}`)
        const data = await response.json()

        const confirmed = data.payments
          .filter((payment) => payment.status === "confirmed")
          .reduce((sum, payment) => sum + payment.amount, 0)

        setConfirmedBalance(confirmed)
      } catch (error) {
        console.error("Error fetching wallet balances:", error)
        showError("Failed to fetch wallet balance")
      }
    }

    fetchWalletBalances()
  }, [])

  // Calculate potential winnings when multiplier changes
  useEffect(() => {
    if (hasBet && multiplier) {
      setPotentialWinnings(betAmount * multiplier)
    }
  }, [multiplier, betAmount, hasBet])

  // Auto-bet logic
  useEffect(() => {
    // Only proceed if auto betting is enabled and we're in the waiting state
    if (autoEnabled && gameState === "waiting" && !hasBet && !hasAutoPlacedBet.current) {
      // Check if we should stop based on number of bets
      if (autoBetsPlaced >= autoStopAfter) {
        setAutoEnabled(false)
        return
      }

      // Check if we should stop based on profit/loss
      if (totalProfit <= -autoStopLoss || totalProfit >= autoStopProfit) {
        setAutoEnabled(false)
        return
      }

      // Place the bet automatically when countdown is at 1 second
      if (countdown <= 1) {
        handleAutoPlaceBet()
      }
    }
  }, [
    gameState,
    countdown,
    autoEnabled,
    hasBet,
    autoBetsPlaced,
    autoStopAfter,
    totalProfit,
    autoStopLoss,
    autoStopProfit,
  ])

  // Auto-cashout logic
  useEffect(() => {
    if (hasBet && gameState === "active" && autoCashoutEnabled && hasAutoPlacedBet.current) {
      // If we reach the target multiplier, cash out
      if (multiplier >= autoTargetMultiplier) {
        handleCashOut()
      }
    }
  }, [multiplier, hasBet, gameState, autoCashoutEnabled, autoTargetMultiplier])

  // Reset bet when game crashes if user didn't cash out
  useEffect(() => {
    if (gameState === "crashed" && hasBet) {
      // User lost their bet
      setHasBet(false)

      // Log the gameId when the game crashes
      console.log("Game crashed with gameId:", currentGameId.current)

      // If this was an auto bet, record it
      if (hasAutoPlacedBet.current) {
        // Update auto betting stats
        setAutoBetsPlaced((prev) => prev + 1)
        setTotalProfit((prev) => prev - (hasAutoPlacedBet.current ? autoBetAmount : betAmount))

        // Add to history
        setAutoHistory((prev) => [
          {
            amount: autoBetAmount,
            result: "loss",
            multiplier: 0,
            profit: -autoBetAmount,
          },
          ...prev.slice(0, 9), // Keep only the last 10 entries
        ])

        hasAutoPlacedBet.current = false
      }

      // Record the loss in MongoDB
      const user = localStorage.getItem("user")
      if (user) {
        const userId = JSON.parse(user).userId
        updateGameBalance(userId, confirmedBalance, "loss", betAmount, 0, currentGameId.current)
      }
    }
  }, [gameState, hasBet, betAmount, confirmedBalance, autoBetAmount])

  useEffect(() => {
    if (resetBet) {
      setHasBet(false)
      setPotentialWinnings(0)
      hasAutoPlacedBet.current = false
    }
  }, [resetBet])

  const handleIncreaseBet = () => {
    if (!hasBet) {
      setBetAmount((prev) => Number.parseFloat((prev + 10).toFixed(2)))
    }
  }

  const handleDecreaseBet = () => {
    if (!hasBet) {
      setBetAmount((prev) => Number.parseFloat(Math.max(10, prev - 10).toFixed(2)))
    }
  }

  const handleIncreaseAutoBet = () => {
    setAutoBetAmount((prev) => Number.parseFloat((prev + 10).toFixed(2)))
  }

  const handleDecreaseAutoBet = () => {
    setAutoBetAmount((prev) => Number.parseFloat(Math.max(10, prev - 10).toFixed(2)))
  }

  const handleIncreaseMultiplier = () => {
    setAutoTargetMultiplier((prev) => Number.parseFloat((prev + 0.5).toFixed(2)))
  }

  const handleDecreaseMultiplier = () => {
    setAutoTargetMultiplier((prev) => Number.parseFloat(Math.max(1.1, prev - 0.5).toFixed(2)))
  }

  const updateGameBalance = async (userId, newBalance, gameResult, betAmount, winAmount, gameId) => {
    try {
      console.log("Updating game balance with gameId:", gameId)

      // Make sure gameId is defined before sending
      const payload = {
        userId,
        newBalance,
        gameResult,
        betAmount,
        winAmount,
        gameId: gameId || "unknown", // Provide a default if gameId is undefined
      }

      console.log("Sending payload to server:", payload)

      const response = await fetch("https://backend.indiazo.com/api/update-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      console.log("Server response:", data)

      if (data.message) {
        showMessage(data.message)
      }

      return data
    } catch (error) {
      console.error("Error updating game balance:", error)
      showError("Failed to update balance")
      return null
    }
  }

  const handlePlaceBet = async () => {
    if (isPlacingBet || gameState === "active") return
    setIsPlacingBet(true)
    clearMessage()

    const user = localStorage.getItem("user")
    if (!user) {
      setShowLoginAlert(true)
      setIsPlacingBet(false)
      return
    }
    if (confirmedBalance < betAmount) {
      setShowFundAlert(true)
      setIsPlacingBet(false)
      return
    }
    try {
      const userId = JSON.parse(user).userId
      const result = await onPlaceBet(betAmount, userId)

      // Check if the result contains an error message
      if (!result || result.error || result.message === "Failed to place bet") {
        showError(result?.message || "Failed to place bet")
        setIsPlacingBet(false)
        return
      }

      // Only proceed if bet was successful
      // Immediately deduct the bet amount from the wallet
      const newBalance = confirmedBalance - betAmount
      setConfirmedBalance(newBalance)
      setHasBet(true)
      hasAutoPlacedBet.current = false

      // Record the bet placement in the database
      await updateGameBalance(userId, newBalance, "bet_placed", betAmount, 0, currentGameId.current)
      showMessage("Bet placed successfully")
    } catch (error) {
      console.error("Error placing bet:", error)
      showError("Error placing bet")
    } finally {
      setIsPlacingBet(false)
    }
  }

  const handleAutoPlaceBet = async () => {
    if (isPlacingBet || gameState === "active" || hasBet) return
    setIsPlacingBet(true)
    clearMessage()

    const user = localStorage.getItem("user")
    if (!user) {
      setShowLoginAlert(true)
      setIsPlacingBet(false)
      return
    }
    if (confirmedBalance < autoBetAmount) {
      setShowFundAlert(true)
      setIsPlacingBet(false)
      return
    }
    try {
      const userId = JSON.parse(user).userId
      const result = await onPlaceBet(autoBetAmount, userId)

      // Check if the result contains an error message
      if (!result || result.error || result.message === "Failed to place bet") {
        showError(result?.message || "Failed to place auto bet")
        setIsPlacingBet(false)
        return
      }

      // Only proceed if bet was successful
      // Immediately deduct the bet amount from the wallet
      const newBalance = confirmedBalance - autoBetAmount
      setConfirmedBalance(newBalance)
      setHasBet(true)
      hasAutoPlacedBet.current = true

      // Record the bet placement in the database
      await updateGameBalance(userId, newBalance, "bet_placed", autoBetAmount, 0, currentGameId.current)
      showMessage("Auto bet placed successfully")
    } catch (error) {
      console.error("Error placing auto bet:", error)
      showError("Error placing auto bet")
    } finally {
      setIsPlacingBet(false)
    }
  }

  const handleCancelBet = async () => {
    if (gameState === "active" || !hasBet) return
    clearMessage()

    const user = localStorage.getItem("user")
    if (!user) return

    try {
      // Return the bet amount to the user's balance
      const betToReturn = hasAutoPlacedBet.current ? autoBetAmount : betAmount
      const newBalance = confirmedBalance + betToReturn
      setConfirmedBalance(newBalance)
      setHasBet(false)
      hasAutoPlacedBet.current = false

      const userId = JSON.parse(user).userId
      await updateGameBalance(userId, newBalance, "bet_canceled", betToReturn, 0, currentGameId.current)
      showMessage("Bet canceled successfully")
    } catch (error) {
      console.error("Error cancelling bet:", error)
      showError("Failed to cancel bet")
    }
  }

  const handleCashOut = async () => {
    if (gameState !== "active" || !hasBet) return
    clearMessage()

    const user = localStorage.getItem("user")
    if (!user) return

    try {
      const userId = JSON.parse(user).userId
      const currentBetAmount = hasAutoPlacedBet.current ? autoBetAmount : betAmount

      console.log("Cash out with gameId:", currentGameId.current)

      const result = await onCashOut(userId, currentBetAmount)

      // Check if the result contains an error message
      if (!result || result.error || result.message === "No active bet found") {
        showError(result?.message || "Failed to cash out")
        return
      }

      // Only proceed if cashout was successful
      // Calculate winnings based on current multiplier
      const totalWinAmount = currentBetAmount * multiplier
      // Calculate only the profit (winnings minus the original bet)
      const profit = totalWinAmount - currentBetAmount

      // Add only the profit to the wallet (since bet amount was already deducted)
      const newBalance = confirmedBalance + profit
      setConfirmedBalance(newBalance)
      setHasBet(false)

      // If this was an auto bet, update stats
      if (hasAutoPlacedBet.current) {
        setAutoBetsPlaced((prev) => prev + 1)
        setTotalProfit((prev) => prev + profit)

        // Add to history
        setAutoHistory((prev) => [
          {
            amount: autoBetAmount,
            result: "win",
            multiplier: multiplier,
            profit: profit,
          },
          ...prev.slice(0, 9), // Keep only the last 10 entries
        ])

        hasAutoPlacedBet.current = false
      }

      // Record the win in MongoDB - pass the profit amount, not the total win amount
      await updateGameBalance(userId, newBalance, "win", currentBetAmount, profit, currentGameId.current)
      showMessage(`Cashed out with ${multiplier.toFixed(2)}x multiplier!`)
    } catch (error) {
      console.error("Error cashing out:", error)
      showError("Error cashing out")
    }
  }

  const handleLogin = () => {
    navigate("/LoginPage")
  }

  const handleAddFund = () => {
    navigate("/payment-qr")
  }

  const toggleAutoEnabled = () => {
    setAutoEnabled((prev) => !prev)
    // Reset auto betting stats when toggling off
    if (autoEnabled) {
      setAutoBetsPlaced(0)
      setTotalProfit(0)
      setAutoHistory([])
    }
  }

  const showError = (message) => {
    setErrorMessage({ type: "error", text: message })
    setTimeout(() => setErrorMessage(""), 3000)
  }

  const showMessage = (message) => {
    setErrorMessage({ type: "success", text: message })
    setTimeout(() => setErrorMessage(""), 3000)
  }

  const clearMessage = () => {
    setErrorMessage("")
  }

  return (
    <div className="w-full max-w-3xl bg-[#1a1a1a] rounded-lg p-2 mb-16">
      {/* Top Section: Balance and Tabs in one row */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-white text-sm">₹ {confirmedBalance.toFixed(2)}</div>
        <div className="flex">
          <button
            className={`px-3 py-1 text-sm rounded-l-lg transition-colors ${
              activeTab === "bet" ? "bg-[#2a2a2a] text-white" : "bg-[#1a1a1a] text-gray-400"
            }`}
            onClick={() => setActiveTab("bet")}
          >
            Bet
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-r-lg transition-colors ${
              activeTab === "auto" ? "bg-[#2a2a2a] text-white" : "bg-[#1a1a1a] text-gray-400"
            }`}
            onClick={() => setActiveTab("auto")}
          >
            Auto
          </button>
        </div>
      </div>

      {/* Error/Success Message */}
      {errorMessage && (
        <div
          className={`mb-2 px-2 py-1 rounded text-xs text-white ${
            errorMessage.type === "error" ? "bg-red-500/80" : "bg-green-500/80"
          }`}
        >
          {errorMessage.text}
        </div>
      )}

      {/* Alerts - Only show if needed */}
      {(showLoginAlert || showFundAlert) && (
        <div className="mb-2">
          {showLoginAlert && (
            <div className="bg-red-500/80 text-white px-2 py-1 rounded text-xs flex justify-between items-center">
              <span>Please login</span>
              <button className="bg-white/20 px-2 py-0.5 rounded" onClick={handleLogin}>
                Login
              </button>
            </div>
          )}
          {showFundAlert && (
            <div className="bg-red-500/80 text-white px-2 py-1 rounded text-xs flex justify-between items-center">
              <span>Low balance</span>
              <button className="bg-white/20 px-2 py-0.5 rounded" onClick={handleAddFund}>
                Add
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manual Betting Interface */}
      {activeTab === "bet" && (
        <div className="flex gap-2">
          {/* Left Column: Amount Display and Controls */}
          <div className="flex-1">
            {!hasBet ? (
              <div className="space-y-1">
                {/* Amount Display and +/- Controls */}
                <div className="flex items-center gap-1">
                  <div className="flex-1 bg-[#111111] rounded px-2 py-1">
                    <div className="text-white text-lg font-bold">₹ {betAmount.toFixed(2)}</div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="w-8 h-8 bg-[#111111] rounded-full text-white flex items-center justify-center"
                      onClick={handleDecreaseBet}
                      disabled={gameState === "active"}
                    >
                      -
                    </button>
                    <button
                      className="w-8 h-8 bg-[#111111] rounded-full text-white flex items-center justify-center"
                      onClick={handleIncreaseBet}
                      disabled={gameState === "active"}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Preset Amounts */}
                <div className="grid grid-cols-4 gap-1">
                  {presetAmounts.map((amount) => (
                    <button
                      key={amount}
                      className={`bg-[#111111] text-gray-300 py-1 text-xs rounded ${
                        gameState === "active" ? "opacity-50 cursor-not-allowed" : "hover:bg-[#2a2a2a]"
                      }`}
                      onClick={() => gameState !== "active" && setBetAmount(amount)}
                      disabled={gameState === "active"}
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-[#111111] rounded p-2">
                {gameState === "active" ? (
                  <div>
                    <div className="text-xs text-gray-400">Potential Win</div>
                    <div className="text-lg font-bold text-green-500">₹ {potentialWinnings.toFixed(2)}</div>
                  </div>
                ) : (
                  <div className="text-lg font-bold text-white">₹ {betAmount.toFixed(2)}</div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Action Button */}
          <div className="w-1/3">
            {!hasBet && (gameState === "waiting" || gameState === "crashed") ? (
              <button
                className={`w-full h-full rounded bg-green-500 hover:bg-green-600 transition-colors text-white font-bold text-sm ${
                  isPlacingBet ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handlePlaceBet}
                disabled={isPlacingBet || gameState === "active"}
              >
                {isPlacingBet ? "..." : "BET"}
              </button>
            ) : hasBet && gameState === "waiting" ? (
              <button
                className="w-full h-full rounded bg-red-500 hover:bg-red-600 transition-colors text-white font-bold text-sm"
                onClick={handleCancelBet}
              >
                CANCEL
              </button>
            ) : hasBet && gameState === "active" ? (
              <button
                className="w-full h-full rounded bg-yellow-500 hover:bg-yellow-600 transition-colors text-black font-bold text-sm animate-pulse"
                onClick={handleCashOut}
              >
                CASH OUT
              </button>
            ) : (
              <button
                className="w-full h-full rounded bg-gray-600 text-white font-bold text-sm opacity-50 cursor-not-allowed"
                disabled
              >
                WAIT
              </button>
            )}
          </div>
        </div>
      )}

      {/* Auto Betting Interface */}
      {activeTab === "auto" && (
        <div className="space-y-2">
          {/* Auto Bet Controls */}
          <div className="grid grid-cols-2 gap-2">
            {/* Left Column: Amount */}
            <div className="space-y-1">
              <div className="text-xs text-gray-400">Bet Amount</div>
              <div className="flex items-center gap-1">
                <div className="flex-1 bg-[#111111] rounded px-2 py-1">
                  <div className="text-white text-sm font-bold">₹ {autoBetAmount.toFixed(2)}</div>
                </div>
                <div className="flex gap-1">
                  <button
                    className="w-6 h-6 bg-[#111111] rounded-full text-white flex items-center justify-center text-xs"
                    onClick={handleDecreaseAutoBet}
                    disabled={autoEnabled}
                  >
                    -
                  </button>
                  <button
                    className="w-6 h-6 bg-[#111111] rounded-full text-white flex items-center justify-center text-xs"
                    onClick={handleIncreaseAutoBet}
                    disabled={autoEnabled}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Target Multiplier */}
            <div className="space-y-1">
              <div className="text-xs text-gray-400">Auto Cashout At</div>
              <div className="flex items-center gap-1">
                <div className="flex-1 bg-[#111111] rounded px-2 py-1">
                  <div className="text-white text-sm font-bold">{autoTargetMultiplier.toFixed(2)}x</div>
                </div>
                <div className="flex gap-1">
                  <button
                    className="w-6 h-6 bg-[#111111] rounded-full text-white flex items-center justify-center text-xs"
                    onClick={handleDecreaseMultiplier}
                    disabled={autoEnabled}
                  >
                    -
                  </button>
                  <button
                    className="w-6 h-6 bg-[#111111] rounded-full text-white flex items-center justify-center text-xs"
                    onClick={handleIncreaseMultiplier}
                    disabled={autoEnabled}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preset Multipliers */}
          <div className="grid grid-cols-4 gap-1">
            {presetMultipliers.map((mult) => (
              <button
                key={mult}
                className={`bg-[#111111] text-gray-300 py-1 text-xs rounded ${
                  autoEnabled ? "opacity-50 cursor-not-allowed" : "hover:bg-[#2a2a2a]"
                }`}
                onClick={() => !autoEnabled && setAutoTargetMultiplier(mult)}
                disabled={autoEnabled}
              >
                {mult.toFixed(1)}x
              </button>
            ))}
          </div>

          {/* Auto Cashout Toggle */}
          <div className="flex items-center justify-between bg-[#111111] rounded p-2">
            <span className="text-xs text-gray-300">Auto Cashout</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={autoCashoutEnabled}
                onChange={() => setAutoCashoutEnabled(!autoCashoutEnabled)}
                disabled={autoEnabled}
              />
              <div
                className={`w-9 h-5 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600 ${autoEnabled ? "opacity-50" : ""}`}
              ></div>
            </label>
          </div>

          {/* Stop Conditions */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <div className="text-xs text-gray-400">Stop After</div>
              <input
                type="number"
                className="w-full bg-[#111111] text-white text-xs rounded px-2 py-1"
                value={autoStopAfter}
                onChange={(e) => setAutoStopAfter(Math.max(1, Number.parseInt(e.target.value) || 1))}
                disabled={autoEnabled}
                min="1"
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-gray-400">Stop Loss</div>
              <input
                type="number"
                className="w-full bg-[#111111] text-white text-xs rounded px-2 py-1"
                value={autoStopLoss}
                onChange={(e) => setAutoStopLoss(Math.max(0, Number.parseInt(e.target.value) || 0))}
                disabled={autoEnabled}
                min="0"
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-gray-400">Stop Profit</div>
              <input
                type="number"
                className="w-full bg-[#111111] text-white text-xs rounded px-2 py-1"
                value={autoStopProfit}
                onChange={(e) => setAutoStopProfit(Math.max(0, Number.parseInt(e.target.value) || 0))}
                disabled={autoEnabled}
                min="0"
              />
            </div>
          </div>

          {/* Auto Bet Stats */}
          <div className="grid grid-cols-3 gap-2 bg-[#111111] rounded p-2">
            <div>
              <div className="text-xs text-gray-400">Bets</div>
              <div className="text-sm text-white">{autoBetsPlaced}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Profit</div>
              <div className={`text-sm ${totalProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                ₹ {totalProfit.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Status</div>
              <div className={`text-sm ${autoEnabled ? "text-green-500" : "text-gray-300"}`}>
                {autoEnabled ? "Running" : "Stopped"}
              </div>
            </div>
          </div>

          {/* Start/Stop Button */}
          <button
            className={`w-full py-2 rounded font-bold text-sm ${
              autoEnabled ? "bg-red-500 hover:bg-red-600 text-white" : "bg-green-500 hover:bg-green-600 text-white"
            } transition-colors`}
            onClick={toggleAutoEnabled}
            disabled={hasBet && !hasAutoPlacedBet.current}
          >
            {autoEnabled ? "STOP AUTO" : "START AUTO"}
          </button>

          {/* Auto Bet History */}
          {autoHistory.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-gray-400 mb-1">Recent Bets</div>
              <div className="bg-[#111111] rounded p-2 max-h-24 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-400">
                      <th className="text-left">Amount</th>
                      <th className="text-left">Multiplier</th>
                      <th className="text-right">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {autoHistory.map((bet, index) => (
                      <tr key={index} className="border-t border-gray-800">
                        <td className="py-1">₹ {bet.amount.toFixed(2)}</td>
                        <td className="py-1">{bet.result === "win" ? `${bet.multiplier.toFixed(2)}x` : "-"}</td>
                        <td className={`py-1 text-right ${bet.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {bet.profit >= 0 ? "+" : ""}₹ {bet.profit.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Game Countdown - Only show during waiting state */}
      {gameState === "waiting" && (
        <div className="mt-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-yellow-500">Starting in {countdown}s</span>
            <div className="w-32 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 transition-all duration-1000 ease-linear"
                style={{ width: `${(countdown / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

