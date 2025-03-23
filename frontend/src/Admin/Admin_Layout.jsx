"use client"

import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import Admin_Navbar from "./Admin_Navbar"
import Sidebar from "./Sidebar"
// import Sidebar from "./Sidebar"
// import Admin_Navbar from "./Admin_Navbar"

const Admin_Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  // Close sidebar on window resize (for better mobile experience)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && isSidebarOpen) {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isSidebarOpen])

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar with improved functionality */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Admin_Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Page Content - scrollable area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay - only shows when sidebar is open on mobile */}
      {isSidebarOpen && <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10" onClick={toggleSidebar} />}
    </div>
  )
}

export default Admin_Layout

