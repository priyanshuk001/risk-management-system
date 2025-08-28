import React, { useState, useEffect } from 'react';
import { BASE_URL, API_PATHS } from '../utils/apiPaths'; // adjust path to your api config

const AlertsList = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch alerts from API
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        
        // Get token from localStorage (adjust based on how you store auth token)
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication token not found');
          return;
        }

        const response = await fetch(`${BASE_URL}${API_PATHS.ALERTS.GET_ALL}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setAlerts(data);
      } catch (err) {
        console.error('Error fetching alerts:', err);
        setError('Failed to load alerts');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Since your backend doesn't store alert types, we'll use a simple styling
  const getAlertColor = () => {
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Alerts</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading alerts...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Alerts</h3>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Alerts</h3>
        <p className="text-gray-500">No alerts available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Alerts</h3>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert._id} className={`p-3 rounded border ${getAlertColor()}`}>
            <div className="flex justify-between items-start">
              <p className="font-medium">{alert.message}</p>
            </div>
            <p className="text-xs mt-2 opacity-75">
              {formatTimestamp(alert.createdAt)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsList;