import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { 
  Bell, 
  BellRing, 
  CheckCircle, 
  Calendar, 
  AlertCircle,
  TrendingUp,
  Info
} from "lucide-react";

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, read, unread
  const [selectedAlerts, setSelectedAlerts] = useState(new Set());

  // Fetch alerts from backend
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axiosInstance.get(API_PATHS.ALERTS.GET_ALL);
      console.log("Alerts response:", res.data);
      
      // Add read status to alerts (since backend doesn't have it)
      const alertsWithStatus = (res.data || []).map(alert => ({
        ...alert,
        isRead: false, // You can track this in localStorage or add to backend
        type: determineAlertType(alert.message)
      }));
      
      setAlerts(alertsWithStatus);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      setError(error.response?.data?.message || "Failed to fetch alerts");
    } finally {
      setLoading(false);
    }
  };

  // Determine alert type based on message content
  const determineAlertType = (message) => {
    if (message.toLowerCase().includes("price") || message.toLowerCase().includes("target")) {
      return "price";
    } else if (message.toLowerCase().includes("risk")) {
      return "risk";
    } else if (message.toLowerCase().includes("portfolio")) {
      return "portfolio";
    }
    return "info";
  };

  // Mark alert as read
  const markAsRead = (alertId) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert._id === alertId ? { ...alert, isRead: true } : alert
      )
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => ({ ...alert, isRead: true }))
    );
  };

  // Toggle alert selection for bulk operations
  const toggleAlertSelection = (alertId) => {
    const newSelected = new Set(selectedAlerts);
    if (newSelected.has(alertId)) {
      newSelected.delete(alertId);
    } else {
      newSelected.add(alertId);
    }
    setSelectedAlerts(newSelected);
  };

  // Select all alerts
  const selectAll = () => {
    setSelectedAlerts(new Set(filteredAlerts.map(alert => alert._id)));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedAlerts(new Set());
  };

  // Filter alerts based on current filter
  const filteredAlerts = alerts.filter(alert => {
    if (filter === "read") return alert.isRead;
    if (filter === "unread") return !alert.isRead;
    return true;
  });

  // Get alert icon based on type
  const getAlertIcon = (type) => {
    const iconProps = { 
      size: 20, 
      className: 'text-blue-500'
    };

    switch (type) {
      case "price":
        return <TrendingUp {...iconProps} />;
      case "risk":
        return <AlertCircle {...iconProps} />;
      case "portfolio":
        return <Bell {...iconProps} />;
      default:
        return <Info {...iconProps} />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  const alertsContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-lg text-gray-600">Loading alerts...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading alerts</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
          <div className="mt-4">
            <button 
              onClick={fetchAlerts}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <BellRing className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">🔔 Alerts</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Stay updated with your portfolio notifications
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button 
                onClick={fetchAlerts}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <BellRing className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unread Alerts</p>
                <p className="text-2xl font-bold text-red-900">{unreadCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-1">
              {["all", "unread", "read"].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    filter === filterOption
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                  {filterOption === "unread" && unreadCount > 0 && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {selectedAlerts.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedAlerts.size} selected
                </span>
                <button
                  onClick={clearSelection}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Alerts List */}
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <Bell className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {filter === "all" ? "No alerts yet" : `No ${filter} alerts`}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {filter === "all" 
                  ? "You'll see portfolio notifications and price alerts here."
                  : `You don't have any ${filter} alerts at the moment.`
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Alerts ({filteredAlerts.length})
              </h3>
              <button
                onClick={selectedAlerts.size === filteredAlerts.length ? clearSelection : selectAll}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {selectedAlerts.size === filteredAlerts.length ? "Deselect all" : "Select all"}
              </button>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert._id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !alert.isRead ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                  } ${selectedAlerts.has(alert._id) ? "bg-blue-100" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedAlerts.has(alert._id)}
                        onChange={() => toggleAlertSelection(alert._id)}
                        className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      
                      <div className="flex-shrink-0 mt-1">
                        {getAlertIcon(alert.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className={`text-sm font-medium ${
                            !alert.isRead ? "text-gray-900" : "text-gray-600"
                          }`}>
                            {alert.message}
                          </p>
                          {!alert.isRead && (
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {formatDate(alert.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!alert.isRead && (
                        <button
                          onClick={() => markAsRead(alert._id)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Mark as read"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout>
      {alertsContent()}
    </Layout>
  );
};

export default AlertsPage;
