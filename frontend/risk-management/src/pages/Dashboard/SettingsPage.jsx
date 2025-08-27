import React from 'react';

const SettingsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Risk Thresholds</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">VaR Alert Threshold (%)</label>
            <input type="number" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Drawdown Limit (%)</label>
            <input type="number" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="15" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Concentration Risk Limit (%)</label>
            <input type="number" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="25" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
        <div className="space-y-4">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" defaultChecked />
            <span>Email alerts for high-risk events</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" defaultChecked />
            <span>Daily risk report</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span>SMS alerts for critical events</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" defaultChecked />
            <span>Weekly portfolio summary</span>
          </label>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold mb-4">User Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="john.doe@company.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Risk Manager</option>
              <option>Portfolio Manager</option>
              <option>Analyst</option>
              <option>Administrator</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input type="text" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="Risk Management" />
          </div>
        </div>
        <div className="mt-6">
          <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default SettingsPage;