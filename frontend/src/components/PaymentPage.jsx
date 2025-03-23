"use client"

import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FaWallet, FaMoneyBillWave, FaHistory, FaArrowRight, FaPlus, FaMinus, FaExchangeAlt } from "react-icons/fa"

const PaymentPage = () => {
  const navigate = useNavigate()
  const [confirmedBalance, setConfirmedBalance] = useState(0)
  const [pendingBalance, setPendingBalance] = useState(0)
  const [rejectedBalance, setRejectedBalance] = useState(0)
  const [userId, setUserId] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [activeCard, setActiveCard] = useState("confirmed")

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"))
    if (storedUser && storedUser.userId) {
      setUserId(storedUser.userId)
    }
  }, [])

  useEffect(() => {
    if (!userId) return

    const fetchWalletBalances = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`https://backend.indiazo.com/api/wallet-balance/${userId}`)
        const data = await response.json()

        const confirmed = data.payments
          .filter((payment) => payment.status === "confirmed")
          .reduce((sum, payment) => sum + (payment.amount || 0), 0)

        const pending = data.payments
          .filter((payment) => payment.status === "pending")
          .reduce((sum, payment) => sum + (payment.amount || 0), 0)

        const rejected = data.payments
          .filter((payment) => payment.status === "rejected")
          .reduce((sum, payment) => sum + (payment.amount || 0), 0)

        setConfirmedBalance(confirmed)
        setPendingBalance(pending)
        setRejectedBalance(rejected)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching wallet balances:", error)
        setIsLoading(false)
      }
    }

    fetchWalletBalances()
    const interval = setInterval(fetchWalletBalances, 5000) // Auto-refresh every 5 seconds

    return () => clearInterval(interval)
  }, [userId])

  const handleNavigation = (path) => {
    navigate(path)
  }

  const menuItems = [
    {
      title: "Add Fund",
      description: "Deposit money to your wallet",
      icon: <FaPlus />,
      path: "/payment-qr",
      color: "from-green-500 to-emerald-600",
      hoverColor: "from-green-600 to-emerald-700",
      bgColor: "bg-green-50",
    },
    {
      title: "Withdraw Fund",
      description: "Cash out your wallet winnings",
      icon: <FaMinus />,
      path: "/Withdraw",
      color: "from-blue-500 to-indigo-600",
      hoverColor: "from-blue-600 to-indigo-700",
      bgColor: "bg-blue-50",
    },
    {
      title: "Transaction History",
      description: "View all your wallet transactions",
      icon: <FaHistory />,
      path: "/wallet-history",
      color: "from-purple-500 to-violet-600",
      hoverColor: "from-purple-600 to-violet-700",
      bgColor: "bg-purple-50",
    },
  ]

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-16 pb-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-block p-2 bg-blue-100 rounded-full mb-2">
            <FaWallet className="text-blue-600 text-2xl" />
          </div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
            WALLET DASHBOARD
          </h2>
          <p className="text-gray-500 mt-2">Manage your funds and transactions</p>
        </motion.div>

        {/* Balance Cards */}
        <div className="mb-10">
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-full p-1 shadow-md">
              <button
                onClick={() => setActiveCard("confirmed")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCard === "confirmed"
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Confirmed
              </button>
              <button
                onClick={() => setActiveCard("pending")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCard === "pending"
                    ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setActiveCard("rejected")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCard === "rejected"
                    ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Rejected
              </button>
            </div>
          </div>

          <div className="relative h-64">
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl overflow-hidden ${
                activeCard === "confirmed" ? "z-20" : "z-10"
              }`}
              initial={false}
              animate={{
                scale: activeCard === "confirmed" ? 1 : 0.95,
                opacity: activeCard === "confirmed" ? 1 : 0.5,
                y: activeCard === "confirmed" ? 0 : 10,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>

              <div className="p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center">
                    <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                      <FaMoneyBillWave className="text-white text-xl" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-white text-lg font-medium">Confirmed Balance</h3>
                      <p className="text-green-100 text-sm">Available for use</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline">
                    <span className="text-white text-2xl font-medium">₹</span>
                    <span className="text-white text-5xl font-bold ml-2">
                      {isLoading ? (
                        <div className="h-12 w-32 bg-white bg-opacity-20 rounded animate-pulse"></div>
                      ) : (
                        confirmedBalance.toFixed(2)
                      )}
                    </span>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-green-100">Updated just now</span>
                    <button
                      onClick={() => handleNavigation("/payment-qr")}
                      className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors duration-300"
                    >
                      Add Funds
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className={`absolute inset-0 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl shadow-xl overflow-hidden ${
                activeCard === "pending" ? "z-20" : "z-10"
              }`}
              initial={false}
              animate={{
                scale: activeCard === "pending" ? 1 : 0.95,
                opacity: activeCard === "pending" ? 1 : 0.5,
                y: activeCard === "pending" ? 0 : 10,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>

              <div className="p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center">
                    <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                      <FaExchangeAlt className="text-white text-xl" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-white text-lg font-medium">Pending Balance</h3>
                      <p className="text-yellow-100 text-sm">Processing transactions</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline">
                    <span className="text-white text-2xl font-medium">₹</span>
                    <span className="text-white text-5xl font-bold ml-2">
                      {isLoading ? (
                        <div className="h-12 w-32 bg-white bg-opacity-20 rounded animate-pulse"></div>
                      ) : (
                        pendingBalance.toFixed(2)
                      )}
                    </span>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-yellow-100">Updated just now</span>
                    <button
                      onClick={() => handleNavigation("/wallet-history")}
                      className="bg-white text-yellow-600 px-4 py-2 rounded-lg font-medium hover:bg-yellow-50 transition-colors duration-300"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className={`absolute inset-0 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-xl overflow-hidden ${
                activeCard === "rejected" ? "z-20" : "z-10"
              }`}
              initial={false}
              animate={{
                scale: activeCard === "rejected" ? 1 : 0.95,
                opacity: activeCard === "rejected" ? 1 : 0.5,
                y: activeCard === "rejected" ? 0 : 10,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>

              <div className="p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center">
                    <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                      <FaMoneyBillWave className="text-white text-xl" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-white text-lg font-medium">Rejected Balance</h3>
                      <p className="text-red-100 text-sm">Failed transactions</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline">
                    <span className="text-white text-2xl font-medium">₹</span>
                    <span className="text-white text-5xl font-bold ml-2">
                      {isLoading ? (
                        <div className="h-12 w-32 bg-white bg-opacity-20 rounded animate-pulse"></div>
                      ) : (
                        rejectedBalance.toFixed(2)
                      )}
                    </span>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-red-100">Updated just now</span>
                    <button
                      onClick={() => handleNavigation("/wallet-history")}
                      className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors duration-300"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Menu Items */}
        <motion.div className="mt-8" variants={containerVariants} initial="hidden" animate="visible">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>

          <div className="space-y-4">
            {menuItems.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all duration-300 border border-gray-100 hover:shadow-lg ${item.bgColor}`}
                onClick={() => handleNavigation(item.path)}
              >
                <div className="flex items-center p-4">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-white shadow-md`}
                  >
                    {item.icon}
                  </div>

                  <div className="ml-4 flex-grow">
                    <h3 className="font-semibold text-lg text-gray-800">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-white`}
                  >
                    <FaArrowRight className="text-sm" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PaymentPage

