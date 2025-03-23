"use client"

import { useState } from "react"
import CrashGame from "./crash-game"
import WalletPage from "./wallet-page"

export default function GameWithWallet() {
  const [walletBalance, setWalletBalance] = useState(1000)
  const [currentBet, setCurrentBet] = useState(0)
  const [winnings, setWinnings] = useState(0)
  const [showWallet, setShowWallet] = useState(false)

  // Function to handle placing a bet
  const handleBet = (amount) => {
    if (amount > walletBalance) {
      alert("Insufficient balance. Please add money to your wallet.")
      setShowWallet(true)
      return false
    }

    // Deduct the bet amount from wallet
    setWalletBalance((prev) => prev - amount)
    setCurrentBet(amount)
    return true
  }

  // Function to handle winnings
  const handleWin = (multiplier) => {
    const winAmount = currentBet * multiplier
    setWinnings(winAmount)
    setWalletBalance((prev) => prev + winAmount)
    setCurrentBet(0)
  }

  // Function to add money to wallet
  const handleAddMoney = (amount) => {
    setWalletBalance((prev) => prev + amount)
    setShowWallet(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-blue-900 text-white">
      {/* Header with wallet info */}
      <div className="w-full bg-[#1a1a1a] p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Crash Game</h1>
        <div className="flex items-center gap-4">
          <div className="bg-[#2a2a2a] px-4 py-2 rounded-lg">
            <span className="text-gray-400 mr-2">Balance:</span>
            <span className="font-bold">{walletBalance.toFixed(2)} INR</span>
          </div>
          <button
            onClick={() => setShowWallet(true)}
            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-bold"
          >
            Add Money
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto p-4">
        {showWallet ? (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-[#1a1a1a] p-6 rounded-lg max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Add Money</h2>
                <button onClick={() => setShowWallet(false)} className="text-gray-400 hover:text-white">
                  ✕
                </button>
              </div>
              <WalletPage
                initialBalance={walletBalance}
                onBalanceChange={setWalletBalance}
                onClose={() => setShowWallet(false)}
              />
            </div>
          </div>
        ) : (
          <CrashGame walletBalance={walletBalance} onPlaceBet={handleBet} onWin={handleWin} />
        )}
      </div>
    </div>
  )
}

