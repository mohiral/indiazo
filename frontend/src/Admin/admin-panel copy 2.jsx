"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { BarChart3, Settings, Users, History, RefreshCw, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, AlertTriangle, Check, X, Clock, DollarSign } from 'lucide-react'

export default function AdminPanel() {
  const navigate = useNavigate()
  const toastTimeoutRef = useRef(null)

  // Toast state
  const [toast, setToast] = useState({ visible: false, title: "", message: "", type: "" })

  // Authentication states
  const [isAdmin, setIsAdmin] = useState(false)
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Game control states
  const [crashValue, setCrashValue] = useState(2.0)
  const [crashSequence, setCrashSequence] = useState("")
  const [activeSequence, setActiveSequence] = useState(null)

  // UI states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [timeFrame, setTimeFrame] = useState("all")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedGame, setSelectedGame] = useState(null)
  const [gameDetails, setGameDetails] = useState(null)
  const [showGameDetailsModal, setShowGameDetailsModal] = useState(false)

  // Data states
  const [crashHistory, setCrashHistory] = useState([])
  const [userBets, setUserBets] = useState([])
  const [games, setGames] = useState([])
  const [betStats, setBetStats] = useState({
    totalUsers: 0,
    totalBets: 0,
    winUsers: 0,
    winAmount: 0,
    lossUsers: 0,
    lossAmount: 0,
    adminProfit: 0,
    isProfit: true,
  })
  const [overallBetStats, setOverallBetStats] = useState({
    totalPlayers: 0,
    totalBets: 0,
    totalBetAmount: 0,
    totalWinAmount: 0,
    adminProfit: 0,
    winCount: 0,
    lossCount: 0,
  })

  // Pagination states
  const [gamesPagination, setGamesPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })
  const [betsPagination, setBetsPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })

  // New game settings states
  const [defaultBetAmount, setDefaultBetAmount] = useState(100)
  const [autoCashoutEnabled, setAutoCashoutEnabled] = useState(false)
  const [autoCashoutValue, setAutoCashoutValue] = useState(2.0)
  const [maxBetAmount, setMaxBetAmount] = useState(10000)
  const [minBetAmount, setMinBetAmount] = useState(10)
  const [houseEdge, setHouseEdge] = useState(5)
  const [gameSpeed, setGameSpeed] = useState(1.0)
  const [showDetailedStats, setShowDetailedStats] = useState(false)

  // Custom toast function
  const showToast = (title, message, type = "success") => {
    setToast({
      visible: true,
      title,
      message,
      type,
    })

    // Clear any existing timeout
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }

    // Auto hide after 3 seconds
    toastTimeoutRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }))
    }, 3000)
  }

  useEffect(() => {
    // Check if user is admin
    const checkAdmin = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      if (!user || !user.userId) {
        setIsAdmin(false)
        return
      }

      try {
        const response = await fetch(`http://localhost:5001/api/admin/check/${user.userId}`)
        const data = await response.json()
        setIsAdmin(data.isAdmin)
        if (data.isAdmin) {
          setIsAuthenticated(true)
          fetchCrashHistory()
          fetchCrashSequence()
          fetchUserBets()
          fetchBetStats()
          fetchGames()
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
        setIsAdmin(false)
      }
    }

    checkAdmin()

    // Cleanup toast timeout on unmount
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [])

  // Fetch data when time frame changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchBetStats()
      fetchUserBets()
      fetchGames()

      // Automatically fetch game details when the Games tab is active
      if (activeTab === "games") {
        setTimeout(() => fetchAllBetsData(), 500)
      }
    }
  }, [timeFrame, isAuthenticated, activeTab])

  const fetchCrashHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5001/api/admin/crash-history")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setCrashHistory(data)
    } catch (error) {
      console.error("Error fetching crash history:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCrashSequence = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5001/api/admin/crash-sequence")

      if (response.ok) {
        const data = await response.json()
        setActiveSequence(data)
      } else {
        setActiveSequence(null)
      }
    } catch (error) {
      console.error("Error fetching crash sequence:", error)
      setActiveSequence(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchBetStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5001/api/admin/bet-stats?timeFrame=${timeFrame}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setBetStats(data)
    } catch (error) {
      console.error("Error fetching bet statistics:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserBets = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `http://localhost:5001/api/admin/user-bets?timeFrame=${timeFrame}&page=${betsPagination.page}&limit=${betsPagination.limit}`,
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setUserBets(data.bets || [])
      setBetsPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 0 })
    } catch (error) {
      console.error("Error fetching user bets:", error)
      setUserBets([])
    } finally {
      setLoading(false)
    }
  }

  const fetchGames = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `http://localhost:5001/api/admin/games?timeFrame=${timeFrame}&page=${gamesPagination.page}&limit=${gamesPagination.limit}`,
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()

      // Check if we have games data
      if (data.games && data.games.length > 0) {
        // Make sure each game has the required properties, set defaults if missing
        const processedGames = data.games.map((game) => ({
          ...game,
          playerCount: game.playerCount || 0,
          totalBetAmount: game.totalBetAmount || 0,
          totalWinAmount: game.totalWinAmount || 0,
          adminProfit: game.adminProfit || 0,
        }))
        setGames(processedGames)
      } else {
        setGames([])
      }

      setGamesPagination(data.pagination || { page: 1, limit: 10, total: 0, pages: 0 })
    } catch (error) {
      console.error("Error fetching games:", error)
      setGames([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAllBetsData = async () => {
    try {
      setLoading(true)

      // Get all user bets to calculate overall statistics
      const betsResponse = await fetch(`http://localhost:5001/api/admin/user-bets?timeFrame=${timeFrame}&page=1&limit=1000`)

      if (!betsResponse.ok) {
        throw new Error(`HTTP error fetching bets! status: ${betsResponse.status}`)
      }

      const betsData = await betsResponse.json()

      if (betsData.bets && betsData.bets.length > 0) {
        // Calculate overall statistics
        const uniqueUsers = new Set(betsData.bets.map((bet) => bet.userId)).size
        const totalBets = betsData.bets.length
        let totalBetAmount = 0
        let totalWinAmount = 0
        let winCount = 0
        let lossCount = 0

        betsData.bets.forEach((bet) => {
          totalBetAmount += Number(bet.amount) || 0

          if (bet.status === "won") {
            totalWinAmount += Number(bet.profit) || 0
            winCount++
          } else {
            lossCount++
          }
        })

        const adminProfit = totalBetAmount - totalWinAmount

        // Store the overall statistics
        const stats = {
          totalPlayers: uniqueUsers,
          totalBets: totalBets,
          totalBetAmount: totalBetAmount,
          totalWinAmount: totalWinAmount,
          adminProfit: adminProfit,
          winCount: winCount,
          lossCount: lossCount,
        }

        setOverallBetStats(stats)

        // Update the first game in the list to show the overall statistics
        if (games.length > 0) {
          const updatedGames = [...games]
          updatedGames[0] = {
            ...updatedGames[0],
            playerCount: uniqueUsers,
            totalBetAmount: totalBetAmount,
            totalWinAmount: totalWinAmount,
            adminProfit: adminProfit,
            // Add additional statistics
            isOverallStats: true,
            winCount: winCount,
            lossCount: lossCount,
          }

          setGames(updatedGames)
        }

        showToast("Success", "Bet statistics loaded successfully")
      }
    } catch (error) {
      console.error("Error fetching all bets data:", error)
      showToast("Error", "Failed to load bet statistics. Please try again.", "error")
    } finally {
      setLoading(false)
    }
  }

  const fetchGameDetails = async (gameId) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5001/api/admin/game-stats/${gameId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setGameDetails(data)
      setSelectedGame(gameId)
      setShowGameDetailsModal(true)
    } catch (error) {
      console.error("Error fetching game details:", error)
      setError("Failed to load game details")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost:5001/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsAuthenticated(true)
        fetchCrashHistory()
        fetchCrashSequence()
        fetchUserBets()
        fetchBetStats()
        fetchGames()
        showToast("Success", "Login successful")
      } else {
        setError(data.message || "Authentication failed")
      }
    } catch (error) {
      setError("Server error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSetCrashValue = async () => {
    if (crashValue < 1.01) {
      setError("Crash value must be at least 1.01")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("http://localhost:5001/api/admin/set-crash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ crashValue }),
      })

      const data = await response.json()

      if (response.ok) {
        showToast("Success", `Crash value set to ${crashValue}x for the next game`)
        fetchCrashHistory() // Refresh history
        fetchCrashSequence() // Check if this affects any sequence
      } else {
        setError(data.message || "Failed to set crash value")
      }
    } catch (error) {
      setError("Server error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSetCrashSequence = async () => {
    // Parse the comma-separated string into an array of numbers
    const values = crashSequence
      .split(",")
      .map((val) => Number.parseFloat(val.trim()))
      .filter((val) => !isNaN(val))

    if (values.length === 0) {
      setError("Please enter valid crash values separated by commas")
      return
    }

    if (values.some((val) => val < 1.01)) {
      setError("All crash values must be at least 1.01")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("http://localhost:5001/api/admin/set-crash-sequence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ crashValues: values }),
      })

      const data = await response.json()

      if (response.ok) {
        showToast("Success", `Crash sequence set: ${values.join(", ")}x`)
        fetchCrashHistory() // Refresh history
        fetchCrashSequence() // Refresh sequence data
      } else {
        setError(data.message || "Failed to set crash sequence")
      }
    } catch (error) {
      setError("Server error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivateSequence = async () => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("http://localhost:5001/api/admin/deactivate-crash-sequence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok) {
        showToast("Success", "Crash sequence deactivated")
        setActiveSequence(null)
      } else {
        setError(data.message || "Failed to deactivate crash sequence")
      }
    } catch (error) {
      setError("Server error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    fetchCrashHistory()
    fetchUserBets()
    fetchBetStats()
    fetchGames()
    if (activeTab === "games") {
      setTimeout(() => fetchAllBetsData(), 500)
    }
    if (selectedGame) {
      fetchGameDetails(selectedGame)
    }
  }

  const handleTimeFrameChange = (newTimeFrame) => {
    setTimeFrame(newTimeFrame)
    // Reset pagination when changing time frame
    setBetsPagination((prev) => ({ ...prev, page: 1 }))
    setGamesPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleBetsPageChange = (newPage) => {
    setBetsPagination((prev) => ({ ...prev, page: newPage }))
    fetchUserBets()
  }

  const handleGamesPageChange = (newPage) => {
    setGamesPagination((prev) => ({ ...prev, page: newPage }))
    fetchGames()
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown"
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const formatCurrency = (amount) => {
    return `₹${Number.parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // New function to save game settings
  const saveGameSettings = () => {
    // In a real implementation, this would send the settings to the server
    showToast("Settings Saved", "Game settings have been updated successfully")
  }

  if (!isAdmin && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 space-y-1">
            <h2 className="text-2xl font-bold text-center">Admin Authentication</h2>
            <p className="text-center text-gray-400">Enter your admin password to access the dashboard</p>
          </div>
          <div className="p-6 pt-0">
            {error && (
              <div className="mb-4 p-4 border border-red-500 bg-red-500/10 text-red-500 rounded-md flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Error</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium">
                  Admin Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                className={`w-full px-4 py-2 text-white font-medium rounded-md bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                disabled={loading}
              >
                {loading ? "Authenticating..." : "Login"}
              </button>
            </form>
          </div>
          <div className="p-6 pt-0 border-t border-gray-700">
            <button
              className="w-full px-4 py-2 text-white font-medium rounded-md bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              onClick={() => navigate("/")}
            >
              Back to Game
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      {/* Toast notification */}
      {toast.visible && (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-in fade-in slide-in-from-top-2">
          <div
            className={`p-4 rounded-md shadow-lg border ${
              toast.type === "error"
                ? "bg-red-500/10 border-red-500 text-red-500"
                : "bg-green-500/10 border-green-500 text-green-500"
            }`}
          >
            <div className="flex items-start">
              {toast.type === "error" ? (
                <X className="h-5 w-5 mr-2 mt-0.5" />
              ) : (
                <Check className="h-5 w-5 mr-2 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">{toast.title}</p>
                <p className="text-sm">{toast.message}</p>
              </div>
              <button
                onClick={() => setToast((prev) => ({ ...prev, visible: false }))}
                className="ml-auto -mt-1 -mr-1 p-1 rounded-full hover:bg-gray-800/50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Crash Game Admin Panel</h1>
          <div className="flex gap-2">
            <button
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-gray-600 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              onClick={refreshData}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => navigate("/")}
            >
              Back to Game
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 border border-red-500 bg-red-500/10 text-red-500 rounded-md flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 border border-green-500 bg-green-500/10 text-green-500 rounded-md flex items-start">
            <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Success</p>
              <p>{success}</p>
            </div>
          </div>
        )}

        {/* Time Frame Selector */}
        <div className="mb-6 bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg">
          <div className="p-4 pb-2">
            <h2 className="text-lg font-semibold">Time Period</h2>
          </div>
          <div className="p-4 pt-0">
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium inline-flex items-center ${
                  timeFrame === "hour"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-700 hover:bg-gray-600 border border-gray-600"
                }`}
                onClick={() => handleTimeFrameChange("hour")}
              >
                <Clock className="h-4 w-4 mr-2" />
                Last Hour
              </button>
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  timeFrame === "today"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-700 hover:bg-gray-600 border border-gray-600"
                }`}
                onClick={() => handleTimeFrameChange("today")}
              >
                Today
              </button>
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  timeFrame === "week"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-700 hover:bg-gray-600 border border-gray-600"
                }`}
                onClick={() => handleTimeFrameChange("week")}
              >
                This Week
              </button>
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  timeFrame === "month"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-700 hover:bg-gray-600 border border-gray-600"
                }`}
                onClick={() => handleTimeFrameChange("month")}
              >
                This Month
              </button>
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  timeFrame === "all"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-700 hover:bg-gray-600 border border-gray-600"
                }`}
                onClick={() => handleTimeFrameChange("all")}
              >
                All Time
              </button>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1 bg-gray-800 rounded-lg p-1">
            <button
              className={`flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium ${
                activeTab === "dashboard"
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-gray-300 hover:bg-gray-700/50"
              }`}
              onClick={() => setActiveTab("dashboard")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Stats</span>
            </button>
            <button
              className={`flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium ${
                activeTab === "games"
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-gray-300 hover:bg-gray-700/50"
              }`}
              onClick={() => setActiveTab("games")}
            >
              <History className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Games History</span>
              <span className="sm:hidden">Games</span>
            </button>
            <button
              className={`flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium ${
                activeTab === "bets"
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-gray-300 hover:bg-gray-700/50"
              }`}
              onClick={() => setActiveTab("bets")}
            >
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">User Bets</span>
              <span className="sm:hidden">Bets</span>
            </button>
            <button
              className={`flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium ${
                activeTab === "settings"
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-gray-300 hover:bg-gray-700/50"
              }`}
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Game Settings</span>
              <span className="sm:hidden">Settings</span>
            </button>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <>
            {/* Game Statistics Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg">
                <div className="p-4">
                  <div className="flex flex-col">
                    <p className="text-sm text-gray-400">Total Users</p>
                    <div className="flex items-center mt-1">
                      <Users className="h-5 w-5 mr-2 text-blue-400" />
                      <p className="text-2xl font-bold">{betStats.totalUsers}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Total Bets: {betStats.totalBets}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg">
                <div className="p-4">
                  <div className="flex flex-col">
                    <p className="text-sm text-gray-400">Winning Users</p>
                    <div className="flex items-center mt-1">
                      <ArrowUp className="h-5 w-5 mr-2 text-green-400" />
                      <p className="text-2xl font-bold text-green-400">{betStats.winUsers}</p>
                    </div>
                    <p className="text-xs text-green-400 mt-2">{formatCurrency(betStats.winAmount)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg">
                <div className="p-4">
                  <div className="flex flex-col">
                    <p className="text-sm text-gray-400">Losing Users</p>
                    <div className="flex items-center mt-1">
                      <ArrowDown className="h-5 w-5 mr-2 text-red-400" />
                      <p className="text-2xl font-bold text-red-400">{betStats.lossUsers}</p>
                    </div>
                    <p className="text-xs text-red-400 mt-2">{formatCurrency(betStats.lossAmount)}</p>
                  </div>
                </div>
              </div>

              <div
                className={`bg-gray-800/50 border rounded-lg shadow-lg ${betStats.isProfit ? "border-green-500/50" : "border-red-500/50"}`}
              >
                <div className="p-4">
                  <div className="flex flex-col">
                    <p className="text-sm text-gray-400">Admin Status</p>
                    <div className="flex items-center mt-1">
                      <DollarSign className={`h-5 w-5 mr-2 ${betStats.isProfit ? "text-green-400" : "text-red-400"}`} />
                      <p className={`text-2xl font-bold ${betStats.isProfit ? "text-green-400" : "text-red-400"}`}>
                        {betStats.isProfit ? "Profit" : "Loss"}
                      </p>
                    </div>
                    <p className={`text-xs ${betStats.isProfit ? "text-green-400" : "text-red-400"} mt-2`}>
                      {formatCurrency(Math.abs(betStats.adminProfit))}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Games and Bets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Games */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg">
                <div className="p-4 border-b border-gray-700">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Recent Games</h2>
                    <button
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-gray-600 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      onClick={refreshData}
                      disabled={loading}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </button>
                  </div>
                </div>
                <div className="p-0">
                  <div className="h-[300px] overflow-y-auto">
                    <div className="p-4">
                      {games.slice(0, 5).map((game, index) => (
                        <div
                          key={index}
                          className="mb-3 p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 cursor-pointer transition-colors"
                          onClick={() => fetchGameDetails(game.gameId)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-gray-300">{formatDate(game.timestamp)}</p>
                              <div className="flex items-center mt-1">
                                <span
                                  className={`font-medium ${game.crashPoint < 2 ? "text-red-400" : "text-green-400"}`}
                                >
                                  {game.crashPoint?.toFixed(2)}x
                                </span>
                                {game.isAdminSet && (
                                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full text-yellow-400 border border-yellow-400">
                                    Admin
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center">
                                <Users className="h-3 w-3 mr-1 text-blue-400" />
                                <span className="text-sm">{game.playerCount}</span>
                              </div>
                              <span
                                className={`text-sm ${game.adminProfit >= 0 ? "text-green-400" : "text-red-400"} mt-1 block`}
                              >
                                {game.adminProfit >= 0 ? "+" : "-"}
                                {formatCurrency(Math.abs(game.adminProfit || 0))}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {games.length === 0 && (
                        <div className="py-8 text-center text-gray-400">
                          <p>No games found</p>
                          <p className="mt-2 text-sm">Try refreshing or changing the time period</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-700">
                  <button
                    className="w-full text-blue-400 hover:text-blue-300 py-2 text-center"
                    onClick={() => setActiveTab("games")}
                  >
                    View All Games
                  </button>
                </div>
              </div>

              {/* Recent Bets */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg">
                <div className="p-4 border-b border-gray-700">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Recent Bets</h2>
                    <button
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-gray-600 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      onClick={fetchUserBets}
                      disabled={loading}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </button>
                  </div>
                </div>
                <div className="p-0">
                  <div className="h-[300px] overflow-y-auto">
                    <div className="p-4 space-y-3">
                      {userBets.slice(0, 5).map((bet, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg ${
                            bet.status === "won"
                              ? "bg-green-900/30 border border-green-800"
                              : "bg-red-900/30 border border-red-800"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{bet.username || "Anonymous"}</p>
                              <p className="text-xs text-gray-400">{formatDate(bet.createdAt)}</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${bet.status === "won" ? "text-green-400" : "text-red-400"}`}>
                                {bet.status === "won"
                                  ? `+${formatCurrency(bet.profit || 0)}`
                                  : `-${formatCurrency(bet.amount || 0)}`}
                              </p>
                              {bet.status === "won" && (
                                <p className="text-xs text-gray-400">
                                  Cashed out at {bet.cashoutMultiplier?.toFixed(2) || "0.00"}x
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="mt-1 flex justify-between text-xs text-gray-400">
                            <span>Bet: {formatCurrency(bet.amount || 0)}</span>
                            <span>Game ID: {bet.gameId?.substring(0, 8) || "Unknown"}...</span>
                          </div>
                        </div>
                      ))}
                      {userBets.length === 0 && (
                        <div className="py-8 text-center text-gray-400">
                          <p>No bet data available</p>
                          <p className="mt-2 text-sm">Try refreshing or changing the time period</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-700">
                  <button
                    className="w-full text-blue-400 hover:text-blue-300 py-2 text-center"
                    onClick={() => setActiveTab("bets")}
                  >
                    View All Bets
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Games History Tab */}
        {activeTab === "games" && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg">
            <div className="p-4 border-b border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-semibold">Games History</h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-gray-600 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    onClick={refreshData}
                    disabled={loading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </button>
                  <button
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={fetchAllBetsData}
                    disabled={loading}
                  >
                    Load Stats
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4">
              {loading && (
                <div className="text-center py-4 bg-gray-700/50 rounded-lg mb-4">
                  <p className="text-gray-300 font-medium">Loading game data...</p>
                  <p className="text-gray-400 text-sm mt-1">This may take a moment</p>
                </div>
              )}

              {/* Overall Betting Statistics Card */}
              {overallBetStats.totalBets > 0 && (
                <div className="mb-6 p-4 bg-gray-700/50 border border-blue-500/30 rounded-lg">
                  <h3 className="text-blue-400 text-lg font-medium mb-3">Overall Betting Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-700 rounded-lg p-3">
                      <h4 className="text-sm text-gray-400">Total Players</h4>
                      <div className="flex items-center mt-1">
                        <Users className="h-4 w-4 mr-2 text-blue-400" />
                        <p className="text-xl font-bold">{overallBetStats.totalPlayers}</p>
                      </div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3">
                      <h4 className="text-sm text-gray-400">Total Bets</h4>
                      <p className="text-xl font-bold">{overallBetStats.totalBets}</p>
                      <p className="text-xs text-gray-400">{formatCurrency(overallBetStats.totalBetAmount)}</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3">
                      <h4 className="text-sm text-gray-400">Win/Loss</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-400 font-bold">{overallBetStats.winCount}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-red-400 font-bold">{overallBetStats.lossCount}</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {Math.round((overallBetStats.winCount / overallBetStats.totalBets) * 100)}% win rate
                      </p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3">
                      <h4 className="text-sm text-gray-400">Profit/Loss</h4>
                      <p
                        className={`text-xl font-bold ${overallBetStats.adminProfit >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {overallBetStats.adminProfit >= 0 ? "+" : "-"}
                        {formatCurrency(Math.abs(overallBetStats.adminProfit))}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Games Table - Mobile View */}
              <div className="md:hidden space-y-4">
                {games.map((game, index) => (
                  <div
                    key={index}
                    className={`bg-gray-700/50 border rounded-lg ${game.isOverallStats ? "border-blue-500/50" : "border-gray-600"}`}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          {game.isOverallStats ? (
                            <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">Overall Stats</span>
                          ) : (
                            <p className="text-sm text-gray-300">{formatDate(game.timestamp)}</p>
                          )}
                        </div>
                        {!game.isOverallStats && (
                          <button
                            className="text-blue-400 hover:text-blue-300 -mt-1 -mr-2 p-1"
                            onClick={() => fetchGameDetails(game.gameId)}
                          >
                            Details
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {!game.isOverallStats && (
                          <>
                            <div>
                              <p className="text-gray-400">Game ID:</p>
                              <p>{game.gameId?.substring(0, 8)}...</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Crash Point:</p>
                              <div className="flex items-center">
                                <span className={game.crashPoint < 2 ? "text-red-400" : "text-green-400"}>
                                  {game.crashPoint?.toFixed(2)}x
                                </span>
                                {game.isAdminSet && (
                                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full text-yellow-400 border border-yellow-400">
                                    Admin
                                  </span>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                        <div>
                          <p className="text-gray-400">Players:</p>
                          <p>{game.isOverallStats ? overallBetStats.totalPlayers : game.playerCount}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Total Bets:</p>
                          <p>
                            {formatCurrency(game.isOverallStats ? overallBetStats.totalBetAmount : game.totalBetAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Total Wins:</p>
                          <p>
                            {formatCurrency(game.isOverallStats ? overallBetStats.totalWinAmount : game.totalWinAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Profit/Loss:</p>
                          <p className={game.adminProfit >= 0 ? "text-green-400" : "text-red-400"}>
                            {game.adminProfit >= 0 ? "+" : "-"}
                            {formatCurrency(Math.abs(game.adminProfit))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {games.length === 0 && !loading && (
                  <div className="py-8 text-center text-gray-400">
                    <p>No games found</p>
                    <p className="mt-2 text-sm">Try refreshing or changing the time period</p>
                  </div>
                )}
              </div>

              {/* Games Table - Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Game ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Crash Point
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Players
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Total Bets
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Total Wins
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Profit/Loss
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {games.map((game, index) => (
                      <tr key={index} className={game.isOverallStats ? "bg-blue-900/20" : "hover:bg-gray-700"}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          {game.isOverallStats ? (
                            <span className="font-medium text-blue-400">Overall Stats</span>
                          ) : (
                            formatDate(game.timestamp)
                          )}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          {game.isOverallStats ? "-" : game.gameId?.substring(0, 8) + "..."}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {game.isOverallStats ? (
                            "-"
                          ) : (
                            <div className="flex items-center">
                              <span
                                className={`font-medium ${game.crashPoint < 2 ? "text-red-400" : "text-green-400"}`}
                              >
                                {game.crashPoint?.toFixed(2)}x
                              </span>
                              {game.isAdminSet && (
                                <span className="ml-2 text-xs px-2 py-0.5 rounded-full text-yellow-400 border border-yellow-400">
                                  Admin
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          {game.isOverallStats
                            ? overallBetStats.totalPlayers
                            : game.playerCount !== undefined
                              ? game.playerCount
                              : "-"}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          {game.isOverallStats
                            ? formatCurrency(overallBetStats.totalBetAmount)
                            : game.totalBetAmount !== undefined
                              ? formatCurrency(game.totalBetAmount)
                              : "-"}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          {game.isOverallStats
                            ? formatCurrency(overallBetStats.totalWinAmount)
                            : game.totalWinAmount !== undefined
                              ? formatCurrency(game.totalWinAmount)
                              : "-"}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {game.isOverallStats ? (
                            <span className={overallBetStats.adminProfit >= 0 ? "text-green-400" : "text-red-400"}>
                              {overallBetStats.adminProfit >= 0 ? "+" : "-"}
                              {formatCurrency(Math.abs(overallBetStats.adminProfit))}
                            </span>
                          ) : game.adminProfit !== undefined ? (
                            <span className={game.adminProfit >= 0 ? "text-green-400" : "text-red-400"}>
                              {game.adminProfit >= 0 ? "+" : "-"}
                              {formatCurrency(Math.abs(game.adminProfit))}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          {game.isOverallStats ? (
                            <span className="text-gray-400">-</span>
                          ) : (
                            <button
                              className="text-blue-400 hover:text-blue-300"
                              onClick={() => fetchGameDetails(game.gameId)}
                            >
                              Details
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {games.length === 0 && !loading && (
                      <tr>
                        <td colSpan={8} className="text-center text-gray-400 py-8">
                          No games found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {gamesPagination.pages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex items-center space-x-2">
                    <button
                      className={`inline-flex items-center p-2 rounded-md border ${
                        gamesPagination.page === 1
                          ? "border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed"
                          : "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                      onClick={() => handleGamesPageChange(Math.max(1, gamesPagination.page - 1))}
                      disabled={gamesPagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous</span>
                    </button>

                    <span className="text-sm text-gray-400">
                      Page {gamesPagination.page} of {gamesPagination.pages}
                    </span>

                    <button
                      className={`inline-flex items-center p-2 rounded-md border ${
                        gamesPagination.page === gamesPagination.pages
                          ? "border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed"
                          : "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                      onClick={() => handleGamesPageChange(Math.min(gamesPagination.pages, gamesPagination.page + 1))}
                      disabled={gamesPagination.page === gamesPagination.pages}
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Bets Tab */}
        {activeTab === "bets" && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg">
            <div className="p-4 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">User Bets</h2>
                <button
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-gray-600 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  onClick={fetchUserBets}
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
            <div className="p-4">
              {loading && (
                <div className="text-center py-4 bg-gray-700/50 rounded-lg mb-4">
                  <p className="text-gray-300 font-medium">Loading bet data...</p>
                </div>
              )}

              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                {userBets.map((bet, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg bg-gray-700/50 ${
                      bet.status === "won" ? "border-green-500/50" : "border-red-500/50"
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{bet.username}</p>
                          <p className="text-xs text-gray-400">{formatDate(bet.createdAt)}</p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            bet.status === "won" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                          }`}
                        >
                          {bet.status === "won" ? "Won" : "Lost"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-400">Game ID:</p>
                          <p>{bet.gameId ? bet.gameId.substring(0, 8) + "..." : "Unknown"}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Bet Amount:</p>
                          <p>{formatCurrency(bet.amount)}</p>
                        </div>
                        {bet.status === "won" && (
                          <div>
                            <p className="text-gray-400">Cashout:</p>
                            <p>{bet.cashoutMultiplier?.toFixed(2) || "0.00"}x</p>
                          </div>
                        )}
                        <div>
                          <p className="text-gray-400">Profit/Loss:</p>
                          <p className={bet.status === "won" ? "text-green-400" : "text-red-400"}>
                            {bet.status === "won" ? "+" : "-"}
                            {formatCurrency(bet.status === "won" ? bet.profit : bet.amount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {userBets.length === 0 && !loading && (
                  <div className="py-8 text-center text-gray-400">
                    <p>No bets found</p>
                    <p className="mt-2 text-sm">Try refreshing or changing the time period</p>
                  </div>
                )}
              </div>

              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Player
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Game ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Bet Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Result
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Profit/Loss
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {userBets.map((bet, index) => (
                      <tr key={index} className="hover:bg-gray-700">
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{formatDate(bet.createdAt)}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{bet.username}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          {bet.gameId ? bet.gameId.substring(0, 8) + "..." : "Unknown"}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{formatCurrency(bet.amount)}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              bet.status === "won" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                            }`}
                          >
                            {bet.status === "won"
                              ? `Cashed out at ${bet.cashoutMultiplier?.toFixed(2) || "0.00"}x`
                              : "Lost"}
                          </span>
                        </td>
                        <td
                          className={`px-4 py-2 whitespace-nowrap ${bet.status === "won" ? "text-green-400" : "text-red-400"}`}
                        >
                          {bet.status === "won" ? "+" : "-"}
                          {formatCurrency(bet.status === "won" ? bet.profit : bet.amount)}
                        </td>
                      </tr>
                    ))}
                    {userBets.length === 0 && !loading && (
                      <tr>
                        <td colSpan={6} className="text-center text-gray-400 py-8">
                          No bets found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {betsPagination.pages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex items-center space-x-2">
                    <button
                      className={`inline-flex items-center p-2 rounded-md border ${
                        betsPagination.page === 1
                          ? "border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed"
                          : "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                      onClick={() => handleBetsPageChange(Math.max(1, betsPagination.page - 1))}
                      disabled={betsPagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous</span>
                    </button>

                    <span className="text-sm text-gray-400">
                      Page {betsPagination.page} of {betsPagination.pages}
                    </span>

                    <button
                      className={`inline-flex items-center p-2 rounded-md border ${
                        betsPagination.page === betsPagination.pages
                          ? "border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed"
                          : "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                      onClick={() => handleBetsPageChange(Math.min(betsPagination.pages, betsPagination.page + 1))}
                      disabled={betsPagination.page === betsPagination.pages}
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Game Settings Tab */}
        {activeTab === "settings" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Set Crash Value */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold">Set Next Crash Value</h2>
                <p className="text-gray-400 text-sm mt-1">Force the next game to crash at a specific multiplier</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="crashValue" className="block text-sm font-medium">
                    Crash Value (Multiplier)
                  </label>
                  <div className="flex items-center">
                    <input
                      id="crashValue"
                      type="number"
                      value={crashValue}
                      onChange={(e) => setCrashValue(Number(e.target.value))}
                      min="1.01"
                      step="0.01"
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="bg-gray-600 px-3 py-2 rounded-r-md">x</span>
                  </div>
                </div>

                <button
                  onClick={handleSetCrashValue}
                  disabled={loading}
                  className={`w-full px-4 py-2 text-white font-medium rounded-md bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {loading ? "Setting..." : "Set Single Crash Value"}
                </button>

                <p className="text-sm text-gray-400">
                  This will force the next game to crash at exactly this multiplier value.
                </p>
              </div>

              <hr className="border-gray-700 mx-6" />

              <div className="p-6 pt-4">
                <h2 className="text-xl font-semibold">Set Crash Sequence</h2>
                <p className="text-gray-400 text-sm mt-1">Set a repeating sequence of crash values</p>
              </div>
              <div className="p-6 pt-0 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="crashSequence" className="block text-sm font-medium">
                    Crash Values (comma separated)
                  </label>
                  <input
                    id="crashSequence"
                    value={crashSequence}
                    onChange={(e) => setCrashSequence(e.target.value)}
                    placeholder="2.0, 5.0, 7.0"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleSetCrashSequence}
                  disabled={loading}
                  className={`w-full px-4 py-2 text-white font-medium rounded-md bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {loading ? "Setting..." : "Set Crash Sequence"}
                </button>

                {activeSequence && (
                  <div className="mt-4 p-4 bg-yellow-900/30 border border-yellow-500 rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-yellow-400">Active Sequence</p>
                        <p className="text-yellow-400 font-medium">{activeSequence.crashValues.join(", ")}x</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Next crash: {activeSequence.crashValues[activeSequence.currentIndex]}x (#
                          {activeSequence.currentIndex + 1}/{activeSequence.crashValues.length})
                        </p>
                      </div>
                      <button
                        onClick={handleDeactivateSequence}
                        className="px-3 py-1.5 text-sm font-medium rounded-md border border-yellow-500 text-yellow-400 hover:bg-yellow-900/50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        Deactivate
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-sm text-gray-400">
                  This will set a repeating sequence of crash values. The game will crash at these values in order, then
                  loop back to the first value.
                </p>
              </div>
            </div>

            {/* Player Bet Settings */}
            <div className="space-y-6">
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-xl font-semibold">Player Bet Settings</h2>
                  <p className="text-gray-400 text-sm mt-1">Configure default bet options for players</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="defaultBetAmount" className="block text-sm font-medium">
                        Default Bet Amount
                      </label>
                      <div className="flex items-center">
                        <span className="bg-gray-600 px-3 py-2 rounded-l-md">₹</span>
                        <input
                          id="defaultBetAmount"
                          type="number"
                          value={defaultBetAmount}
                          onChange={(e) => setDefaultBetAmount(Number(e.target.value))}
                          min="10"
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <p className="text-xs text-gray-400">This amount will be pre-filled when players open the game</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="minBetAmount" className="block text-sm font-medium">
                          Minimum Bet
                        </label>
                        <div className="flex items-center">
                          <span className="bg-gray-600 px-3 py-2 rounded-l-md">₹</span>
                          <input
                            id="minBetAmount"
                            type="number"
                            value={minBetAmount}
                            onChange={(e) => setMinBetAmount(Number(e.target.value))}
                            min="1"
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="maxBetAmount" className="block text-sm font-medium">
                          Maximum Bet
                        </label>
                        <div className="flex items-center">
                          <span className="bg-gray-600 px-3 py-2 rounded-l-md">₹</span>
                          <input
                            id="maxBetAmount"
                            type="number"
                            value={maxBetAmount}
                            onChange={(e) => setMaxBetAmount(Number(e.target.value))}
                            min="100"
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="autoCashoutEnabled" className="text-sm font-medium">
                          Auto Cashout
                        </label>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none">
                          <input
                            type="checkbox"
                            id="autoCashoutEnabled"
                            checked={autoCashoutEnabled}
                            onChange={() => setAutoCashoutEnabled(!autoCashoutEnabled)}
                            className="sr-only"
                          />
                          <div
                            className={`block h-6 rounded-full w-10 ${autoCashoutEnabled ? "bg-blue-600" : "bg-gray-600"}`}
                          ></div>
                          <div
                            className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${autoCashoutEnabled ? "transform translate-x-4" : ""}`}
                          ></div>
                        </div>
                      </div>
                      {autoCashoutEnabled && (
                        <div className="pt-2">
                          <label htmlFor="autoCashoutValue" className="block text-sm font-medium">
                            Default Auto Cashout Value
                          </label>
                          <div className="flex items-center mt-1">
                            <input
                              id="autoCashoutValue"
                              type="number"
                              value={autoCashoutValue}
                              onChange={(e) => setAutoCashoutValue(Number(e.target.value))}
                              min="1.01"
                              step="0.01"
                              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="bg-gray-600 px-3 py-2 rounded-r-md">x</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Players can override this value, but it will be the default
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-xl font-semibold">Game Configuration</h2>
                  <p className="text-gray-400 text-sm mt-1">Advanced settings for game behavior</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label htmlFor="houseEdge" className="block text-sm font-medium">
                        House Edge
                      </label>
                      <span className="text-gray-400">{houseEdge}%</span>
                    </div>
                    <input
                      id="houseEdge"
                      type="range"
                      min="1"
                      max="10"
                      step="0.5"
                      value={houseEdge}
                      onChange={(e) => setHouseEdge(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-xs text-gray-400">
                      Percentage advantage for the house. Higher values increase profit but may reduce player
                      engagement.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label htmlFor="gameSpeed" className="block text-sm font-medium">
                        Game Speed
                      </label>
                      <span className="text-gray-400">{gameSpeed}x</span>
                    </div>
                    <input
                      id="gameSpeed"
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={gameSpeed}
                      onChange={(e) => setGameSpeed(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-xs text-gray-400">
                      Controls how fast the game runs. Lower values give players more time to cash out.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="showDetailedStats" className="text-sm font-medium">
                        Show Detailed Stats to Players
                      </label>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          id="showDetailedStats"
                          checked={showDetailedStats}
                          onChange={() => setShowDetailedStats(!showDetailedStats)}
                          className="sr-only"
                        />
                        <div
                          className={`block h-6 rounded-full w-10 ${showDetailedStats ? "bg-blue-600" : "bg-gray-600"}`}
                        ></div>
                        <div
                          className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showDetailedStats ? "transform translate-x-4" : ""}`}
                        ></div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">
                      When enabled, players can see detailed game statistics and history.
                    </p>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={saveGameSettings}
                      className="w-full px-4 py-2 text-white font-medium rounded-md bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Save Game Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Crash History */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg md:col-span-2">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold">Recent Crash Points</h2>
                <p className="text-gray-400 text-sm mt-1">History of recent game crash values</p>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {crashHistory.length > 0 ? (
                    crashHistory.map((crash, index) => (
                      <div
                        key={index}
                        className={`px-3 py-2 rounded-lg ${
                          crash.crashPoint < 2
                            ? "bg-red-900/30 border border-red-800"
                            : "bg-green-900/30 border border-green-800"
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <span className={`font-bold ${crash.crashPoint < 2 ? "text-red-400" : "text-green-400"}`}>
                            {crash.crashPoint.toFixed(2)}x
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(crash.timestamp).toLocaleTimeString()}
                          </span>
                          {crash.isAdminSet && (
                            <span className="mt-1 text-xs px-2 py-0.5 rounded-full text-yellow-400 border border-yellow-400">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-gray-400 w-full">
                      <p>No crash history available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Bet Presets */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg md:col-span-2">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold">Quick Bet Presets</h2>
                <p className="text-gray-400 text-sm mt-1">Configure preset bet amounts for players to quickly select</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="preset1" className="block text-sm font-medium">
                      Preset 1
                    </label>
                    <div className="flex items-center">
                      <span className="bg-gray-600 px-3 py-2 rounded-l-md">₹</span>
                      <input
                        id="preset1"
                        type="number"
                        defaultValue={50}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="preset2" className="block text-sm font-medium">
                      Preset 2
                    </label>
                    <div className="flex items-center">
                      <span className="bg-gray-600 px-3 py-2 rounded-l-md">₹</span>
                      <input
                        id="preset2"
                        type="number"
                        defaultValue={100}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="preset3" className="block text-sm font-medium">
                      Preset 3
                    </label>
                    <div className="flex items-center">
                      <span className="bg-gray-600 px-3 py-2 rounded-l-md">₹</span>
                      <input
                        id="preset3"
                        type="number"
                        defaultValue={500}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="preset4" className="block text-sm font-medium">
                      Preset 4
                    </label>
                    <div className="flex items-center">
                      <span className="bg-gray-600 px-3 py-2 rounded-l-md">₹</span>
                      <input
                        id="preset4"
                        type="number"
                        defaultValue={1000}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={saveGameSettings}
                    className="w-full px-4 py-2 text-white font-medium rounded-md bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Save Bet Presets
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Game Details Modal */}
        {showGameDetailsModal && selectedGame && gameDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-white">Game Details</h2>
                  <p className="text-gray-400 text-sm">Game ID: {gameDetails.gameId?.substring(0, 8)}...</p>
                </div>
                <button
                  onClick={() => {
                    setShowGameDetailsModal(false)
                    setSelectedGame(null)
                    setGameDetails(null)
                  }}
                  className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-gray-400 text-sm">Time:</p>
                    <p className="font-medium">{formatDate(gameDetails.timestamp)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Crash Point:</p>
                    <div className="flex items-center">
                      <p className={`font-medium ${gameDetails.crashPoint < 2 ? "text-red-400" : "text-green-400"}`}>
                        {gameDetails.crashPoint}x
                      </p>
                      {gameDetails.isAdminSet && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full text-yellow-400 border border-yellow-400">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Admin Profit/Loss:</p>
                    <p className={`font-medium ${gameDetails.adminProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {gameDetails.adminProfit >= 0 ? "+" : "-"}
                      {formatCurrency(Math.abs(gameDetails.adminProfit))}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Bets:</p>
                    <p className="font-medium">{formatCurrency(gameDetails.totalBetAmount)}</p>
                  </div>
                </div>

                <h3 className="text-lg font-medium mb-3">Player Bets</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <h4 className="text-sm text-gray-400">Total Players</h4>
                    <p className="text-xl font-bold">{gameDetails.bets.length}</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <h4 className="text-sm text-gray-400">Win Rate</h4>
                    <p className="text-xl font-bold">
                      {gameDetails.bets.length > 0
                        ? `${Math.round((gameDetails.bets.filter((bet) => bet.status === "won").length / gameDetails.bets.length) * 100)}%`
                        : "0%"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  {gameDetails.bets.map((bet, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        bet.status === "won"
                          ? "bg-green-900/30 border border-green-800"
                          : "bg-red-900/30 border border-red-800"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{bet.username}</p>
                          <p className="text-xs text-gray-400">Bet: {formatCurrency(bet.betAmount)}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${bet.status === "won" ? "text-green-400" : "text-red-400"}`}>
                            {bet.status === "won" ? "+" : "-"}
                            {formatCurrency(bet.status === "won" ? bet.profit : bet.betAmount)}
                          </p>
                          {bet.status === "won" && (
                            <p className="text-xs text-gray-400">Cashed out at {bet.cashoutMultiplier?.toFixed(2)}x</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {gameDetails.bets.length === 0 && (
                    <div className="py-8 text-center text-gray-400">
                      <p>No bets for this game</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
