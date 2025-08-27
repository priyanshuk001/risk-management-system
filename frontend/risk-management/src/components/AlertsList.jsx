import React, { useContext } from 'react';
import { UserContext } from '../../context/UserContext'; // adjust path if needed

const AlertsList = () => {
  const { user } = useContext(UserContext); // get user data from context

  const getAlertColor = (type) => {
    switch (type) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!user || !user.alerts || user.alerts.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Alerts</h3>
        <p className="text-gray-500">No alerts available for this user.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Alerts</h3>
      <div className="space-y-3">
        {user.alerts.map((alert) => (
          <div key={alert.id} className={`p-3 rounded border ${getAlertColor(alert.type)}`}>
            <div className="flex justify-between items-start">
              <p className="font-medium">{alert.message}</p>
              <span className="text-xs font-semibold px-2 py-1 rounded">
                {alert.type}
              </span>
            </div>
            <p className="text-xs mt-2 opacity-75">{alert.timestamp}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsList;
