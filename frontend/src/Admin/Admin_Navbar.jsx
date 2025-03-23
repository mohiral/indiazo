import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBars, 
  FaEnvelope, 
  FaBell, 
  FaUserEdit, 
  FaSearch, 
  FaCog, 
  FaUser, 
  FaSignOutAlt,
  FaTimes
} from 'react-icons/fa';

const Admin_Navbar = ({ isSidebarOpen, toggleSidebar }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
      if (searchRef.current && !searchRef.current.contains(event.target) && searchOpen) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchOpen]);

  const toggleMenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and toggle */}
          <div className="flex items-center">
            <button
              className="text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 p-1 rounded-md transition-all duration-200 transform hover:scale-110"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <FaBars size={20} />
            </button>
            
            <Link to="/" className="ml-4 flex items-center">
              <div className="bg-red-500 text-white p-1.5 rounded-lg shadow-lg">
                <FaUserEdit size={18} />
              </div>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">
                Aviator
              </span>
            </Link>
          </div>

          {/* Center - Search */}
          <div className="hidden md:block flex-1 max-w-md mx-4" ref={searchRef}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="search"
                placeholder="Search..."
                className="w-full bg-gray-700/50 border border-gray-600 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Mobile search button */}
          <div className="md:hidden">
            <button 
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-gray-300 hover:text-white p-1 rounded-full"
            >
              {searchOpen ? <FaTimes /> : <FaSearch />}
            </button>
          </div>

          {/* Right side - Notifications and Profile */}
          <div className="flex items-center space-x-1 sm:space-x-4" ref={menuRef}>
            {/* Messages Dropdown */}
            

            

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                className="flex items-center space-x-2 text-gray-300 hover:text-white focus:outline-none p-1"
                onClick={() => toggleMenu('profile')}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white shadow-md border-2 border-gray-700">
                  <span className="font-medium text-sm">D</span>
                </div>
                <span className="hidden md:inline text-sm font-medium">Dinesh Saini</span>
              </button>
              
              {openMenu === 'profile' && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden transform origin-top-right transition-all duration-200 z-50">
                  <div className="px-4 py-3 border-b border-gray-700 bg-gray-900/50 text-center">
                    <p className="text-sm font-medium">Admin User</p>
                    <p className="text-xs text-gray-400">admin@matka.com</p>
                  </div>
                  
                  <Link to="#" className="flex items-center px-4 py-2 text-sm hover:bg-gray-700/50 transition-colors duration-150">
                    <FaUser className="mr-3 text-gray-400" />
                    My Profile
                  </Link>
                  
                  <Link to="#" className="flex items-center px-4 py-2 text-sm hover:bg-gray-700/50 transition-colors duration-150">
                    <FaCog className="mr-3 text-gray-400" />
                    Settings
                  </Link>
                  
                  <div className="border-t border-gray-700"></div>
                  
                  <Link to="/login" className="flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700/50 transition-colors duration-150">
                    <FaSignOutAlt className="mr-3" />
                    Log Out
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Search - Expandable */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3 pt-1 bg-gray-800/90 border-t border-gray-700">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Search..."
              className="w-full bg-gray-700/50 border border-gray-600 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Admin_Navbar;
