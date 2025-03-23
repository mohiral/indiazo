"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { FaArrowLeft, FaClock, FaCheckCircle, FaTimesCircle, FaMoneyBillWave } from "react-icons/fa"

const WithdrawalHistory = () => {
  const [withdrawals, setWithdrawals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      fetchWithdrawals(parsedUser.userId)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchWithdrawals = async (userId) => {
    try {
      const response = await fetch(`https://backend.indiazo.com/api/user-withdrawals/${userId}`)
      const data = await response.json()
      setWithdrawals(data)
    } catch (error) {
      console.error("Error fetching withdrawals:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FaClock className="text-yellow-500" />
      case "approved":
        return <FaCheckCircle className="text-green-500" />
      case "rejected":
        return <FaTimesCircle className="text-red-500" />
      default:
        return <FaClock className="text-gray-500" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Pending"
      case "approved":
        return "Approved"
      case "rejected":
        return "Rejected"
      default:
        return "Unknown"
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 pt-16 pb-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6 text-white">
            <div className="flex items-center mb-4">
              <button
                onClick={() => navigate("/wallet")}
                className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
              >
                <FaArrowLeft />
              </button>
              <h2 className="text-2xl font-bold ml-3">Withdrawal History</h2>
            </div>
            <p className="text-purple-100">Track the status of your withdrawal requests</p>
          </div>

          {/* Content */}
          <div className="p-6">
            {withdrawals.length === 0 ? (
              <div className="text-center py-10">
                <FaMoneyBillWave className="mx-auto text-gray-300 text-5xl mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">No Withdrawals Yet</h3>
                <p className="text-gray-500 mb-6">You haven't made any withdrawal requests yet.</p>
                <button
                  onClick={() => navigate("/withdraw")}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Make a Withdrawal
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {withdrawals.map((withdrawal) => (
                  <motion.div
                    key={withdrawal._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-xl overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                      <div className="flex items-center">
                        <div className="mr-3">{getStatusIcon(withdrawal.status)}</div>
                        <div>
                          <h4 className="font-medium">₹{withdrawal.amount.toFixed(2)}</h4>
                          <p className="text-xs text-gray-500">
                            {formatDate(withdrawal.createdAt)} at {formatTime(withdrawal.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusClass(
                          withdrawal.status
                        )}`}
                      >
                        {getStatusText(withdrawal.status)}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">UPI ID</p>
                          <p className="font-medium">{withdrawal.upiId}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Account Name</p>
                          <p className="font-medium">{withdrawal.accountHolderName}</p>
                        </div>
                      </div>

                      {withdrawal.status === "approved" && withdrawal.transactionId && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-gray-500 mb-1 text-sm">Transaction ID</p>
                          <p className="font-medium text-green-600">{withdrawal.transactionId}</p>
                        </div>
                      )}

                      {withdrawal.status === "rejected" && withdrawal.rejectionReason && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-gray-500 mb-1 text-sm">Reason for Rejection</p>
                          <p className="text-red-600">{withdrawal.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default WithdrawalHistory
