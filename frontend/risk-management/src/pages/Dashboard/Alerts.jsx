import React from 'react';
import { dummyData } from '../../dummydata';

const Alerts = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-800 mb-6">Risk Alerts Management</h1>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <h3 className="font-semibold text-red-800">High Risk Alerts</h3>
        <p className="text-2xl font-bold text-red-600">3</p>
      </div>
      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
        <h3 className="font-semibold text-orange-800">Medium Risk Alerts</h3>
        <p className="text-2xl font-bold text-orange-600">7</p>
      </div>
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
        <h3 className="font-semibold text-yellow-800">Low Risk Alerts</h3>
        <p className="text-2xl font-bold text-yellow-600">12</p>
      </div>
    </div>
    
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold">All Alerts</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {dummyData.recentAlerts.concat([
            { id: 4, message: 'High correlation detected between tech stocks', type: 'Medium', timestamp: '2024-01-14 16:45' },
            { id: 5, message: 'Portfolio concentration risk in crypto sector', type: 'High', timestamp: '2024-01-14 14:20' },
            { id: 6, message: 'Stop loss triggered for TSLA position', type: 'High', timestamp: '2024-01-14 11:30' }
          ]).map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  alert.type === 'High' ? 'bg-red-500' : 
                  alert.type === 'Medium' ? 'bg-orange-500' : 'bg-yellow-500'
                }`}></div>
                <div>
                  <p className="font-medium text-gray-800">{alert.message}</p>
                  <p className="text-sm text-gray-500">{alert.timestamp}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  alert.type === 'High' ? 'bg-red-100 text-red-800' :
                  alert.type === 'Medium' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {alert.type}
                </span>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default Alerts;