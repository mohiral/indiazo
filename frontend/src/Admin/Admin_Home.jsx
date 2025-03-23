"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { motion } from "framer-motion"
import {
  Users,
  CreditCard,
  ArrowDownToLine,
  TrendingUp,
  Activity,
  DollarSign,
  Calendar,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Shield,
  User,
  Settings,
  LogOut,
  Smartphone,
  Phone,
  Edit,
  Trash,
  RefreshCw,
  Star,
  UserCheck,
  UserX,
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

const AdminDashboard = () => {
  // State for different data types
  const [users, setUsers] = useState([])
  const [payments, setPayments] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false)
  const [dateFilter, setDateFilter] = useState("today")
  const [refreshing, setRefreshing] = useState(false)
  const [notification, setNotification] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedSection, setExpandedSection] = useState(null)
  const [editUserForm, setEditUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    role: "",
    status: "",
    permissions: {},
  })

  useEffect(() => {
    fetchData()
  }, [dateFilter])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch all required data in parallel
      const [usersRes, paymentsRes, withdrawalsRes] = await Promise.all([
        axios.get("https://backend.indiazo.com/api/users"),
        axios.get("https://backend.indiazo.com/api/admin/all-payments"),
        axios.get("https://backend.indiazo.com/api/admin/all-withdrawals"),
      ])

      // Add role and status information to users for demo purposes
      const enhancedUsers = usersRes.data.map((user) => ({
        ...user,
        role: user.isAdmin ? "Admin" : user.isVIP ? "VIP User" : "Regular User",
        status: user.isLoggedIn ? "Active" : "Inactive",
        kycStatus: Math.random() > 0.7 ? "Verified" : Math.random() > 0.5 ? "Pending" : "Not Submitted",
        location:
          user.location ||
          ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad"][Math.floor(Math.random() * 6)],
        phone: user.phone || "+91 " + Math.floor(Math.random() * 9000000000 + 1000000000),
        loginCount: user.loginCount || Math.floor(Math.random() * 100),
        deviceType: user.deviceType || (Math.random() > 0.7 ? "Mobile" : "Desktop"),
      }))

      setUsers(enhancedUsers)
      setPayments(paymentsRes.data)
      setWithdrawals(withdrawalsRes.data)
      setError(null)
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError("Failed to fetch dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    try {
      await fetchData()
      showNotification("Data refreshed successfully", "success")
    } catch (error) {
      console.error("Error refreshing data:", error)
      showNotification("Failed to refresh data", "error")
    } finally {
      setRefreshing(false)
    }
  }

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  // Filter data based on date filter
  const filterDataByDate = (data) => {
    if (dateFilter === "all") return data

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    return data.filter((item) => {
      const itemDate = new Date(item.createdAt)
      itemDate.setHours(0, 0, 0, 0)

      if (dateFilter === "today") {
        return itemDate.getTime() === today.getTime()
      } else if (dateFilter === "yesterday") {
        return itemDate.getTime() === yesterday.getTime()
      } else if (dateFilter === "week") {
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        return itemDate >= weekAgo
      }
      return true
    })
  }

  // Calculate statistics for the filtered data
  const filteredUsers = filterDataByDate(users)
  const filteredPayments = filterDataByDate(payments)
  const filteredWithdrawals = filterDataByDate(withdrawals)

  // Toggle section expansion
  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null)
    } else {
      setExpandedSection(section)
    }
  }

  // Calculate statistics
  const totalUsers = filteredUsers.length
  const activeUsers = filteredUsers.filter((user) => user.status === "Active").length
  const newUsersToday = users.filter((user) => {
    const createdDate = new Date(user.createdAt)
    const today = new Date()
    return createdDate.toDateString() === today.toDateString()
  }).length

  const totalDeposits = filteredPayments
    .filter((payment) => payment.transactionType === "deposit" && payment.status === "confirmed")
    .reduce((sum, payment) => sum + payment.amount, 0)

  const totalWithdrawals = filteredPayments
    .filter((payment) => payment.transactionType === "withdrawal" && payment.status === "confirmed")
    .reduce((sum, payment) => sum + Math.abs(payment.amount), 0)

  const pendingWithdrawals = filteredWithdrawals
    .filter((withdrawal) => withdrawal.status === "pending")
    .reduce((sum, withdrawal) => sum + withdrawal.amount, 0)

  const pendingWithdrawalCount = filteredWithdrawals.filter((withdrawal) => withdrawal.status === "pending").length

  const recentTransactions = [...filteredPayments]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  const recentUsers = [...filteredUsers].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)

  // Calculate user statistics by role
  const usersByRole = filteredUsers.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1
    return acc
  }, {})

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format date with options for different formats
  const formatDate = (dateString, format = "full") => {
    if (!dateString) return "N/A"

    const date = new Date(dateString)

    switch (format) {
      case "short":
        return date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        })
      case "time":
        return date.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      case "datetime":
        return date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      case "relative":
        const now = new Date()
        const diffMs = now - date
        const diffSec = Math.floor(diffMs / 1000)
        const diffMin = Math.floor(diffSec / 60)
        const diffHour = Math.floor(diffMin / 60)
        const diffDay = Math.floor(diffHour / 24)

        if (diffDay > 0) {
          return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`
        } else if (diffHour > 0) {
          return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`
        } else if (diffMin > 0) {
          return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`
        } else {
          return "Just now"
        }
      default:
        return date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
    }
  }

  // Get transaction status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </span>
        )
      case "pending":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        )
      case "rejected":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        )
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>
    }
  }

  // Get transaction type badge
  const getTypeBadge = (type) => {
    switch (type) {
      case "deposit":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center">
            <ArrowDownToLine className="w-3 h-3 mr-1" />
            Deposit
          </span>
        )
      case "withdrawal":
        return (
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium flex items-center">
            <CreditCard className="w-3 h-3 mr-1" />
            Withdrawal
          </span>
        )
      case "game_win":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            Game Win
          </span>
        )
      case "game_loss":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center">
            <Activity className="w-3 h-3 mr-1" />
            Game Loss
          </span>
        )
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{type}</span>
    }
  }

  // Get user role badge
  const getRoleBadge = (role) => {
    switch (role) {
      case "Admin":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center">
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </span>
        )
      case "VIP User":
        return (
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium flex items-center">
            <Star className="w-3 h-3 mr-1" />
            VIP
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center">
            <User className="w-3 h-3 mr-1" />
            Regular
          </span>
        )
    }
  }

  // Get user status badge
  const getUserStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center">
            <UserCheck className="w-3 h-3 mr-1" />
            Active
          </span>
        )
      case "Inactive":
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium flex items-center">
            <UserX className="w-3 h-3 mr-1" />
            Inactive
          </span>
        )
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>
    }
  }

  // Get KYC status badge
  const getKycStatusBadge = (status) => {
    switch (status) {
      case "Verified":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </span>
        )
      case "Pending":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            Not Submitted
          </span>
        )
    }
  }

  // Handle user view
  const handleViewUser = (user) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  // Handle user edit - Fetch fresh data from MongoDB
  const handleEditUser = async (user) => {
    try {
      // Fetch the latest user data from MongoDB
      const response = await axios.get(`https://backend.indiazo.com/api/users/${user.userId}`)

      if (response.status === 200) {
        const userData = response.data
        console.log("Fetched user data:", userData)
        setSelectedUser(userData)

        // Set the form with the latest data
        setEditUserForm({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.userId || "", // Use userId as phone if phone is missing
          location: userData.location || "",
          role: userData.isAdmin ? "Admin" : userData.isVIP ? "VIP User" : "Regular User",
          status: userData.isLoggedIn ? "Active" : "Inactive",
          permissions: {
            canWithdraw: userData.permissions?.canWithdraw !== false,
            canDeposit: userData.permissions?.canDeposit !== false,
            canPlay: userData.permissions?.canPlay !== false,
            isRestricted: userData.isRestricted || false,
          },
        })

        setShowEditUserModal(true)
      } else {
        throw new Error("Failed to fetch user data")
      }
    } catch (error) {
      console.error("Error fetching user data for edit:", error)
      showNotification("Failed to load user data", "error")

      // Fallback to using the data we already have
      setSelectedUser(user)
      setEditUserForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.userId || "", // Use userId as phone if phone is missing
        location: user.location || "",
        role: user.role || "Regular User",
        status: user.status || "Active",
        permissions: { ...user.permissions } || {
          canWithdraw: true,
          canDeposit: true,
          canPlay: true,
          isRestricted: false,
        },
      })
      setShowEditUserModal(true)
    }
  }

  // Handle user delete
  const handleDeleteUser = (user) => {
    setSelectedUser(user)
    setShowDeleteUserModal(true)
  }

  // Handle edit form change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target
    setEditUserForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle permission toggle
  const handlePermissionToggle = (permission) => {
    setEditUserForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission],
      },
    }))
  }

  // Save user edit to MongoDB
  const saveUserEdit = async () => {
    try {
      // Prepare the data to send to the server
      const userData = {
        userId: selectedUser.userId,
        name: editUserForm.name,
        email: editUserForm.email,
        phone: editUserForm.phone,
        location: editUserForm.location,
        password: selectedUser.password || "defaultpassword", // Use the password from selectedUser
        clientId: selectedUser.clientId || "",
        isLoggedIn: editUserForm.status === "Active",
        isAdmin: editUserForm.role === "Admin",
        isVIP: editUserForm.role === "VIP User",
        isRestricted: editUserForm.permissions.isRestricted,
        permissions: {
          canWithdraw: editUserForm.permissions.canWithdraw,
          canDeposit: editUserForm.permissions.canDeposit,
          canPlay: editUserForm.permissions.canPlay,
        },
      }

      console.log("Sending user data to server:", userData)

      // Call the API to update the user
      const response = await axios.post("https://backend.indiazo.com/api/users", userData)

      if (response.status === 200) {
        // Update the local state
        const updatedUsers = users.map((user) => {
          if (user.userId === selectedUser.userId) {
            return {
              ...user,
              ...userData,
              role: userData.isAdmin ? "Admin" : userData.isVIP ? "VIP User" : "Regular User",
              status: userData.isLoggedIn ? "Active" : "Inactive",
            }
          }
          return user
        })

        setUsers(updatedUsers)
        setShowEditUserModal(false)
        showNotification("User updated successfully", "success")

        // If the user being edited is also the selected user in the detail modal
        if (showUserModal) {
          setSelectedUser({
            ...selectedUser,
            ...userData,
            role: userData.isAdmin ? "Admin" : userData.isVIP ? "VIP User" : "Regular User",
            status: userData.isLoggedIn ? "Active" : "Inactive",
          })
        }
      } else {
        throw new Error("Failed to update user")
      }
    } catch (error) {
      console.error("Error updating user:", error)
      showNotification("Failed to update user", "error")
    }
  }

  // Confirm user delete
  const confirmDeleteUser = async () => {
    try {
      // Call the API to delete the user
      const response = await axios.delete(`https://backend.indiazo.com/api/users/${selectedUser.userId}`)

      if (response.status === 200) {
        // Update the local state
        const updatedUsers = users.filter((user) => user.userId !== selectedUser.userId)
        setUsers(updatedUsers)
        setShowDeleteUserModal(false)
        setShowUserModal(false) // Close the user detail modal if open
        showNotification("User deleted successfully", "success")
      } else {
        throw new Error("Failed to delete user")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      showNotification("Failed to delete user", "error")
    }
  }

  // Add force logout functionality
  const handleForceLogout = async (user) => {
    try {
      // Call the logout API
      const response = await axios.post("https://backend.indiazo.com/api/users/logout", {
        userId: user.userId,
      })

      if (response.status === 200) {
        // Update the local state
        const updatedUsers = users.map((u) => {
          if (u.userId === user.userId) {
            return {
              ...u,
              isLoggedIn: false,
              status: "Inactive",
            }
          }
          return u
        })

        setUsers(updatedUsers)

        // If this is the selected user, update that too
        if (selectedUser && selectedUser.userId === user.userId) {
          setSelectedUser({
            ...selectedUser,
            isLoggedIn: false,
            status: "Inactive",
          })
        }

        showNotification(`${user.name} has been logged out`, "success")
      } else {
        throw new Error("Failed to logout user")
      }
    } catch (error) {
      console.error("Error logging out user:", error)
      showNotification("Failed to logout user", "error")
    }
  }

  // Add restrict account functionality
  const handleRestrictAccount = async (user) => {
    try {
      // Call the API to restrict the user
      const response = await axios.post("https://backend.indiazo.com/api/users/restrict", {
        userId: user.userId,
        isRestricted: true,
      })

      if (response.status === 200) {
        // Update the local state
        const updatedUsers = users.map((u) => {
          if (u.userId === user.userId) {
            return {
              ...u,
              isRestricted: true,
              permissions: {
                ...u.permissions,
                canWithdraw: false,
                canDeposit: false,
                canPlay: false,
              },
            }
          }
          return u
        })

        setUsers(updatedUsers)

        // If this is the selected user, update that too
        if (selectedUser && selectedUser.userId === user.userId) {
          setSelectedUser({
            ...selectedUser,
            isRestricted: true,
            permissions: {
              ...selectedUser.permissions,
              canWithdraw: false,
              canDeposit: false,
              canPlay: false,
            },
          })
        }

        showNotification(`${user.name}'s account has been restricted`, "success")
      } else {
        throw new Error("Failed to restrict user account")
      }
    } catch (error) {
      console.error("Error restricting user account:", error)
      showNotification("Failed to restrict user account", "error")
    }
  }

  // Handle payment approval
  const handleApprovePayment = async (payment) => {
    try {
      // For withdrawal payments, use the withdraw-specific endpoint
      if (payment.transactionType === "withdrawal") {
        // Find the corresponding withdrawal request
        const withdrawal = withdrawals.find(
          (w) => w.userId === payment.userId && w.amount === Math.abs(payment.amount) && w.status === "pending",
        )

        if (withdrawal) {
          // Call the approve-withdraw endpoint
          await axios.post("https://backend.indiazo.com/api/approve-withdraw", {
            id: withdrawal._id,
          })

          // Update local state
          const updatedWithdrawals = withdrawals.map((w) => {
            if (w._id === withdrawal._id) {
              return { ...w, status: "approved" }
            }
            return w
          })

          setWithdrawals(updatedWithdrawals)
          showNotification("Withdrawal approved successfully", "success")
        }
      } else {
        // For other payment types, use a generic payment approval endpoint
        // In a real app, you would have an endpoint for this
        // For demo purposes, we'll just update the local state
        const updatedPayments = payments.map((p) => {
          if (p._id === payment._id) {
            return { ...p, status: "confirmed" }
          }
          return p
        })

        setPayments(updatedPayments)
        showNotification("Payment approved successfully", "success")
      }
    } catch (error) {
      console.error("Error approving payment:", error)
      showNotification("Failed to approve payment", "error")
    }
  }

  // Handle payment rejection
  const handleRejectPayment = async (payment) => {
    try {
      // For withdrawal payments, use the withdraw-specific endpoint
      if (payment.transactionType === "withdrawal") {
        // Find the corresponding withdrawal request
        const withdrawal = withdrawals.find(
          (w) => w.userId === payment.userId && w.amount === Math.abs(payment.amount) && w.status === "pending",
        )

        if (withdrawal) {
          // Call the reject-withdraw endpoint
          await axios.post("https://backend.indiazo.com/api/reject-withdraw", {
            id: withdrawal._id,
          })

          // Update local state
          const updatedWithdrawals = withdrawals.map((w) => {
            if (w._id === withdrawal._id) {
              return { ...w, status: "rejected" }
            }
            return w
          })

          setWithdrawals(updatedWithdrawals)
          showNotification("Withdrawal rejected successfully", "success")
        }
      } else {
        // For other payment types, use a generic payment rejection endpoint
        // In a real app, you would have an endpoint for this
        // For demo purposes, we'll just update the local state
        const updatedPayments = payments.map((p) => {
          if (p._id === payment._id) {
            return { ...p, status: "rejected" }
          }
          return p
        })

        setPayments(updatedPayments)
        showNotification("Payment rejected successfully", "success")
      }
    } catch (error) {
      console.error("Error rejecting payment:", error)
      showNotification("Failed to reject payment", "error")
    }
  }

  // Handle withdrawal approval
  const handleApproveWithdrawal = async (withdrawal) => {
    try {
      // Call the approve-withdraw endpoint
      await axios.post("https://backend.indiazo.com/api/approve-withdraw", {
        id: withdrawal._id,
      })

      // Update local state
      const updatedWithdrawals = withdrawals.map((w) => {
        if (w._id === withdrawal._id) {
          return { ...w, status: "approved" }
        }
        return w
      })

      setWithdrawals(updatedWithdrawals)
      showNotification("Withdrawal approved successfully", "success")
    } catch (error) {
      console.error("Error approving withdrawal:", error)
      showNotification("Failed to approve withdrawal", "error")
    }
  }

  // Handle withdrawal rejection
  const handleRejectWithdrawal = async (withdrawal) => {
    try {
      // Call the reject-withdraw endpoint
      await axios.post("https://backend.indiazo.com/api/reject-withdraw", {
        id: withdrawal._id,
      })

      // Update local state
      const updatedWithdrawals = withdrawals.map((w) => {
        if (w._id === withdrawal._id) {
          return { ...w, status: "rejected" }
        }
        return w
      })

      setWithdrawals(updatedWithdrawals)
      showNotification("Withdrawal rejected successfully", "success")
    } catch (error) {
      console.error("Error rejecting withdrawal:", error)
      showNotification("Failed to approve withdrawal", "error")
    }
  }

  // Filter users based on search query
  const filteredSearchUsers = filteredUsers.filter((user) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.userId?.toLowerCase().includes(query) ||
      user.phone?.toLowerCase().includes(query) ||
      user.location?.toLowerCase().includes(query)
    )
  })

  // User Detail Modal
  const UserDetailModal = () => {
    if (!selectedUser) return null

    // Calculate user balance
    const userPayments = payments.filter((p) => p.userId === selectedUser.userId && p.status === "confirmed")
    const userBalance = userPayments.reduce((sum, p) => sum + p.amount, 0)

    // Get user transactions
    const userTransactions = payments
      .filter((p) => p.userId === selectedUser.userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)

    // Get user withdrawals
    const userWithdrawals = withdrawals
      .filter((w) => w.userId === selectedUser.userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
            <h3 className="text-xl font-bold text-gray-900">User Details</h3>
            <button onClick={() => setShowUserModal(false)} className="text-gray-500 hover:text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            {/* User Profile Header */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              {/* User Avatar and Basic Info */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {selectedUser.name?.charAt(0) || "U"}
                </div>
              </div>

              <div className="flex-grow">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h2>
                  {getRoleBadge(selectedUser.role)}
                  {getUserStatusBadge(selectedUser.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{selectedUser.userId}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Smartphone className="w-4 h-4 mr-2" />
                    <span>Device: {selectedUser.deviceType}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="px-4 py-2 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-500">User ID</p>
                    <p className="text-sm font-medium text-blue-700 font-mono">{selectedUser.userId}</p>
                  </div>
                  <div className="px-4 py-2 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-500">Balance</p>
                    <p className={`text-sm font-medium ${userBalance >= 0 ? "text-green-700" : "text-red-700"}`}>
                      {formatCurrency(userBalance)}
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-500">Joined</p>
                    <p className="text-sm font-medium text-purple-700">{formatDate(selectedUser.createdAt, "full")}</p>
                  </div>
                  <div className="px-4 py-2 bg-amber-50 rounded-lg">
                    <p className="text-sm text-gray-500">KYC Status</p>
                    <p className="text-sm font-medium text-amber-700">{selectedUser.kycStatus}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs for User Details */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-6">
                <button className="border-b-2 border-blue-500 py-2 px-1 text-sm font-medium text-blue-600">
                  Overview
                </button>
                <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                  Transactions
                </button>
                <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                  Game History
                </button>
                <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                  Settings
                </button>
              </nav>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Deposits</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(
                        userPayments
                          .filter((p) => p.transactionType === "deposit" && p.amount > 0)
                          .reduce((sum, p) => sum + p.amount, 0),
                      )}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <ArrowDownToLine className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Total Withdrawals */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Withdrawals</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(
                        Math.abs(
                          userPayments
                            .filter((p) => p.transactionType === "withdrawal" && p.amount < 0)
                            .reduce((sum, p) => sum + p.amount, 0),
                        ),
                      )}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Game Winnings</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(
                        userPayments
                          .filter((p) => p.transactionType === "game_win")
                          .reduce((sum, p) => sum + p.amount, 0),
                      )}
                    </p>
                  </div>
                  <div className="bg-green-100 p-2 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Login Count</p>
                    <p className="text-lg font-bold text-gray-900">{selectedUser.loginCount}</p>
                  </div>
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <Activity className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* User Permissions */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
              <h4 className="text-lg font-bold text-gray-900 mb-4">User Permissions</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                  className={`p-3 rounded-lg ${selectedUser.permissions?.canWithdraw ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 mr-2 rounded-full ${selectedUser.permissions?.canWithdraw ? "bg-green-500" : "bg-red-500"}`}
                    ></div>
                    <span className="font-medium">Withdrawals</span>
                  </div>
                  <p className="text-xs mt-1">{selectedUser.permissions?.canWithdraw ? "Allowed" : "Restricted"}</p>
                </div>

                <div
                  className={`p-3 rounded-lg ${selectedUser.permissions?.canDeposit ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 mr-2 rounded-full ${selectedUser.permissions?.canDeposit ? "bg-green-500" : "bg-red-500"}`}
                    ></div>
                    <span className="font-medium">Deposits</span>
                  </div>
                  <p className="text-xs mt-1">{selectedUser.permissions?.canDeposit ? "Allowed" : "Restricted"}</p>
                </div>

                <div
                  className={`p-3 rounded-lg ${selectedUser.permissions?.canPlay ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 mr-2 rounded-full ${selectedUser.permissions?.canPlay ? "bg-green-500" : "bg-red-500"}`}
                    ></div>
                    <span className="font-medium">Game Play</span>
                  </div>
                  <p className="text-xs mt-1">{selectedUser.permissions?.canPlay ? "Allowed" : "Restricted"}</p>
                </div>

                <div
                  className={`p-3 rounded-lg ${!selectedUser.isRestricted ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 mr-2 rounded-full ${!selectedUser.isRestricted ? "bg-green-500" : "bg-red-500"}`}
                    ></div>
                    <span className="font-medium">Account Status</span>
                  </div>
                  <p className="text-xs mt-1">{!selectedUser.isRestricted ? "Normal" : "Restricted"}</p>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-bold text-gray-900">Recent Transactions</h4>
                <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
              </div>

              {userTransactions.length > 0 ? (
                <div className="space-y-3">
                  {userTransactions.map((transaction, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">{getTypeBadge(transaction.transactionType)}</div>
                        <div>
                          <p
                            className={`text-sm font-medium ${transaction.amount >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {transaction.amount >= 0 ? "+" : ""}
                            {formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(transaction.createdAt, "datetime")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">{getStatusBadge(transaction.status)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No transactions found</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-end">
              <button
                onClick={() => handleForceLogout(selectedUser)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Force Logout
              </button>
              <button
                onClick={() => handleRestrictAccount(selectedUser)}
                className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 flex items-center"
              >
                <Shield className="w-4 h-4 mr-2" />
                Restrict Account
              </button>
              <button
                onClick={() => {
                  setShowUserModal(false)
                  handleEditUser(selectedUser)
                }}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Details
              </button>
              <button
                onClick={() => {
                  setShowUserModal(false)
                  handleDeleteUser(selectedUser)
                }}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center"
              >
                <Trash className="w-4 h-4 mr-2" />
                Delete Account
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Edit User Modal
  const EditUserModal = () => {
    if (!selectedUser) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
            <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
            <button onClick={() => setShowEditUserModal(false)} className="text-gray-500 hover:text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={editUserForm.name}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editUserForm.email}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={editUserForm.phone}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="text"
                  name="password"
                  value={selectedUser.password || ""}
                  onChange={(e) => {
                    const newPassword = e.target.value
                    setSelectedUser((prev) => ({ ...prev, password: newPassword }))
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={editUserForm.location}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  name="role"
                  value={editUserForm.role}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Regular User">Regular User</option>
                  <option value="VIP User">VIP User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={editUserForm.status}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <input
                  type="text"
                  disabled
                  value={selectedUser.userId || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
            </div>

            {/* Permissions */}
            <div className="mb-6">
              <h4 className="text-md font-bold text-gray-900 mb-3">User Permissions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="canWithdraw"
                    checked={editUserForm.permissions.canWithdraw}
                    onChange={() => handlePermissionToggle("canWithdraw")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="canWithdraw" className="ml-2 block text-sm text-gray-700">
                    Can Withdraw
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="canDeposit"
                    checked={editUserForm.permissions.canDeposit}
                    onChange={() => handlePermissionToggle("canDeposit")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="canDeposit" className="ml-2 block text-sm text-gray-700">
                    Can Deposit
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="canPlay"
                    checked={editUserForm.permissions.canPlay}
                    onChange={() => handlePermissionToggle("canPlay")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="canPlay" className="ml-2 block text-sm text-gray-700">
                    Can Play Games
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isRestricted"
                    checked={editUserForm.permissions.isRestricted}
                    onChange={() => handlePermissionToggle("isRestricted")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isRestricted" className="ml-2 block text-sm text-gray-700">
                    Account Restricted
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEditUserModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button onClick={saveUserEdit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Delete User Modal
  const DeleteUserModal = () => {
    if (!selectedUser) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-xl max-w-md w-full"
        >
          <div className="p-6">
            <div className="flex items-center justify-center mb-4 text-red-600">
              <Trash className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete User Account</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete the account for <span className="font-semibold">{selectedUser.name}</span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteUserModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Notification component
  const NotificationComponent = () => {
    if (!notification) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${notification.type === "success" ? "bg-green-100 border border-green-200" : "bg-red-100 border border-red-200"
          }`}
      >
        <div className="flex items-center">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
              }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
          </div>
          <p className={notification.type === "success" ? "text-green-700" : "text-red-700"}>{notification.message}</p>
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-700 border-l-blue-500 border-r-blue-700 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-red-50 to-pink-100">
        <div className="bg-white border border-red-200 rounded-lg p-6 max-w-md shadow-lg">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
            <h2 className="text-xl font-bold text-red-700">Error Loading Dashboard</h2>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      {notification && <NotificationComponent />}

      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              {/* <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white mr-4">
                <Settings className="w-6 h-6" />
              </div> */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome back, Vijay! Here's what's happening today.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="bg-blue-50 rounded-lg p-2 flex items-center">
                <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-indigo-50 rounded-lg p-2 text-sm font-medium text-gray-700 border border-indigo-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 Days</option>
                <option value="all">All Time</option>
              </select>
              <button
                onClick={refreshData}
                className={`bg-indigo-50 rounded-lg p-2 flex items-center ${refreshing ? "animate-pulse" : ""}`}
              >
                <RefreshCw className={`w-5 h-5 text-indigo-600 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                <span className="text-sm font-medium text-gray-700">
                  {refreshing ? "Refreshing..." : "Refresh Data"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6 p-2">
          <div className="grid grid-cols-2 sm:flex sm:flex-nowrap gap-2">
            {[
              { id: "overview", label: "Overview", Icon: BarChart3 },
              { id: "users", label: "Users", Icon: Users },
              { id: "transactions", label: "Transactions", Icon: DollarSign },
              { id: "withdrawals", label: "Withdrawals", Icon: CreditCard },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${activeTab === id
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-blue-100 hover:scale-105"
                  }`}
              >
                <Icon className={`w-4 h-4 ${activeTab === id ? "text-white" : "text-gray-500"}`} />
                {label}
              </button>
            ))}
          </div>
        </div>


        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Total Users */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2">
                  <p className="text-xs font-medium text-blue-100">TOTAL USERS</p>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{totalUsers}</h3>
                      <p className="text-xs text-green-600 mt-1 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />+{newUsersToday} today
                      </p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Deposits */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2">
                  <p className="text-xs font-medium text-green-100">TOTAL DEPOSITS</p>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{formatCurrency(totalDeposits)}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {
                          filteredPayments.filter((p) => p.transactionType === "deposit" && p.status === "confirmed")
                            .length
                        }{" "}
                        txns
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <ArrowDownToLine className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Withdrawals */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-violet-600 px-4 py-2">
                  <p className="text-xs font-medium text-purple-100">TOTAL WITHDRAWALS</p>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {formatCurrency(totalWithdrawals)}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {
                          filteredPayments.filter((p) => p.transactionType === "withdrawal" && p.status === "confirmed")
                            .length
                        }{" "}
                        txns
                      </p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <CreditCard className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending Withdrawals */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2">
                  <p className="text-xs font-medium text-amber-100">PENDING WITHDRAWALS</p>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {formatCurrency(pendingWithdrawals)}
                      </h3>
                      <p className="text-xs text-amber-600 mt-1">{pendingWithdrawalCount} requests</p>
                    </div>
                    <div className="bg-amber-100 p-3 rounded-lg">
                      <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Collapsible Sections for Mobile */}
            <div className="block md:hidden space-y-4 mb-8">
              {/* Pending Withdrawals Section */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <button
                  className="w-full p-4 flex items-center justify-between bg-amber-50 border-b border-amber-100"
                  onClick={() => toggleSection("withdrawals")}
                >
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-amber-600 mr-2" />
                    <span className="font-medium text-amber-800">Pending Withdrawals</span>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full text-xs font-bold mr-2">
                      {pendingWithdrawalCount}
                    </span>
                    {expandedSection === "withdrawals" ? (
                      <ChevronUp className="w-5 h-5 text-amber-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-amber-600" />
                    )}
                  </div>
                </button>

                {expandedSection === "withdrawals" && (
                  <div className="p-4">
                    {filteredWithdrawals.filter((w) => w.status === "pending").length > 0 ? (
                      <div className="space-y-3">
                        {filteredWithdrawals
                          .filter((w) => w.status === "pending")
                          .slice(0, 3)
                          .map((withdrawal, index) => (
                            <div key={index} className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-gray-900">{withdrawal.userName || "User"}</span>
                                <span className="text-amber-800 font-bold">{formatCurrency(withdrawal.amount)}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>{formatDate(withdrawal.createdAt, "short")}</span>
                                <span className="font-mono">{withdrawal.upiId}</span>
                              </div>
                              <div className="flex justify-end gap-2 mt-2">
                                <button
                                  onClick={() => handleApproveWithdrawal(withdrawal)}
                                  className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-xs"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectWithdrawal(withdrawal)}
                                  className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-xs"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ))}
                        {filteredWithdrawals.filter((w) => w.status === "pending").length > 3 && (
                          <button
                            onClick={() => setActiveTab("withdrawals")}
                            className="w-full text-center text-sm text-blue-600 py-2"
                          >
                            View all {filteredWithdrawals.filter((w) => w.status === "pending").length} requests
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-4">No pending withdrawals</p>
                    )}
                  </div>
                )}
              </div>

              {/* Recent Transactions Section */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <button
                  className="w-full p-4 flex items-center justify-between bg-green-50 border-b border-green-100"
                  onClick={() => toggleSection("transactions")}
                >
                  <div className="flex items-center">
                    <ArrowDownToLine className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-800">Recent Transactions</span>
                  </div>
                  {expandedSection === "transactions" ? (
                    <ChevronUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-green-600" />
                  )}
                </button>

                {expandedSection === "transactions" && (
                  <div className="p-4">
                    {recentTransactions.length > 0 ? (
                      <div className="space-y-3">
                        {recentTransactions.map((transaction, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-gray-900 truncate max-w-[150px]">
                                {transaction.userName || "User"}
                              </span>
                              <span
                                className={`font-medium ${transaction.amount >= 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                {transaction.amount >= 0 ? "+" : ""}
                                {formatCurrency(transaction.amount)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                {formatDate(transaction.createdAt, "short")}
                              </span>
                              {getStatusBadge(transaction.status)}
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => setActiveTab("transactions")}
                          className="w-full text-center text-sm text-blue-600 py-2"
                        >
                          View all transactions
                        </button>
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-4">No transactions found</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:grid md:grid-cols-3 gap-6 mb-8">
              {/* Recent Transactions */}
              <div className="md:col-span-2 bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
                  <button
                    onClick={() => setActiveTab("transactions")}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {recentTransactions.map((transaction, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {transaction.userName?.charAt(0) || "U"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                            {transaction.userName}
                          </p>
                          <p className="text-xs text-gray-500 truncate max-w-[120px]">{transaction.userId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTypeBadge(transaction.transactionType)}
                        <span
                          className={`text-sm font-medium ${transaction.amount >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {transaction.amount >= 0 ? "+" : ""}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(transaction.status)}
                        <span className="text-xs text-gray-500">{formatDate(transaction.createdAt, "short")}</span>
                      </div>
                    </div>
                  ))}
                  {recentTransactions.length === 0 && (
                    <div className="text-center text-gray-500 py-6">No recent transactions found</div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab("withdrawals")}
                    className="w-full flex items-center justify-between p-3 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-3" />
                      <span className="font-medium">Pending Withdrawals</span>
                    </div>
                    <span className="bg-amber-200 text-amber-800 px-2 py-1 rounded-full text-xs font-bold">
                      {pendingWithdrawalCount}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("users")}
                    className="w-full flex items-center p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Users className="w-5 h-5 mr-3" />
                    <span className="font-medium">Manage Users</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("transactions")}
                    className="w-full flex items-center p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <DollarSign className="w-5 h-5 mr-3" />
                    <span className="font-medium">View Transactions</span>
                  </button>

                  <button className="w-full flex items-center p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                    <BarChart3 className="w-5 h-5 mr-3" />
                    <span className="font-medium">Analytics</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Transaction Summary */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Transaction Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Total Deposits</p>
                  <p className="text-xl font-bold text-green-600 mt-1">{formatCurrency(totalDeposits)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {filteredPayments.filter((p) => p.transactionType === "deposit" && p.status === "confirmed").length}{" "}
                    transactions
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Total Withdrawals</p>
                  <p className="text-xl font-bold text-red-600 mt-1">{formatCurrency(totalWithdrawals)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {
                      filteredPayments.filter((p) => p.transactionType === "withdrawal" && p.status === "confirmed")
                        .length
                    }{" "}
                    transactions
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Game Winnings</p>
                  <p className="text-xl font-bold text-green-600 mt-1">
                    {formatCurrency(
                      filteredPayments
                        .filter((p) => p.transactionType === "game_win" && p.status === "confirmed")
                        .reduce((sum, p) => sum + p.amount, 0),
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {
                      filteredPayments.filter((p) => p.transactionType === "game_win" && p.status === "confirmed")
                        .length
                    }{" "}
                    transactions
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Game Losses</p>
                  <p className="text-xl font-bold text-red-600 mt-1">
                    {formatCurrency(
                      Math.abs(
                        filteredPayments
                          .filter((p) => p.transactionType === "game_loss" && p.status === "confirmed")
                          .reduce((sum, p) => sum + p.amount, 0),
                      ),
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {
                      filteredPayments.filter((p) => p.transactionType === "game_loss" && p.status === "confirmed")
                        .length
                    }{" "}
                    transactions
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 md:mb-0">User Management</h3>
                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="relative">
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-8">
                      <option value="all">All Users</option>
                      <option value="active">Active Users</option>
                      <option value="inactive">Inactive Users</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <Filter className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* User Cards - Responsive Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSearchUsers.map((user, index) => {
                  // Calculate user balance
                  const userPayments = payments.filter((p) => p.userId === user.userId && p.status === "confirmed")
                  const userBalance = userPayments.reduce((sum, p) => sum + p.amount, 0)

                  return (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {user.name?.charAt(0) || "U"}
                          </div>
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{user.name}</h4>
                            {getRoleBadge(user.role)}
                          </div>
                          <p className="text-xs text-gray-500 truncate mb-1">{user.userId}</p>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-medium ${userBalance >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {formatCurrency(userBalance)}
                            </span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">{formatDate(user.createdAt, "short")}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {getUserStatusBadge(user.status)}
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            View <ChevronRight className="w-3 h-3 ml-1" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-1.5 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleForceLogout(user)}
                          className="p-1.5 text-xs bg-gray-50 text-gray-700 rounded hover:bg-gray-100"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRestrictAccount(user)}
                          className="p-1.5 text-xs bg-amber-50 text-amber-700 rounded hover:bg-amber-100"
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
                {filteredSearchUsers.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No users found matching your search criteria
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">{filteredSearchUsers.length}</span> of{" "}
                  <span className="font-medium">{filteredUsers.length}</span> users
                </div>
                <div className="flex space-x-2">
                  <button
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    disabled
                  >
                    Previous
                  </button>
                  <button
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    disabled
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 md:mb-0">Transaction History</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="all">All Types</option>
                    <option value="deposit">Deposits</option>
                    <option value="withdrawal">Withdrawals</option>
                    <option value="game_win">Game Wins</option>
                    <option value="game_loss">Game Losses</option>
                  </select>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="all">All Status</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-3">
                {filteredPayments.slice(0, 10).map((transaction, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3 mb-3 md:mb-0">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {transaction.userName?.charAt(0) || "U"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{transaction.userName}</p>
                        <p className="text-xs text-gray-500">{transaction.userEmail}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mb-3 md:mb-0">
                      {getTypeBadge(transaction.transactionType)}
                      <span
                        className={`text-sm font-medium ${transaction.amount >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {transaction.amount >= 0 ? "+" : ""}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-3 md:mb-0">
                      {getStatusBadge(transaction.status)}
                      <span className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-xs">
                        View
                      </button>
                      {transaction.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprovePayment(transaction)}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectPayment(transaction)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-xs"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {filteredPayments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No transactions found</div>
                )}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">10</span> of{" "}
                  <span className="font-medium">{filteredPayments.length}</span> transactions
                </div>
                <div className="flex space-x-2">
                  <button
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    disabled
                  >
                    Previous
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Withdrawals Tab */}
        {activeTab === "withdrawals" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Withdrawal Requests</h3>
                <div className="flex gap-3">
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Withdrawals List */}
              <div className="space-y-3">
                {filteredWithdrawals.map((withdrawal, index) => (
                  <div
                    key={index}
                    className={`flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg ${withdrawal.status === "pending"
                        ? "bg-amber-50 border-amber-200"
                        : "border-gray-100 hover:bg-gray-50"
                      }`}
                  >
                    <div className="flex items-center gap-3 mb-3 md:mb-0">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {withdrawal.userName?.charAt(0) || "U"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{withdrawal.userName}</p>
                        <p className="text-xs text-gray-500">{withdrawal.userEmail}</p>
                      </div>
                    </div>

                    <div className="flex flex-col mb-3 md:mb-0">
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(withdrawal.amount)}</p>
                      <p className="text-xs text-gray-500 font-mono">{withdrawal.upiId}</p>
                    </div>

                    <div className="flex items-center gap-3 mb-3 md:mb-0">
                      {withdrawal.status === "pending" && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </span>
                      )}
                      {withdrawal.status === "approved" && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approved
                        </span>
                      )}
                      {withdrawal.status === "rejected" && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center">
                          <XCircle className="w-3 h-3 mr-1" />
                          Rejected
                        </span>
                      )}
                      <span className="text-xs text-gray-500">{formatDate(withdrawal.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {withdrawal.status === "pending" ? (
                        <>
                          <button
                            onClick={() => handleApproveWithdrawal(withdrawal)}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectWithdrawal(withdrawal)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-xs"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-xs">
                          Details
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {filteredWithdrawals.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No withdrawal requests found</div>
                )}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">{filteredWithdrawals.length}</span> withdrawal requests
                </div>
                <div className="flex space-x-2">
                  <button
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    disabled
                  >
                    Previous
                  </button>
                  <button
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    disabled
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Render modals */}
      {showUserModal && <UserDetailModal />}
      {showEditUserModal && <EditUserModal />}
      {showDeleteUserModal && <DeleteUserModal />}
    </div>
  )
}

export default AdminDashboard

