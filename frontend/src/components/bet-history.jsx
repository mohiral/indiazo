"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FaHistory, FaArrowLeft, FaSearch, FaSortAmountDown, FaSortAmountUp, FaDice } from "react-icons/fa"
import { useNavigate } from "react-router-dom"

const BetHistory = () => {
  const [bets, setBets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [sortOrder, setSortOrder] = useState("desc") // desc = newest first
  const [filterType, setFilterType] = useState("all") // all, win, loss
  const [searchQuery, setSearchQuery] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchBetHistory = async () => {
      setIsLoading(true)
      setError("")

      const user = JSON.parse(localStorage.getItem("user") || "{}")
      if (!user || !user.userId) {
        setError("Please login to view your bet history")
        setIsLoading(false)
        return
      }

      try {
        // Use the wallet-balance endpoint which returns all payments including game transactions
        const response = await fetch(`https://backend.indiazo.com/api/wallet-balance/${user.userId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch bet history")
        }

        const data = await response.json()

        // Filter payments to only include game transactions
        const gameBets = data.payments.filter(
          (payment) => payment.transactionType === "game_win" || payment.transactionType === "game_loss",
        )

        // Transform the data to match our expected format
        const formattedBets = gameBets.map((bet) => ({
          id: bet._id,
          amount: bet.gameDetails?.betAmount || 0,
          multiplier: bet.gameDetails?.multiplier || 0,
          result: bet.transactionType === "game_win" ? "win" : "loss",
          profit: bet.transactionType === "game_win" ? bet.amount : -bet.gameDetails?.betAmount || 0,
          timestamp: bet.createdAt || new Date().toISOString(),
          game: "Cosmic Crash",
        }))

        setBets(formattedBets)
      } catch (err) {
        console.error("Error fetching bet history:", err)
        setError("Failed to load bet history. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBetHistory()
  }, [])

  const handleBack = () => {
    navigate(-1)
  }

  const handleFilterChange = (type) => {
    setFilterType(type)
  }

  const handleSortToggle = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc")
  }

  const filteredBets = bets
    .filter((bet) => {
      if (filterType === "all") return true
      if (filterType === "win") return bet.result === "win"
      if (filterType === "loss") return bet.result === "loss"
      return true
    })
    .filter((bet) => {
      if (!searchQuery) return true
      return (
        bet.amount.toString().includes(searchQuery) ||
        (bet.profit && Math.abs(bet.profit).toString().includes(searchQuery))
      )
    })
    .sort((a, b) => {
      const dateA = new Date(a.timestamp || 0).getTime()
      const dateB = new Date(b.timestamp || 0).getTime()
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB
    })

  const getTotalStats = () => {
    const totalBets = bets.length
    const totalWins = bets.filter((bet) => bet.result === "win").length
    const totalLosses = bets.filter((bet) => bet.result === "loss").length
    const totalWinAmount = bets.reduce((sum, bet) => (bet.result === "win" ? sum + bet.profit : sum), 0)
    const totalLossAmount = bets.reduce((sum, bet) => (bet.result === "loss" ? sum + Math.abs(bet.profit) : sum), 0)
    const netProfit = totalWinAmount - totalLossAmount

    return {
      totalBets,
      totalWins,
      totalLosses,
      totalWinAmount,
      totalLossAmount,
      netProfit,
    }
  }

  const stats = getTotalStats()

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-blue-900 text-white pt-16 pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={handleBack}
            className="p-2 rounded-full bg-blue-800 hover:bg-blue-700 transition-colors mr-3"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-bold flex items-center">
            <FaHistory className="mr-2" /> Bet History
          </h1>
        </div>

        {/* Stats Cards - Only show if there are bets */}
        {bets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-lg p-4 shadow-lg"
            >
              <h3 className="text-gray-300 text-sm mb-1">Total Bets</h3>
              <div className="flex justify-between items-end">
                <div className="text-2xl font-bold">{stats.totalBets}</div>
                <div className="text-sm text-gray-300">
                  <span className="text-green-400">{stats.totalWins} Wins</span> /
                  <span className="text-red-400"> {stats.totalLosses} Losses</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-lg p-4 shadow-lg"
            >
              <h3 className="text-gray-300 text-sm mb-1">Total Winnings</h3>
              <div className="flex justify-between items-end">
                <div className="text-2xl font-bold">₹ {stats.totalWinAmount.toFixed(2)}</div>
                <div className="text-sm text-green-300">
                  {stats.totalWins > 0
                    ? `Avg: ₹ ${(stats.totalWinAmount / stats.totalWins).toFixed(2)}`
                    : "No wins yet"}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className={`bg-gradient-to-br ${
                stats.netProfit >= 0 ? "from-blue-900 to-cyan-900" : "from-red-900 to-rose-900"
              } rounded-lg p-4 shadow-lg`}
            >
              <h3 className="text-gray-300 text-sm mb-1">Net Profit/Loss</h3>
              <div className="flex justify-between items-end">
                <div className={`text-2xl font-bold ${stats.netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                  ₹ {stats.netProfit.toFixed(2)}
                </div>
                <div className="text-sm text-gray-300">
                  {stats.totalBets > 0 ? `Per bet: ₹ ${(stats.netProfit / stats.totalBets).toFixed(2)}` : "No bets yet"}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Filters and Search - Only show if there are bets */}
        {bets.length > 0 && (
          <div className="bg-blue-900/50 rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleFilterChange("all")}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filterType === "all" ? "bg-blue-600 text-white" : "bg-blue-800/50 text-gray-300"
                  }`}
                >
                  All Bets
                </button>
                <button
                  onClick={() => handleFilterChange("win")}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filterType === "win" ? "bg-green-600 text-white" : "bg-blue-800/50 text-gray-300"
                  }`}
                >
                  Wins
                </button>
                <button
                  onClick={() => handleFilterChange("loss")}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filterType === "loss" ? "bg-red-600 text-white" : "bg-blue-800/50 text-gray-300"
                  }`}
                >
                  Losses
                </button>
              </div>

              <div className="flex space-x-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search amount..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-blue-800/50 text-white px-3 py-1 pl-8 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 w-full"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                </div>

                <button
                  onClick={handleSortToggle}
                  className="bg-blue-800/50 text-gray-300 p-2 rounded-full hover:bg-blue-700/50"
                  title={sortOrder === "desc" ? "Newest first" : "Oldest first"}
                >
                  {sortOrder === "desc" ? <FaSortAmountDown /> : <FaSortAmountUp />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bet List */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/50 text-white p-4 rounded-lg text-center">{error}</div>
        ) : bets.length === 0 ? (
          <div className="bg-blue-900/30 rounded-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <FaDice className="text-6xl text-blue-400/30" />
            </div>
            <div className="text-xl text-gray-300 mb-2">No Bets Yet</div>
            <p className="text-gray-400 mb-6">
              You haven't placed any bets yet. Start playing to build your bet history!
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Start Playing
            </button>
          </div>
        ) : filteredBets.length === 0 ? (
          <div className="bg-blue-900/30 rounded-lg p-8 text-center">
            <div className="text-xl text-gray-300 mb-2">No bets found</div>
            <p className="text-gray-400">
              {filterType !== "all"
                ? `Try changing your filter from "${filterType}" to see more results.`
                : "No bets match your search criteria."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBets.map((bet, index) => (
              <motion.div
                key={bet.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`bg-gradient-to-r ${
                  bet.result === "win"
                    ? "from-green-900/40 to-emerald-900/40 border-l-4 border-green-500"
                    : "from-red-900/40 to-rose-900/40 border-l-4 border-red-500"
                } rounded-lg p-4 shadow-lg`}
              >
                <div className="flex flex-col md:flex-row justify-between">
                  <div>
                    <div className="flex items-center">
                      <span
                        className={`text-sm px-2 py-0.5 rounded-full ${
                          bet.result === "win" ? "bg-green-800 text-green-200" : "bg-red-800 text-red-200"
                        }`}
                      >
                        {bet.result === "win" ? "WIN" : "LOSS"}
                      </span>
                      <span className="ml-2 text-gray-300 text-sm">{new Date(bet.timestamp).toLocaleString()}</span>
                    </div>

                    <div className="mt-2">
                      <div className="flex items-center">
                        <span className="text-gray-400 text-sm">Bet Amount:</span>
                        <span className="ml-2 font-medium">₹ {bet.amount?.toFixed(2) || "0.00"}</span>
                      </div>

                      {bet.result === "win" && (
                        <div className="flex items-center mt-1">
                          <span className="text-gray-400 text-sm">Win Amount:</span>
                          <span className="ml-2 font-medium text-green-400">
                            ₹ {(bet.amount + bet.profit).toFixed(2) || "0.00"}
                          </span>
                        </div>
                      )}

                      {bet.multiplier > 0 && (
                        <div className="flex items-center mt-1">
                          <span className="text-gray-400 text-sm">Multiplier:</span>
                          <span className="ml-2 font-medium text-cyan-400">{bet.multiplier?.toFixed(2)}x</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 md:mt-0 text-right">
                    <div className={`text-xl font-bold ${bet.result === "win" ? "text-green-400" : "text-red-400"}`}>
                      {bet.result === "win" ? `+₹ ${bet.profit.toFixed(2)}` : `-₹ ${Math.abs(bet.profit).toFixed(2)}`}
                    </div>
                    {bet.result === "win" && (
                      <div className="text-xs text-gray-400 mt-1">
                        {((bet.profit / bet.amount) * 100).toFixed(0)}% profit
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination placeholder - only show if there are bets */}
        {filteredBets.length > 0 && (
          <div className="mt-6 flex justify-center">
            <div className="bg-blue-900/50 rounded-full px-4 py-2 text-sm text-gray-300">
              Showing {filteredBets.length} bets
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BetHistory

