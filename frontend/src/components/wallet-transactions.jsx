"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  FaWallet,
  FaArrowLeft,
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa"
import { useNavigate } from "react-router-dom"

const WalletTransactions = () => {
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [sortOrder, setSortOrder] = useState("desc") // desc = newest first
  const [filterType, setFilterType] = useState("all") // all, confirmed, pending, rejected
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all") // deposits, withdrawals, all
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true)
      setError("")

      const user = JSON.parse(localStorage.getItem("user") || "{}")
      if (!user || !user.userId) {
        setError("Please login to view your transaction history")
        setIsLoading(false)
        return
      }

      try {
        // Fetch user's payment transactions
        const response = await fetch(`https://backend.indiazo.com/api/user-transactions/${user.userId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch transaction history")
        }

        const data = await response.json()
        setTransactions(data)
      } catch (err) {
        console.error("Error fetching transaction history:", err)
        setError("Failed to load transaction history. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  const handleBack = () => {
    navigate(-1)
  }

  const handleFilterChange = (type) => {
    setFilterType(type)
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handleSortToggle = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc")
  }

  const filteredTransactions = transactions
    .filter((transaction) => {
      // Filter by transaction type (deposit or withdrawal)
      if (activeTab === "deposits") {
        return (
          transaction.transactionType === "deposit" ||
          (transaction.transactionType === "withdrawal" && transaction.amount > 0)
        )
      } else if (activeTab === "withdrawals") {
        return transaction.transactionType === "withdrawal" && transaction.amount < 0
      } else if (activeTab === "all") {
        // Exclude game transactions
        return transaction.transactionType !== "game_win" && transaction.transactionType !== "game_loss"
      }
      return true
    })
    .filter((transaction) => {
      if (filterType === "all") return true
      if (filterType === "confirmed") return transaction.status === "confirmed"
      if (filterType === "pending") return transaction.status === "pending"
      if (filterType === "rejected") return transaction.status === "rejected"
      return true
    })
    .filter((transaction) => {
      if (!searchQuery) return true
      return (
        Math.abs(transaction.amount).toString().includes(searchQuery) ||
        transaction.utr?.includes(searchQuery) ||
        transaction.upiId?.includes(searchQuery)
      )
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB
    })

  const getTransactionStats = () => {
    const deposits = transactions.filter(
      (t) => t.transactionType === "deposit" || (t.transactionType === "withdrawal" && t.amount > 0),
    )

    const withdrawals = transactions.filter((t) => t.transactionType === "withdrawal" && t.amount < 0)

    const totalDeposits = deposits.length
    const totalWithdrawals = withdrawals.length

    const confirmedDeposits = deposits.filter((t) => t.status === "confirmed")
    const confirmedWithdrawals = withdrawals.filter((t) => t.status === "confirmed")

    const pendingDeposits = deposits.filter((t) => t.status === "pending")
    const pendingWithdrawals = withdrawals.filter((t) => t.status === "pending")

    const totalDepositAmount = confirmedDeposits.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0)
    const totalWithdrawalAmount = confirmedWithdrawals.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0)

    const pendingDepositAmount = pendingDeposits.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0)
    const pendingWithdrawalAmount = pendingWithdrawals.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0)

    return {
      totalDeposits,
      totalWithdrawals,
      confirmedDeposits: confirmedDeposits.length,
      confirmedWithdrawals: confirmedWithdrawals.length,
      pendingDeposits: pendingDeposits.length,
      pendingWithdrawals: pendingWithdrawals.length,
      totalDepositAmount,
      totalWithdrawalAmount,
      pendingDepositAmount,
      pendingWithdrawalAmount,
    }
  }

  const stats = getTransactionStats()

  // If no transactions are available, show mock data for demonstration
  const useMockData = filteredTransactions.length === 0 && !isLoading && !error

  const mockTransactions = [
    {
      _id: "mock1",
      amount: 500,
      transactionType: "deposit",
      status: "confirmed",
      utr: "123456789012",
      upiId: "user@bank",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
      _id: "mock2",
      amount: 1000,
      transactionType: "deposit",
      status: "pending",
      utr: "987654321098",
      upiId: "user@bank",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    },
    {
      _id: "mock3",
      amount: -200,
      transactionType: "withdrawal",
      status: "confirmed",
      upiId: "user@bank",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
  ]

  const displayTransactions = useMockData ? mockTransactions : filteredTransactions

  const mockStats = {
    totalDeposits: 2,
    totalWithdrawals: 1,
    confirmedDeposits: 1,
    confirmedWithdrawals: 1,
    pendingDeposits: 1,
    pendingWithdrawals: 0,
    totalDepositAmount: 500,
    totalWithdrawalAmount: 200,
    pendingDepositAmount: 1000,
    pendingWithdrawalAmount: 0,
  }

  const displayStats = useMockData ? mockStats : stats

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <FaCheckCircle className="text-green-400" />
      case "pending":
        return <FaHourglassHalf className="text-yellow-400" />
      case "rejected":
        return <FaTimesCircle className="text-red-400" />
      default:
        return null
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case "confirmed":
        return "from-green-900/40 to-emerald-900/40 border-l-4 border-green-500"
      case "pending":
        return "from-yellow-900/40 to-amber-900/40 border-l-4 border-yellow-500"
      case "rejected":
        return "from-red-900/40 to-rose-900/40 border-l-4 border-red-500"
      default:
        return "from-blue-900/40 to-indigo-900/40 border-l-4 border-blue-500"
    }
  }

  const getActiveStats = () => {
    if (activeTab === "deposits") {
      return {
        total: displayStats.totalDeposits,
        confirmed: displayStats.confirmedDeposits,
        pending: displayStats.pendingDeposits,
        totalAmount: displayStats.totalDepositAmount,
        pendingAmount: displayStats.pendingDepositAmount,
        label: "Deposit",
      }
    } else if (activeTab === "withdrawals") {
      return {
        total: displayStats.totalWithdrawals,
        confirmed: displayStats.confirmedWithdrawals,
        pending: displayStats.pendingWithdrawals,
        totalAmount: displayStats.totalWithdrawalAmount,
        pendingAmount: displayStats.pendingWithdrawalAmount,
        label: "Withdrawal",
      }
    } else {
      return {
        total: displayStats.totalDeposits + displayStats.totalWithdrawals,
        confirmed: displayStats.confirmedDeposits + displayStats.confirmedWithdrawals,
        pending: displayStats.pendingDeposits + displayStats.pendingWithdrawals,
        totalAmount: displayStats.totalDepositAmount - displayStats.totalWithdrawalAmount,
        pendingAmount: displayStats.pendingDepositAmount - displayStats.pendingWithdrawalAmount,
        label: "Transaction",
      }
    }
  }

  const activeStats = getActiveStats()

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
            <FaWallet className="mr-2" /> Wallet Transactions
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-900/50 rounded-lg p-1 flex">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "all" ? "bg-blue-700 text-white" : "text-gray-300 hover:text-white"
              }`}
              onClick={() => handleTabChange("all")}
            >
              All
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "deposits" ? "bg-green-700 text-white" : "text-gray-300 hover:text-white"
              }`}
              onClick={() => handleTabChange("deposits")}
            >
              Deposits
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "withdrawals" ? "bg-purple-700 text-white" : "text-gray-300 hover:text-white"
              }`}
              onClick={() => handleTabChange("withdrawals")}
            >
              Withdrawals
            </button>
          </div>
        </div>

        {useMockData && (
          <div className="bg-yellow-600/20 border border-yellow-600/30 text-yellow-200 p-3 rounded-lg mb-6">
            <p className="text-sm">
              <strong>Note:</strong> Showing sample data for demonstration. Your actual transaction history will appear
              here once you have activity.
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-lg p-4 shadow-lg"
          >
            <h3 className="text-gray-300 text-sm mb-1">Total {activeStats.label}s</h3>
            <div className="flex justify-between items-end">
              <div className="text-2xl font-bold">{activeStats.total}</div>
              <div className="text-sm text-gray-300">
                <span className="text-green-400">{activeStats.confirmed} Confirmed</span> /
                <span className="text-yellow-400"> {activeStats.pending} Pending</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-lg p-4 shadow-lg"
          >
            <h3 className="text-gray-300 text-sm mb-1">
              {activeTab === "withdrawals"
                ? "Total Withdrawn"
                : activeTab === "deposits"
                  ? "Total Deposited"
                  : "Net Balance"}
            </h3>
            <div className="flex justify-between items-end">
              <div className="text-2xl font-bold">₹ {activeStats.totalAmount.toFixed(2)}</div>
              <div className="text-sm text-green-300">
                {activeStats.confirmed > 0
                  ? `Avg: ₹ ${(activeStats.totalAmount / activeStats.confirmed).toFixed(2)}`
                  : `No ${activeTab === "all" ? "transactions" : activeTab} yet`}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-gradient-to-br from-yellow-900 to-amber-900 rounded-lg p-4 shadow-lg"
          >
            <h3 className="text-gray-300 text-sm mb-1">Pending Amount</h3>
            <div className="flex justify-between items-end">
              <div className="text-2xl font-bold text-yellow-400">₹ {activeStats.pendingAmount.toFixed(2)}</div>
              <div className="text-sm text-gray-300">
                {activeStats.pending > 0
                  ? `${activeStats.pending} transaction${activeStats.pending > 1 ? "s" : ""}`
                  : `No pending ${activeTab === "all" ? "transactions" : activeTab}`}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="bg-blue-900/50 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange("all")}
                className={`px-3 py-1 rounded-full text-sm ${
                  filterType === "all" ? "bg-blue-600 text-white" : "bg-blue-800/50 text-gray-300"
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleFilterChange("confirmed")}
                className={`px-3 py-1 rounded-full text-sm ${
                  filterType === "confirmed" ? "bg-green-600 text-white" : "bg-blue-800/50 text-gray-300"
                }`}
              >
                Confirmed
              </button>
              <button
                onClick={() => handleFilterChange("pending")}
                className={`px-3 py-1 rounded-full text-sm ${
                  filterType === "pending" ? "bg-yellow-600 text-white" : "bg-blue-800/50 text-gray-300"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => handleFilterChange("rejected")}
                className={`px-3 py-1 rounded-full text-sm ${
                  filterType === "rejected" ? "bg-red-600 text-white" : "bg-blue-800/50 text-gray-300"
                }`}
              >
                Rejected
              </button>
            </div>

            <div className="flex space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search UTR or amount..."
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

        {/* Transaction List */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/50 text-white p-4 rounded-lg text-center">{error}</div>
        ) : displayTransactions.length === 0 ? (
          <div className="bg-blue-900/30 rounded-lg p-8 text-center">
            <div className="text-xl text-gray-300 mb-2">No transactions found</div>
            <p className="text-gray-400">
              {filterType !== "all"
                ? `Try changing your filter from "${filterType}" to see more results.`
                : activeTab !== "all"
                  ? `No ${activeTab} found. Try selecting "All" to see all transactions.`
                  : "Add or withdraw funds to see your transaction history here!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayTransactions.map((transaction, index) => {
              const isWithdrawal = transaction.transactionType === "withdrawal" && transaction.amount < 0
              const displayAmount = Math.abs(transaction.amount || 0)

              return (
                <motion.div
                  key={transaction._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`bg-gradient-to-r ${getStatusClass(transaction.status)} rounded-lg p-4 shadow-lg`}
                >
                  <div className="flex flex-col md:flex-row justify-between">
                    <div>
                      <div className="flex items-center">
                        <span
                          className={`text-sm px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            transaction.status === "confirmed"
                              ? "bg-green-800 text-green-200"
                              : transaction.status === "pending"
                                ? "bg-yellow-800 text-yellow-200"
                                : "bg-red-800 text-red-200"
                          }`}
                        >
                          {getStatusIcon(transaction.status)}
                          <span className="capitalize">{transaction.status}</span>
                        </span>
                        <span className="ml-2 text-gray-300 text-sm">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="mt-2">
                        <div className="flex items-center">
                          <span className="text-gray-400 text-sm">{isWithdrawal ? "Withdrawal:" : "Deposit:"}</span>
                          <span className="ml-2 font-medium flex items-center">
                            ₹ {displayAmount.toFixed(2)}
                            {isWithdrawal ? (
                              <FaArrowUp className="ml-1 text-red-400 text-xs" />
                            ) : (
                              <FaArrowDown className="ml-1 text-green-400 text-xs" />
                            )}
                          </span>
                        </div>

                        {transaction.utr && (
                          <div className="flex items-center mt-1">
                            <span className="text-gray-400 text-sm">UTR:</span>
                            <span className="ml-2 font-medium text-blue-300">{transaction.utr}</span>
                          </div>
                        )}

                        {transaction.upiId && (
                          <div className="flex items-center mt-1">
                            <span className="text-gray-400 text-sm">UPI ID:</span>
                            <span className="ml-2 font-medium text-gray-300">{transaction.upiId}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 md:mt-0 text-right">
                      <div
                        className={`text-xl font-bold flex items-center justify-end ${
                          isWithdrawal
                            ? "text-red-400"
                            : transaction.status === "confirmed"
                              ? "text-green-400"
                              : transaction.status === "pending"
                                ? "text-yellow-400"
                                : "text-red-400"
                        }`}
                      >
                        {isWithdrawal ? "- " : "+ "}₹ {displayAmount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {transaction.status === "pending"
                          ? "Processing..."
                          : transaction.status === "confirmed"
                            ? isWithdrawal
                              ? "Deducted from balance"
                              : "Added to balance"
                            : "Contact support"}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Pagination placeholder - could be implemented if needed */}
        {displayTransactions.length > 0 && (
          <div className="mt-6 flex justify-center">
            <div className="bg-blue-900/50 rounded-full px-4 py-2 text-sm text-gray-300">
              Showing {displayTransactions.length} {useMockData ? "sample" : ""} transactions
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WalletTransactions

