import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Activity,
  Bell,
  BarChart,
  Settings,
  LogOut,
} from "lucide-react";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Portfolio", path: "/portfolio", icon: Briefcase },
    { name: "Alerts", path: "/alerts", icon: Bell },
    { name: "Historical Prices", path: "/historical-prices", icon: BarChart }
  ];

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out 
      ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
        <button onClick={toggleSidebar} className="lg:hidden text-gray-600">
          ✕
        </button>
      </div>

      {/* Sidebar Navigation */}
      <nav className="mt-4">
        {navItems.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={name}
            to={path}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors ${
                isActive ? "bg-gray-200 font-semibold" : ""
              }`
            }
            onClick={toggleSidebar} // auto close on mobile
          >
            <Icon className="w-5 h-5 mr-3" />
            {name}
          </NavLink>
        ))}
      </nav>

      {/* Logout at bottom */}
      <div className="absolute bottom-0 w-full p-4 border-t">
        <button className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
