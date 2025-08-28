import React, { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "../../components/Sidebar";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Container */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-8 flex items-center flex-shrink-0">
          <button
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            className="p-2 rounded-md hover:bg-gray-100 transition-colors lg:hidden mr-2"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            Risk Management System
          </h1>
        </header>

        {/* Page Content - Flexible height */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;