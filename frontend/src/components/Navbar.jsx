"use client"

import React, { useState, useEffect } from "react"
import {
  FaBars,
  FaHome,
  FaUserCircle,
  FaWallet,
  FaHistory,
  FaGamepad,
  FaChartLine,
  FaSignOutAlt,
  FaAllergies,
  FaFilter,
  FaTimes,
  FaCog,
  FaQuestionCircle,
} from "react-icons/fa"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [confirmedBalance, setConfirmedBalance] = useState(0)
  const [showBalanceDetails, setShowBalanceDetails] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [userId, setUserId] = useState("")
  const [userName, setUserName] = useState("User")

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"))
    if (storedUser?.userId) {
      setUserId(storedUser.userId)
      setUserName(storedUser.name || "User")
    }
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    navigate("/login", { replace: true })
    setIsSidebarOpen(false)
  }

  const toggleBalanceDetails = () => {
    setShowBalanceDetails(!showBalanceDetails)
  }

  useEffect(() => {
    if (!userId) return

    const fetchWalletBalances = async () => {
      try {
        const response = await fetch(`https://backend.indiazo.com/api/wallet-balance/${userId}`)
        const data = await response.json()

        const confirmed = data.payments
          .filter((payment) => payment.status === "confirmed")
          .reduce((sum, payment) => sum + (payment.amount || 0), 0)

        setConfirmedBalance(confirmed)
      } catch (error) {
        console.error("Error fetching wallet balances:", error)
      }
    }

    fetchWalletBalances()
    const interval = setInterval(fetchWalletBalances, 10000)
    return () => clearInterval(interval)
  }, [userId])

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSidebarOpen && !event.target.closest(".sidebar") && !event.target.closest(".menu-button")) {
        setIsSidebarOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isSidebarOpen])

  // Navigation items for bottom navbar
  const navItems = [
    { path: "/", icon: <FaHome />, label: "Home" },
    { path: "/BetHistory", icon: <FaAllergies />, label: "Bet History" },
    { path: "/ContactPage", icon: <FaFilter />, label: "Contact" },
    { path: "/LoginPage", icon: <FaHistory />, label: "Account" },
  ]

  // Sidebar menu items
  const sidebarItems = [
    { path: "/", icon: <FaHome className="mr-3" />, label: "Home" },
    { path: "/PaymentPage", icon: <FaWallet className="mr-3" />, label: "Wallet" },
    { path: "/BetHistory", icon: <FaAllergies className="mr-3" />, label: "Bet History" },
    { path: "/PrivacyPolicy", icon: <FaGamepad className="mr-3" />, label: "PrivacyPolicy" },
    { path: "/terms-of-service", icon: <FaChartLine className="mr-3" />, label: "terms-of-service" },
    { path: "/refund-policy", icon: <FaCog className="mr-3" />, label: "refund-policy" },
    { path: "/disclaimer", icon: <FaCog className="mr-3" />, label: "disclaimer" },
    { path: "/ContactPage", icon: <FaQuestionCircle className="mr-3" />, label: "Help & Support" },
  ]

  return (
    <div className="w-full mb-16">
      {/* Top Navbar */}
      <div className="fixed z-50 top-0 w-full bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-3 flex justify-between items-center shadow-lg">
        <button
          className="menu-button p-2 rounded-full hover:bg-blue-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={toggleSidebar}
          aria-label="Menu"
        >
          <FaBars className="text-xl" />
        </button>

        <h1 className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
          AL GAMES
        </h1>

        <div
          className="flex items-center gap-2 bg-blue-800 bg-opacity-50 px-3 py-1.5 rounded-full cursor-pointer hover:bg-blue-700 transition-all duration-300"
          onClick={toggleBalanceDetails}
        >
          <FaWallet className="text-lg text-yellow-300" />
          <span className="text-sm font-medium">₹ {confirmedBalance.toFixed(2)}</span>
        </div>
      </div>

      {/* Balance Details Popup */}
      <AnimatePresence>
        {showBalanceDetails && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 top-16 right-4 bg-gradient-to-b from-blue-900 to-indigo-900 p-4 rounded-lg shadow-xl border border-blue-700 w-64"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-white">Wallet Details</h3>
              <button onClick={toggleBalanceDetails} className="text-gray-300 hover:text-white">
                <FaTimes />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Available Balance:</span>
                <span className="text-yellow-300 font-bold">₹ {confirmedBalance.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-blue-700">
                <Link
                  to="/PaymentPage"
                  className="block w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center py-2 rounded-md font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
                  onClick={() => setShowBalanceDetails(false)}
                >
                  Add Money
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="sidebar fixed z-50 top-0 left-0 h-full w-72 bg-gradient-to-b from-blue-900 to-indigo-950 text-white shadow-2xl"
          >
            <div className="p-5 border-b border-blue-800">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Menu</h2>
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-full hover:bg-blue-800 transition-all duration-300"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>

              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
                  <FaUserCircle className="text-2xl text-white" />
                </div>
                <div>
                  <h3 className="font-medium">{userName}</h3>
                  <p className="text-xs text-blue-300">{userId}</p>
                </div>
              </div>
            </div>

            <div className="py-4">
              <ul className="space-y-1">
                {sidebarItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-5 py-3 hover:bg-blue-800 transition-all duration-200 ${
                        location.pathname === item.path ? "bg-blue-700 border-l-4 border-blue-400" : ""
                      }`}
                      onClick={toggleSidebar}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="absolute bottom-8 w-full px-5">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-300"
              >
                <FaSignOutAlt className="mr-2" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay when sidebar is open */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black z-40"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Bottom Navbar */}
      <div className="fixed z-50 bottom-0 w-full bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 text-white py-2 px-4 flex justify-around items-center shadow-lg rounded-t-xl border-t border-blue-700">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link key={item.path} to={item.path} className="relative flex flex-col items-center group">
              <div
                className={`p-2 rounded-full ${isActive ? "bg-blue-700" : "hover:bg-blue-800"} transition-all duration-300`}
              >
                {React.cloneElement(item.icon, {
                  className: `text-xl ${isActive ? "text-yellow-300" : "text-gray-300 group-hover:text-white"} transition-all duration-300`,
                })}
              </div>
              <span
                className={`text-xs mt-1 ${isActive ? "opacity-100 text-yellow-300" : "opacity-70 group-hover:opacity-100"} transition-all duration-300`}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-2 w-12 h-1 bg-yellow-300 rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default Navbar

