"use client"

import { useEffect, useRef } from "react"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import {
  FaTachometerAlt,
  FaUserEdit,
  FaJoget,
  FaChalkboardTeacher,
  FaUsersCog,
  FaImages,
  FaMoneyCheckAlt,
  FaCrown,
  FaTimes,
  FaChevronRight,
} from "react-icons/fa"

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const sidebarRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        toggleSidebar()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, toggleSidebar])

  // Handle link click - navigate and close sidebar
  const handleLinkClick = (path) => {
    navigate(path)
    toggleSidebar()
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={() => toggleSidebar()} />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`bg-gradient-to-b from-gray-900 to-gray-800 text-white fixed top-0 left-0 h-full transition-all duration-300 ease-in-out shadow-xl z-30 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-72`}
      >
        <div className="flex flex-col h-full">
          {/* Close button (mobile only) */}
          <button className="absolute top-4 right-4 text-gray-400 hover:text-white md:hidden" onClick={toggleSidebar}>
            <FaTimes size={20} />
          </button>

          {/* Logo and Branding */}
          <div className="flex items-center px-6 py-5 border-b border-gray-700/50 bg-gray-800/50">
            <div className="text-xl font-bold text-red-500 flex items-center">
              <div className="bg-red-500 text-white p-2 rounded-lg shadow-lg">
                <FaUserEdit size={22} />
              </div>
              <span className="ml-3 tracking-wide">Aviator</span>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center px-6 py-4 border-b border-gray-700/50 bg-gray-800/30">
            <div className="relative w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-lg font-semibold shadow-md">
              D
            </div>
            <div className="ml-4">
              <h6 className="text-sm font-medium">Mr. Aviator</h6>
              <span className="text-xs text-gray-400 flex items-center">
                Dinesh <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-2"></span>
              </span>
            </div>
          </div>

          {/* Sidebar Menu */}
          <nav className="flex-grow overflow-y-auto py-4 px-3">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">Main Menu</div>

            <NavLink
              to="/admin"
              onClick={() => handleLinkClick("/admin")}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 my-1 text-gray-300 hover:text-white hover:bg-gray-700/50 transition rounded-lg group ${
                  isActive ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md" : ""
                }`
              }
            >
              <div
                className={`mr-3 ${location.pathname === "/admin" ? "text-white" : "text-gray-400 group-hover:text-white"}`}
              >
                <FaTachometerAlt size={18} />
              </div>
              <span>Dashboard</span>
              <FaChevronRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-xs" />
            </NavLink>

            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mt-6 mb-2">
              Management
            </div>

            <NavLink
              to="AdminPanel"
              onClick={() => handleLinkClick("AdminPanel")}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 my-1 text-gray-300 hover:text-white hover:bg-gray-700/50 transition rounded-lg group ${
                  isActive ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md" : ""
                }`
              }
            >
              <div
                className={`mr-3 ${location.pathname === "/AdminPanel" ? "text-white" : "text-gray-400 group-hover:text-white"}`}
              >
                <FaJoget size={18} />
              </div>
              <span>Game Settings</span>
              <FaChevronRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-xs" />
            </NavLink>

            {/* <NavLink
              to="AdminBidsComponent"
              onClick={() => handleLinkClick("AdminBidsComponent")}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 my-1 text-gray-300 hover:text-white hover:bg-gray-700/50 transition rounded-lg group ${
                  isActive ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md" : ""
                }`
              }
            >
              <div
                className={`mr-3 ${location.pathname === "/AdminBidsComponent" ? "text-white" : "text-gray-400 group-hover:text-white"}`}
              >
                <FaCrown size={18} />
              </div>
              <span>Bids</span>
              <FaChevronRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-xs" />
            </NavLink> */}

            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mt-6 mb-2">Settings</div>

            <NavLink
              to="AdminUpiSettings"
              onClick={() => handleLinkClick("AdminUpiSettings")}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 my-1 text-gray-300 hover:text-white hover:bg-gray-700/50 transition rounded-lg group ${
                  isActive ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md" : ""
                }`
              }
            >
              <div
                className={`mr-3 ${location.pathname === "/AdminUpiSettings" ? "text-white" : "text-gray-400 group-hover:text-white"}`}
              >
                <FaChalkboardTeacher size={18} />
              </div>
              <span>UPI Settings</span>
              <FaChevronRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-xs" />
            </NavLink>

            {/* <NavLink
              to="ResultAdmin"
              onClick={() => handleLinkClick("ResultAdmin")}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 my-1 text-gray-300 hover:text-white hover:bg-gray-700/50 transition rounded-lg group ${
                  isActive ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md" : ""
                }`
              }
            >
              <div
                className={`mr-3 ${location.pathname === "/ResultAdmin" ? "text-white" : "text-gray-400 group-hover:text-white"}`}
              >
                <FaUsersCog size={18} />
              </div>
              <span>Result Admin</span>
              <FaChevronRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-xs" />
            </NavLink> */}

            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mt-6 mb-2">Finances</div>

            <NavLink
              to="AdminPaymentPage"
              onClick={() => handleLinkClick("AdminPaymentPage")}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 my-1 text-gray-300 hover:text-white hover:bg-gray-700/50 transition rounded-lg group ${
                  isActive ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md" : ""
                }`
              }
            >
              <div
                className={`mr-3 ${location.pathname === "/AdminPaymentPage" ? "text-white" : "text-gray-400 group-hover:text-white"}`}
              >
                <FaImages size={18} />
              </div>
              <span>Payments</span>
              <FaChevronRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-xs" />
            </NavLink>

            <NavLink
              to="withdrawals"
              onClick={() => handleLinkClick("withdrawals")}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 my-1 text-gray-300 hover:text-white hover:bg-gray-700/50 transition rounded-lg group ${
                  isActive ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md" : ""
                }`
              }
            >
              <div
                className={`mr-3 ${location.pathname === "/withdrawals" ? "text-white" : "text-gray-400 group-hover:text-white"}`}
              >
                <FaMoneyCheckAlt size={18} />
              </div>
              <span>Withdrawals</span>
              <FaChevronRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-xs" />
            </NavLink>
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-700/50 text-xs text-gray-400">
            © 2025 Aviator Admin Panel
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar

