"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
  FaPlus,
  FaCheck,
  FaTimes,
  FaQrcode,
  FaUser,
  FaToggleOn,
  FaToggleOff,
  FaTrash,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCalendarAlt,
  FaSyncAlt,
} from "react-icons/fa"

const AdminUpiSettings = () => {
  const [upiSettings, setUpiSettings] = useState([])
  const [newUpiId, setNewUpiId] = useState("")
  const [newName, setNewName] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formSubmitting, setFormSubmitting] = useState(false)

  useEffect(() => {
    fetchUpiSettings()
  }, [])

  const fetchUpiSettings = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get("https://backend.indiazo.com/api/upi-settings")
      setUpiSettings(response.data)
      setError("")
    } catch (error) {
      console.error("Error fetching UPI settings:", error)
      setError("Failed to load UPI settings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormSubmitting(true)
    setError("")
    setSuccess("")

    try {
      await axios.post("https://backend.indiazo.com/api/upi-settings", {
        upiId: newUpiId,
        name: newName,
        isActive,
      })
      setSuccess("UPI settings added successfully")
      setNewUpiId("")
      setNewName("")
      setIsActive(true)
      fetchUpiSettings()
    } catch (error) {
      console.error("Error adding UPI settings:", error)
      setError("Failed to add UPI settings")
    } finally {
      setFormSubmitting(false)
    }
  }

  const toggleActive = async (id, currentStatus) => {
    try {
      await axios.put(`https://backend.indiazo.com/api/upi-settings/${id}`, {
        isActive: !currentStatus,
      })
      setSuccess("UPI status updated successfully")
      fetchUpiSettings()
    } catch (error) {
      console.error("Error updating UPI status:", error)
      setError("Failed to update UPI status")
    }
  }

  const deleteUpiSetting = async (id) => {
    if (!window.confirm("Are you sure you want to delete this UPI setting?")) {
      return
    }

    try {
      await axios.delete(`https://backend.indiazo.com/api/upi-settings/${id}`)
      setSuccess("UPI setting deleted successfully")
      fetchUpiSettings()
    } catch (error) {
      console.error("Error deleting UPI setting:", error)
      setError("Failed to delete UPI setting")
    }
  }

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center">
            <FaQrcode className="mr-3 text-red-500" />
            <span>UPI Settings Management</span>
          </h1>
          <p className="text-gray-600 mt-2">Configure and manage UPI payment options for your application</p>
        </div>

        {/* Notification Messages */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md flex items-center animate-fadeIn">
            <FaExclamationTriangle className="mr-2" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md flex items-center animate-fadeIn">
            <FaCheckCircle className="mr-2" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add New UPI Form */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-200 flex items-center">
              <FaPlus className="mr-2 text-green-500" />
              Add New UPI
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label htmlFor="upiId" className="block text-gray-700 font-medium mb-2">
                  UPI ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaQrcode className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="upiId"
                    value={newUpiId}
                    onChange={(e) => setNewUpiId(e.target.value)}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="example@ybl"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Enter a valid UPI ID in the format username@provider</p>
              </div>

              <div className="mb-5">
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                  Display Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="LocalMart"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">This name will be displayed to users during payment</p>
              </div>

              <div className="mb-6">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="sr-only"
                    />
                    <div className="block bg-gray-200 w-14 h-8 rounded-full"></div>
                    <div
                      className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${isActive ? "transform translate-x-6 bg-green-500" : ""}`}
                    ></div>
                  </div>
                  <span className="ml-3 text-gray-700 font-medium">Set as active UPI</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-16">Only one UPI can be active at a time</p>
              </div>

              <button
                type="submit"
                className={`w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center ${formSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
                disabled={formSubmitting}
              >
                {formSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <FaPlus className="mr-2" />
                    Add UPI
                  </>
                )}
              </button>
            </form>
          </div>

          {/* UPI Settings List */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-200">
              <h2 className="text-xl font-semibold flex items-center">
                <FaQrcode className="mr-2 text-blue-500" />
                Manage UPI Settings
              </h2>
              <button
                onClick={fetchUpiSettings}
                className="text-blue-500 hover:text-blue-700 flex items-center text-sm"
                disabled={isLoading}
              >
                <FaSyncAlt className={`mr-1 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <FaSpinner className="animate-spin text-red-500 text-2xl mr-2" />
                <p className="text-gray-500">Loading UPI settings...</p>
              </div>
            )}

            {!isLoading && upiSettings.length === 0 && (
              <div className="bg-gray-50 rounded-lg p-8 text-center border border-dashed border-gray-300">
                <FaQrcode className="mx-auto text-gray-400 text-4xl mb-3" />
                <p className="text-gray-500">No UPI settings found</p>
                <p className="text-sm text-gray-400 mt-1">Add your first UPI setting using the form</p>
              </div>
            )}

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {upiSettings.map((setting) => (
                <div
                  key={setting._id}
                  className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                    setting.isActive ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-blue-200"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="overflow-hidden">
                      <div className="flex items-center">
                        <FaQrcode className={`mr-2 ${setting.isActive ? "text-green-500" : "text-gray-400"}`} />
                        <p className="font-semibold text-gray-800">{setting.upiId}</p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 flex items-center">
                        <FaUser className="mr-1 text-gray-400" /> {setting.name}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-600 mr-2">Status:</span>
                        {setting.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FaCheck className="mr-1" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <FaTimes className="mr-1" /> Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2 flex items-center">
                        <FaCalendarAlt className="mr-1" />
                        Added on: {new Date(setting.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => toggleActive(setting._id, setting.isActive)}
                        className={`px-3 py-2 rounded-md text-sm flex items-center justify-center ${
                          setting.isActive
                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {setting.isActive ? (
                          <>
                            <FaToggleOff className="mr-1" /> Deactivate
                          </>
                        ) : (
                          <>
                            <FaToggleOn className="mr-1" /> Activate
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => deleteUpiSetting(setting._id)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 flex items-center justify-center"
                        disabled={setting.isActive}
                        title={setting.isActive ? "Cannot delete active UPI" : "Delete UPI"}
                      >
                        <FaTrash className="mr-1" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminUpiSettings

