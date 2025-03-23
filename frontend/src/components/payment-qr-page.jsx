import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const PaymentQRPage = () => {
  const [amount, setAmount] = useState(500)
  const [showForm, setShowForm] = useState(false)
  const [utr, setUtr] = useState("")
  const [upi, setUpi] = useState("")
  const [userId, setUserId] = useState("")
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [activeTab, setActiveTab] = useState("upi")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [upiSettings, setUpiSettings] = useState({ upiId: "7568008581@ybl", name: "LocalMart" })
  const [copied, setCopied] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    // Load user data from localStorage - FIXED: Now loads from the "user" object
    try {
      const storedUser = localStorage.getItem("user")
      
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        setUserId(userData.userId)
        setUserName(userData.name)
        setUserEmail(userData.email)
      } else {
        setError("User data not found. Please login again to continue.")
        console.error("User data not found in localStorage")
      }
    } catch (e) {
      console.error("Error parsing user data from localStorage", e)
      setError("Error loading user data. Please login again.")
    }

    // Fetch UPI settings from backend
    fetchUpiSettings()
  }, [])

  // Update QR code when amount or UPI settings change
  useEffect(() => {
    updateQrCode()
  }, [amount, upiSettings])

  const fetchUpiSettings = async () => {
    try {
      const response = await axios.get("https://backend.indiazo.com/api/upi-settings/active")
      if (response.data && response.data.upiId) {
        setUpiSettings(response.data)
      }
    } catch (error) {
      console.error("Error fetching UPI settings:", error)
    }
  }

  const generateUpiLink = () => {
    const transactionNote = "Adding money to wallet"
    return `upi://pay?pa=${upiSettings.upiId}&pn=${upiSettings.name}&tn=${encodeURIComponent(transactionNote)}&am=${amount}&cu=INR`
  }

  const updateQrCode = () => {
    const upiLink = generateUpiLink()
    const encodedLink = encodeURIComponent(upiLink)
    // Use QR Server API instead of Google Charts (which might be blocked in some regions)
    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodedLink}`)
  }

  const handlePayWithUPI = () => {
    window.location.href = generateUpiLink()
  }

  const handlePaymentDone = () => {
    setShowForm(true)
  }

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiSettings.upiId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await axios.post("https://backend.indiazo.com/api/submit-payment", {
        userId,
        userName,
        userEmail,
        amount,
        utr,
        upiId: upi,
        merchantUpiId: upiSettings.upiId,
      })

      alert("Payment submitted successfully! Your wallet will be updated shortly.")
      navigate("/wallet-history")
    } catch (error) {
      console.error("Error submitting payment:", error.response ? error.response.data : error.message)
      alert("Payment submission failed. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-xl border-2 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <h2 className="text-2xl font-bold">Add Money to Wallet</h2>
          </div>
          <p className="text-white/90 mt-1">Add funds to your wallet using UPI payment</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <label htmlFor="amount" className="block text-lg font-semibold mb-2">
              Enter Amount (Minimum ₹500)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(500, Number(e.target.value)))}
                min="500"
                className="w-full p-3 pl-8 border rounded-lg text-lg font-medium"
              />
            </div>
          </div>

          {/* UPI ID with Copy Button */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border flex items-center justify-between">
            <div className="overflow-hidden max-w-[70%]">
              <p className="text-sm text-gray-500">Pay to UPI ID:</p>
              <p className="font-medium truncate" title={upiSettings.upiId}>
                {upiSettings.upiId}
              </p>
            </div>
            <button
              onClick={copyUpiId}
              className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors flex-shrink-0"
              type="button"
            >
              {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex border rounded-md overflow-hidden">
              <button
                onClick={() => setActiveTab("upi")}
                className={`flex-1 py-2 px-4 flex items-center justify-center gap-2 ${
                  activeTab === "upi" ? "bg-blue-500 text-white" : "bg-gray-100"
                }`}
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                UPI Payment
              </button>
              <button
                onClick={() => setActiveTab("scanner")}
                className={`flex-1 py-2 px-4 flex items-center justify-center gap-2 ${
                  activeTab === "scanner" ? "bg-blue-500 text-white" : "bg-gray-100"
                }`}
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
                QR Scanner
              </button>
            </div>

            {/* UPI Tab Content */}
            {activeTab === "upi" && (
              <div className="mt-4 flex flex-col items-center">
                <div className="bg-white p-4 rounded-lg shadow-md mb-4 border">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl || "/placeholder.svg"}
                      alt="Payment QR Code"
                      width="220"
                      height="220"
                      className="mx-auto"
                      onError={(e) => {
                        console.error("QR Code image failed to load")
                        e.target.src =
                          "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'%3E%3Crect fill='%23f0f0f0' width='220' height='220'/%3E%3Ctext fill='%23999999' fontFamily='Arial' fontSize='14' x='50%25' y='50%25' textAnchor='middle'%3EQR Code%3C/text%3E%3C/svg%3E"
                      }}
                    />
                  ) : (
                    <div className="w-[220px] h-[220px] bg-gray-100 flex items-center justify-center">
                      <p className="text-gray-500">Loading QR Code...</p>
                    </div>
                  )}
                </div>
                <p className="text-center text-sm text-gray-500 mb-4">Scan this QR code with any UPI app to pay</p>
                <button
                  onClick={handlePayWithUPI}
                  className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center justify-center gap-2 mb-2"
                  type="button"
                >
                  Pay with UPI App
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            )}

            {/* Scanner Tab Content */}
            {activeTab === "scanner" && (
              <div className="mt-4 flex flex-col items-center">
                <div className="bg-gray-100 p-4 rounded-lg w-full mb-4 aspect-square flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                </div>
                <p className="text-center text-sm text-gray-500 mb-4">Scan your UPI QR code to make payment</p>
                <button 
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md" 
                  type="button"
                >
                  Open Scanner
                </button>
              </div>
            )}
          </div>

          <div className="text-center mb-4">
            <button
              onClick={handlePaymentDone}
              className="py-2 px-4 border-2 border-purple-500 text-purple-700 hover:bg-purple-50 rounded-md flex items-center justify-center gap-2 mx-auto"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              I've Completed the Payment
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-gray-50 p-5 rounded-lg border border-gray-200 mt-4">
              <h3 className="font-semibold text-lg mb-4">Confirm Payment Details</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="utr" className="block font-medium mb-1">
                    UTR Number (Transaction Reference)
                  </label>
                  <input
                    id="utr"
                    type="text"
                    value={utr}
                    onChange={(e) => setUtr(e.target.value)}
                    placeholder="Enter 12-digit UTR number"
                    className="w-full p-2 border rounded-md"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">You can find this in your UPI app payment history</p>
                </div>
                <div>
                  <label htmlFor="upi" className="block font-medium mb-1">
                    Your UPI ID
                  </label>
                  <input
                    id="upi"
                    type="text"
                    value={upi}
                    onChange={(e) => setUpi(e.target.value)}
                    placeholder="example@ybl"
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Confirm Payment"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 text-center text-sm text-gray-500">
          <p>Secure payments powered by LocalMart</p>
        </div>
      </div>
    </div>
  )
}

export default PaymentQRPage
