"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { FaRupeeSign, FaArrowLeft, FaInfoCircle, FaWallet, FaMoneyBillWave } from "react-icons/fa"

const WithdrawPage = () => {
  const [amount, setAmount] = useState(500)
  const [upiId, setUpiId] = useState("")
  const [accountHolderName, setAccountHolderName] = useState("")
  const [user, setUser] = useState({})
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [walletBalance, setWalletBalance] = useState(0)
  const [isAmountValid, setIsAmountValid] = useState(true)
  const [presetAmounts] = useState([500, 1000, 2000, 5000])
  const [errorMessage, setErrorMessage] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      fetchWalletBalance(parsedUser.userId)
    }
    setIsCheckingAuth(false)
  }, [])

  const fetchWalletBalance = async (userId) => {
    try {
      const response = await fetch(`https://backend.indiazo.com/api/wallet-balance/${userId}`)
      const data = await response.json()
      
      let balance = 0
      data.payments.forEach(payment => {
        if (payment.status === "confirmed") {
          if (payment.transactionType === "deposit" || payment.transactionType === "game_win") {
            balance += payment.amount
          } else if (payment.transactionType === "withdrawal" || payment.transactionType === "game_loss") {
            balance -= payment.amount
          }
        }
      })
      
      setWalletBalance(balance)
    } catch (error) {
      console.error("Error fetching wallet balance:", error)
    }
  }

  const handleAmountChange = (e) => {
    const value = Number(e.target.value)
    setAmount(value)
    validateAmount(value)
  }

  const validateAmount = (value) => {
    if (value < 500) {
      setIsAmountValid(false)
      setErrorMessage("Minimum withdrawal amount is ₹500")
      return false
    } else if (value > walletBalance) {
      setIsAmountValid(false)
      setErrorMessage("Amount exceeds your wallet balance")
      return false
    } else {
      setIsAmountValid(true)
      setErrorMessage("")
      return true
    }
  }

  const handleSelectAmount = (value) => {
    setAmount(value)
    validateAmount(value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateAmount(amount)) return
    if (!upiId || !accountHolderName) return

    setIsSubmitting(true)

    const withdrawalData = {
      userId: user.userId || "Unknown",
      userName: user.name || "Unknown",
      userEmail: user.email || "Unknown",
      amount,
      upiId,
      accountHolderName
    }

    try {
      const response = await fetch("https://backend.indiazo.com/api/submit-withdrawal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(withdrawalData),
      })

      const result = await response.json()

      if (response.ok) {
        console.log("Withdrawal submitted:", result)
        navigate("/wallet-history")
      } else {
        console.error("Error:", result.message)
        setErrorMessage(result.message || "Withdrawal submission failed.")
      }
    } catch (error) {
      console.error("Error submitting withdrawal:", error)
      setErrorMessage("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isCheckingAuth) {
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
          className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 text-white">
            <div className="flex items-center mb-4">
              <button
                onClick={() => navigate("/wallet")}
                className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
              >
                <FaArrowLeft />
              </button>
              <h2 className="text-2xl font-bold ml-3">Withdraw Money</h2>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-green-100">Request a withdrawal to your UPI ID</p>
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full flex items-center">
                <FaWallet className="mr-1" />
                <span className="font-medium">₹{walletBalance.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              {/* Amount Input Section */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Withdrawal Amount</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaRupeeSign className="text-gray-500" />
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    min="500"
                    max={walletBalance}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg text-lg font-bold ${
                      !isAmountValid
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-green-500 focus:ring-green-500"
                    } focus:outline-none focus:ring-2 transition-colors`}
                  />
                </div>
                {!isAmountValid && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center text-red-500 text-sm mt-1"
                  >
                    <FaInfoCircle className="mr-1" /> {errorMessage}
                  </motion.p>
                )}

                {/* Quick Amount Selection */}
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {presetAmounts.map((presetAmount) => (
                    <button
                      type="button"
                      key={presetAmount}
                      onClick={() => handleSelectAmount(presetAmount)}
                      disabled={presetAmount > walletBalance}
                      className={`py-2 px-1 rounded-lg border-2 transition-all ${
                        amount === presetAmount
                          ? "bg-green-100 border-green-500 text-green-700 font-bold"
                          : presetAmount > walletBalance
                          ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      ₹{presetAmount}
                    </button>
                  ))}
                </div>
              </div>

              {/* UPI ID Input */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. name@ybl"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the UPI ID where you want to receive the money
                </p>
              </div>

              {/* Account Holder Name */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Account Holder Name</label>
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Name should match with your bank account
                </p>
              </div>

              {/* Information Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                  <FaInfoCircle className="mr-2" /> Withdrawal Information
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Minimum withdrawal amount is ₹500</li>
                  <li>• Withdrawals are processed within 24-48 hours</li>
                  <li>• Amount will be deducted immediately from your wallet</li>
                  <li>• You can check the status in your withdrawal history</li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !isAmountValid || amount > walletBalance}
                className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center ${
                  isSubmitting || !isAmountValid || amount > walletBalance
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                } transition-all duration-300`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaMoneyBillWave className="mr-2" /> Request Withdrawal
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default WithdrawPage
