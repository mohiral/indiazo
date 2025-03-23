"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, MoreVertical, Pencil, RefreshCw, Search, Trash2, Filter, Calendar, Clock, User, DollarSign, CreditCard, AtSign } from 'lucide-react'

const AdminWithdrawalManagement = () => {
  const [withdrawals, setWithdrawals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null)
  const [transactionId, setTransactionId] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalAction, setModalAction] = useState("")
  const [editWithdrawal, setEditWithdrawal] = useState(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [withdrawalToDelete, setWithdrawalToDelete] = useState(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchWithdrawals()
  }, [])

  const fetchWithdrawals = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("https://backend.indiazo.com/api/admin/all-withdrawals")
      const data = await response.json()
      setWithdrawals(data)
    } catch (error) {
      console.error("Error fetching withdrawals:", error)
      setError("Failed to load withdrawals. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = (withdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setTransactionId("")
    setModalAction("approve")
    setShowModal(true)
  }

  const handleReject = (withdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setRejectionReason("")
    setModalAction("reject")
    setShowModal(true)
  }

  const confirmAction = async () => {
    if (!selectedWithdrawal) return

    setIsProcessing(true)

    try {
      const url = `https://backend.indiazo.com/api/admin/update-withdrawal-status/${selectedWithdrawal._id}`
      const payload =
        modalAction === "approve" ? { status: "approved", transactionId } : { status: "rejected", rejectionReason }

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        // Update the local state
        setWithdrawals(
          withdrawals.map((w) =>
            w._id === selectedWithdrawal._id
              ? {
                  ...w,
                  status: modalAction === "approve" ? "approved" : "rejected",
                  ...(modalAction === "approve" ? { transactionId } : { rejectionReason }),
                }
              : w,
          ),
        )
        setShowModal(false)
      } else {
        console.error("Failed to update withdrawal status")
        setError("Failed to update withdrawal status. Please try again.")
      }
    } catch (error) {
      console.error("Error updating withdrawal status:", error)
      setError("An error occurred while updating withdrawal status.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEditWithdrawal = (withdrawal) => {
    setEditWithdrawal({ ...withdrawal })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    try {
      // Use the new update-withdrawal endpoint
      const response = await fetch(`https://backend.indiazo.com/api/admin/update-withdrawal/${editWithdrawal._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: editWithdrawal.userName,
          userEmail: editWithdrawal.userEmail,
          amount: editWithdrawal.amount,
          upiId: editWithdrawal.upiId,
          accountHolderName: editWithdrawal.accountHolderName,
          status: editWithdrawal.status,
          ...(editWithdrawal.status === "rejected" && { rejectionReason: editWithdrawal.rejectionReason }),
          ...(editWithdrawal.status === "approved" && { transactionId: editWithdrawal.transactionId }),
        }),
      })

      if (response.ok) {
        setIsEditDialogOpen(false)
        fetchWithdrawals()
      } else {
        console.error("Failed to update withdrawal")
        setError("Failed to update withdrawal. Please try again.")
      }
    } catch (error) {
      console.error("Error updating withdrawal:", error)
      setError("An error occurred while updating the withdrawal.")
    }
  }

  const handleDeleteWithdrawal = (withdrawal) => {
    setWithdrawalToDelete(withdrawal)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      // Use the new delete-withdrawal endpoint
      const response = await fetch(
        `https://backend.indiazo.com/api/admin/delete-withdrawal/${withdrawalToDelete._id}`,
        {
          method: "DELETE",
        }
      )

      if (response.ok) {
        setIsDeleteDialogOpen(false)
        // Remove the item from the local state
        setWithdrawals(withdrawals.filter((w) => w._id !== withdrawalToDelete._id))
      } else {
        console.error("Failed to delete withdrawal")
        setError("Failed to delete withdrawal. Please try again.")
      }
    } catch (error) {
      console.error("Error deleting withdrawal:", error)
      setError("An error occurred while deleting the withdrawal.")
    }
  }

  const toggleDropdown = (id) => {
    setIsDropdownOpen((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const closeAllDropdowns = () => {
    setIsDropdownOpen({})
  }

  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    const matchesSearch =
      withdrawal.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.upiId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.accountHolderName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || withdrawal.status === statusFilter

    return matchesSearch && matchesStatus
  })

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

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>
      case "approved":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Approved</span>
      case "rejected":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Rejected</span>
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">Withdrawal Management</h1>
          <button
            onClick={fetchWithdrawals}
            className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">Withdrawal Management</h1>
          <button
            onClick={fetchWithdrawals}
            className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={fetchWithdrawals}
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Withdrawal Management</h1>
        <button
          onClick={fetchWithdrawals}
          className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, UPI ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <div className="relative w-full">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-[180px] px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawals Cards */}
      {filteredWithdrawals.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md">
          <div className="flex flex-col items-center justify-center py-10">
            <div className="rounded-full bg-gray-100 p-3 mb-3">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Withdrawals Found</h3>
            <p className="text-gray-500 text-center">There are no withdrawal requests matching your filters.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWithdrawals.map((withdrawal) => (
            <div key={withdrawal._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900">{withdrawal.userName || "Unknown"}</h3>
                      <p className="text-sm text-gray-500">{withdrawal.userEmail || "No email"}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(withdrawal._id)}
                      className="h-8 w-8 p-0 flex items-center justify-center rounded-full hover:bg-gray-100"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {isDropdownOpen[withdrawal._id] && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={closeAllDropdowns}></div>
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-20 py-1 border border-gray-200">
                          <button
                            onClick={() => {
                              closeAllDropdowns()
                              handleEditWithdrawal(withdrawal)
                            }}
                            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              closeAllDropdowns()
                              handleDeleteWithdrawal(withdrawal)
                            }}
                            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-4 pb-2">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">Amount:</span>
                    </div>
                    <span className="font-bold text-gray-900">₹{withdrawal.amount.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">UPI ID:</span>
                    </div>
                    <span className="font-medium text-gray-900">{withdrawal.upiId}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AtSign className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">Account Name:</span>
                    </div>
                    <span className="font-medium text-gray-900">{withdrawal.accountHolderName}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">Date:</span>
                    </div>
                    <span className="font-medium text-gray-900">{formatDate(withdrawal.createdAt)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">Time:</span>
                    </div>
                    <span className="font-medium text-gray-900">{formatTime(withdrawal.createdAt)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-gray-500">Status:</span>
                    {getStatusBadge(withdrawal.status)}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-2 border-t mt-2">
                {withdrawal.status === "pending" ? (
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => handleApprove(withdrawal)}
                      className="flex-1 py-2 px-3 rounded-md bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(withdrawal)}
                      className="flex-1 py-2 px-3 rounded-md bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 flex items-center justify-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                ) : (
                  <div className="text-sm">
                    {withdrawal.status === "approved" && (
                      <div className="text-green-700 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>
                          {withdrawal.transactionId ? `Approved (ID: ${withdrawal.transactionId})` : "Approved"}
                        </span>
                      </div>
                    )}
                    {withdrawal.status === "rejected" && (
                      <div className="text-red-700 flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        <span>
                          {withdrawal.rejectionReason ? `Rejected: ${withdrawal.rejectionReason}` : "Rejected"}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Approve/Reject */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">
                {modalAction === "approve" ? "Approve Withdrawal" : "Reject Withdrawal"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {modalAction === "approve"
                  ? "Confirm the approval of this withdrawal request."
                  : "Provide a reason for rejecting this withdrawal request."}
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-2 p-4 bg-gray-100 rounded-lg text-sm mb-4">
                <div>
                  <p className="text-gray-500">User:</p>
                  <p className="font-medium">{selectedWithdrawal?.userName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Amount:</p>
                  <p className="font-medium">₹{selectedWithdrawal?.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-500">UPI ID:</p>
                  <p className="font-medium">{selectedWithdrawal?.upiId}</p>
                </div>
                <div>
                  <p className="text-gray-500">Account Name:</p>
                  <p className="font-medium">{selectedWithdrawal?.accountHolderName}</p>
                </div>
              </div>

              {modalAction === "approve" ? (
                <div className="mb-4">
                  <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction ID (Optional)
                  </label>
                  <input
                    id="transactionId"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ) : (
                <div className="mb-4">
                  <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Rejection
                  </label>
                  <textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection"
                    rows={3}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="p-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={isProcessing || (modalAction === "reject" && !rejectionReason)}
                className={`px-4 py-2 rounded-md text-white flex items-center ${
                  modalAction === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                } ${
                  isProcessing || (modalAction === "reject" && !rejectionReason) ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : modalAction === "approve" ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" /> Confirm Approval
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" /> Confirm Rejection
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Withdrawal Dialog */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Edit Withdrawal</h2>
              <p className="text-sm text-gray-500 mt-1">Make changes to the withdrawal information here.</p>
            </div>
            {editWithdrawal && (
              <div className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                    <label htmlFor="userName" className="text-sm font-medium sm:text-right">
                      User Name
                    </label>
                    <input
                      id="userName"
                      value={editWithdrawal.userName || ""}
                      onChange={(e) => setEditWithdrawal({ ...editWithdrawal, userName: e.target.value })}
                      className="col-span-1 sm:col-span-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                    <label htmlFor="userEmail" className="text-sm font-medium sm:text-right">
                      User Email
                    </label>
                    <input
                      id="userEmail"
                      value={editWithdrawal.userEmail || ""}
                      onChange={(e) => setEditWithdrawal({ ...editWithdrawal, userEmail: e.target.value })}
                      className="col-span-1 sm:col-span-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                    <label htmlFor="amount" className="text-sm font-medium sm:text-right">
                      Amount
                    </label>
                    <input
                      id="amount"
                      type="number"
                      value={editWithdrawal.amount}
                      onChange={(e) =>
                        setEditWithdrawal({ ...editWithdrawal, amount: Number.parseFloat(e.target.value) })
                      }
                      className="col-span-1 sm:col-span-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                    <label htmlFor="upiId" className="text-sm font-medium sm:text-right">
                      UPI ID
                    </label>
                    <input
                      id="upiId"
                      value={editWithdrawal.upiId || ""}
                      onChange={(e) => setEditWithdrawal({ ...editWithdrawal, upiId: e.target.value })}
                      className="col-span-1 sm:col-span-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                    <label htmlFor="accountHolderName" className="text-sm font-medium sm:text-right">
                      Account Name
                    </label>
                    <input
                      id="accountHolderName"
                      value={editWithdrawal.accountHolderName || ""}
                      onChange={(e) => setEditWithdrawal({ ...editWithdrawal, accountHolderName: e.target.value })}
                      className="col-span-1 sm:col-span-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                    <label htmlFor="status" className="text-sm font-medium sm:text-right">
                      Status
                    </label>
                    <div className="col-span-1 sm:col-span-3 relative">
                      <select
                        id="status"
                        value={editWithdrawal.status}
                        onChange={(e) => setEditWithdrawal({ ...editWithdrawal, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="p-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setIsEditDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold">Are you sure?</h2>
              <p className="text-gray-500 mt-2">
                This action cannot be undone. This will permanently delete the withdrawal record from the database.
              </p>
            </div>
            <div className="p-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminWithdrawalManagement
