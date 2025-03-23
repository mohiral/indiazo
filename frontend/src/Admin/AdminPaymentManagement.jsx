"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { CheckCircle, XCircle, MoreVertical, Pencil, RefreshCw, Search, Trash2, AlertCircle } from "lucide-react"

const AdminPaymentManagement = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [editPayment, setEditPayment] = useState(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [paymentToDelete, setPaymentToDelete] = useState(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState({})

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get("https://backend.indiazo.com/api/admin/all-payments")
      setPayments(response.data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching payments:", error)
      setError("Failed to load payments. Please try again later.")
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (paymentId, status) => {
    try {
      const response = await axios.put(`https://backend.indiazo.com/api/admin/update-payment/${paymentId}`, {
        status,
      })
      if (response.status === 200) {
        fetchPayments()
      } else {
        throw new Error("Unexpected response status")
      }
    } catch (error) {
      console.error("Error updating payment status:", error)
      alert(`Failed to update payment status: ${error.response?.data?.message || error.message}`)
    }
  }

  const handleEditPayment = (payment) => {
    setEditPayment({ ...payment })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    try {
      // Use the new update-payment endpoint
      const response = await axios.put(`https://backend.indiazo.com/api/admin/update-payment/${editPayment._id}`, {
        userName: editPayment.userName,
        userEmail: editPayment.userEmail,
        userId: editPayment.userId,
        amount: editPayment.amount,
        utr: editPayment.utr,
        upiId: editPayment.upiId,
        status: editPayment.status,
      })

      if (response.status === 200) {
        setIsEditDialogOpen(false)
        fetchPayments()
      }
    } catch (error) {
      console.error("Error updating payment:", error)
      alert(`Failed to update payment: ${error.response?.data?.message || error.message}`)
    }
  }

  const handleDeletePayment = (payment) => {
    setPaymentToDelete(payment)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      // Use the new delete-payment endpoint
      const response = await axios.delete(`https://backend.indiazo.com/api/admin/delete-payment/${paymentToDelete._id}`)

      if (response.status === 200) {
        setIsDeleteDialogOpen(false)
        // Remove from local state
        setPayments(payments.filter((p) => p._id !== paymentToDelete._id))
      }
    } catch (error) {
      console.error("Error deleting payment:", error)
      alert(`Failed to delete payment: ${error.response?.data?.message || error.message}`)
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

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.utr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.upiId?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || payment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>
      case "confirmed":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Confirmed</span>
      case "rejected":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Rejected</span>
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Payment Management</h1>
          <button
            disabled
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-500 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading...
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 pb-2">
                <div className="h-4 w-3/4 mb-2 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="px-4 pb-2">
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="p-4 pt-2">
                <div className="h-8 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700 font-bold text-lg mb-2">
            <AlertCircle className="h-5 w-5" />
            Error Loading Payments
          </div>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchPayments}
            className="mt-4 px-4 py-2 border border-red-300 rounded-md text-red-700 hover:bg-red-100"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Payment Management</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-[180px] px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <button
            onClick={fetchPayments}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {filteredPayments.length === 0 ? (
        <div className="w-full bg-white rounded-lg shadow-md">
          <div className="flex flex-col items-center justify-center py-10">
            <div className="rounded-full bg-gray-100 p-3 mb-3">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold">No payments found</h3>
            <p className="text-gray-500 text-center mt-1">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPayments.map((payment) => (
            <div key={payment._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{payment.userName || "Unknown User"}</h3>
                    <p className="text-sm text-gray-500">{payment.userId || "No class specified"}</p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(payment._id)}
                      className="h-8 w-8 p-0 flex items-center justify-center rounded-full hover:bg-gray-100"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {isDropdownOpen[payment._id] && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={closeAllDropdowns}></div>
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-20 py-1 border border-gray-200">
                          <button
                            onClick={() => {
                              closeAllDropdowns()
                              handleEditPayment(payment)
                            }}
                            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              closeAllDropdowns()
                              handleDeletePayment(payment)
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
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount:</span>
                    <span className="font-medium">₹{payment.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">UTR:</span>
                    <span className="font-medium">{payment.utr || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">UPI ID:</span>
                    <span className="font-medium">{payment.upiId || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span className="font-medium">{new Date(payment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-gray-500">Status:</span>
                    {getStatusBadge(payment.status)}
                  </div>
                </div>
              </div>
              <div className="p-4 pt-2">
                {payment.status === "pending" ? (
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => handleUpdateStatus(payment._id, "confirmed")}
                      className="flex-1 py-2 px-3 rounded-md bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(payment._id, "rejected")}
                      className="flex-1 py-2 px-3 rounded-md bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 flex items-center justify-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(payment._id, "pending")}
                    className="w-full py-2 px-3 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                  >
                    Reset to Pending
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Payment Dialog */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Edit Payment</h2>
              <p className="text-sm text-gray-500 mt-1">Make changes to the payment information here.</p>
            </div>
            {editPayment && (
              <div className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                    <label htmlFor="userName" className="text-sm font-medium sm:text-right">
                      User Name
                    </label>
                    <input
                      id="userName"
                      value={editPayment.userName || ""}
                      onChange={(e) => setEditPayment({ ...editPayment, userName: e.target.value })}
                      className="col-span-1 sm:col-span-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                    <label htmlFor="className" className="text-sm font-medium sm:text-right">
                      userId
                    </label>
                    <input
                      id="className"
                      value={editPayment.userId || ""}
                      onChange={(e) => setEditPayment({ ...editPayment, userId: e.target.value })}
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
                      value={editPayment.amount}
                      onChange={(e) => setEditPayment({ ...editPayment, amount: Number.parseFloat(e.target.value) })}
                      className="col-span-1 sm:col-span-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                    <label htmlFor="utr" className="text-sm font-medium sm:text-right">
                      UTR
                    </label>
                    <input
                      id="utr"
                      value={editPayment.utr || ""}
                      onChange={(e) => setEditPayment({ ...editPayment, utr: e.target.value })}
                      className="col-span-1 sm:col-span-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                    <label htmlFor="upiId" className="text-sm font-medium sm:text-right">
                      UPI ID
                    </label>
                    <input
                      id="upiId"
                      value={editPayment.upiId || ""}
                      onChange={(e) => setEditPayment({ ...editPayment, upiId: e.target.value })}
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
                        value={editPayment.status}
                        onChange={(e) => setEditPayment({ ...editPayment, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
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
                This action cannot be undone. This will permanently delete the payment record from the database.
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

export default AdminPaymentManagement

