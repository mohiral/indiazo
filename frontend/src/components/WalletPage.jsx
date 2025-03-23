"use client"

import { useState, useEffect } from "react"

export default function WalletPage({ initialBalance = 1000, onBalanceChange, onClose }) {
  const [balance, setBalance] = useState(initialBalance)
  const [amount, setAmount] = useState(0)

  // Update parent component when balance changes
  useEffect(() => {
    if (onBalanceChange) {
      onBalanceChange(balance)
    }
  }, [balance, onBalanceChange])

  const handleDeposit = () => {
    if (amount > 0) {
      setBalance((prev) => prev + amount)
      setAmount(0)
    }
  }

  const handleWithdraw = () => {
    if (amount > 0 && amount <= balance) {
      setBalance((prev) => prev - amount)
      setAmount(0)
    } else if (amount > balance) {
      alert("Insufficient balance for withdrawal")
    }
  }

  // Quick add buttons
  const quickAddAmounts = [100, 500, 1000, 5000]

  return (
    <div className="bg-[#1a1a1a] text-white rounded-lg">
      <div className="p-6 text-center">
        <p className="text-xl mb-6">
          Current Balance: <span className="font-bold text-2xl">{balance.toFixed(2)} INR</span>
        </p>

        <div className="mb-4">
          <label className="block text-left text-sm mb-2">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Enter amount"
            className="w-full p-3 rounded bg-[#111111] border border-gray-700 text-white"
            min="0"
          />
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {quickAddAmounts.map((quickAmount) => (
            <button
              key={quickAmount}
              onClick={() => setAmount(quickAmount)}
              className="bg-[#2a2a2a] hover:bg-[#3a3a3a] py-2 rounded"
            >
              {quickAmount}
            </button>
          ))}
        </div>

        <div className="flex justify-between gap-4 mb-4">
          <button
            onClick={handleDeposit}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded w-full"
          >
            Deposit
          </button>
          <button
            onClick={handleWithdraw}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded w-full"
          >
            Withdraw
          </button>
        </div>

        <button
          onClick={onClose}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded w-full"
        >
          Return to Game
        </button>
      </div>
    </div>
  )
}

