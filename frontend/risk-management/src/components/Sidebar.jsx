// components/Sidebar.jsx
import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Bell,
  BarChart,
  LogOut,
  X,
} from "lucide-react";
import { UserContext } from "../context/UserContext"; // Adjust path as needed

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout, isAuthenticated, userLoading } = useContext(UserContext);

  const navItems = [
    { name: "Dashboard", path: "/home", icon: LayoutDashboard },
    { name: "Portfolio", path: "/portfolio", icon: Briefcase },
    { name: "Alerts", path: "/alerts", icon: Bell },
    { name: "Historical Prices", path: "/historical-prices", icon: BarChart }
  ];

  const handleNavClick = () => {
    // Close sidebar on mobile when nav item is clicked
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Generate user initials for avatar
  const getUserInitials = (user) => {
    if (!user) return "U";
    
    // Try different possible name fields
    const name = user.name || user.fullName || user.firstName || user.email || "";
    
    if (!name) return "U";
    
    // If it's an email, use the part before @
    if (name.includes("@")) {
      const emailName = name.split("@")[0];
      return emailName.charAt(0).toUpperCase();
    }
    
    // Split name and get initials
    const nameParts = name.trim().split(" ");
    if (nameParts.length >= 2) {
      return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
    }
    
    return nameParts[0].charAt(0).toUpperCase();
  };

  // Get display name
  const getDisplayName = (user) => {
    if (!user) return "Guest";
    return user.fullName ||  user.email || "User";
  };

  // Get user email
  const getUserEmail = (user) => {
    if (!user) return "";
    return user.email || "";
  };

  // Generate avatar background color based on initials
  const getAvatarColor = (initials) => {
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500",
      "bg-indigo-500", "bg-red-500", "bg-yellow-500", "bg-teal-500"
    ];
    const charCode = initials.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  const userInitials = getUserInitials(user);
  const displayName = getDisplayName(user);
  const userEmail = getUserEmail(user);
  const avatarColor = getAvatarColor(userInitials);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 w-64 h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header - User Avatar and Name */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-start">
            {/* User Profile Section */}
            <div className="flex flex-col items-center flex-1">
              {/* User Avatar */}
              <div className={`w-16 h-16 ${avatarColor} rounded-full flex items-center justify-center mb-3`}>
                <span className="text-white font-bold text-xl">
                  {userLoading ? "..." : userInitials}
                </span>
              </div>
              
              {/* User Info */}
              <div className="text-center">
                <h2 className="text-lg font-bold text-gray-800 truncate max-w-[180px]">
                  {userLoading ? "Loading..." : displayName}
                </h2>
                {userEmail && (
                  <p className="text-sm text-gray-500 truncate max-w-[180px]">
                    {userEmail}
                  </p>
                )}
              </div>
            </div>
            
            {/* Close button */}
            <button
              onClick={toggleSidebar}
              aria-label="Close sidebar"
              className="lg:hidden p-1 rounded-md hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Navigation - Flexible to fill remaining space */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={name}
              to={path}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>{name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section - Logout Button - Fixed at bottom */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleLogout}
            disabled={userLoading}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>{userLoading ? "Loading..." : "Logout"}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;