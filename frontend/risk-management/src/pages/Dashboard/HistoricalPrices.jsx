import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const HistoricalPrices = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-800 mb-6">Historical Prices</h1>
    
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Price History Overview</h3>
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={[
            { date: '2024-01-01', portfolio: 1200000, sp500: 100 },
            { date: '2024-01-02', portfolio: 1195000, sp500: 99.5 },
            { date: '2024-01-03', portfolio: 1208000, sp500: 101.2 },
            { date: '2024-01-04', portfolio: 1225000, sp500: 102.1 },
            { date: '2024-01-05', portfolio: 1215000, sp500: 101.8 },
            { date: '2024-01-08', portfolio: 1235000, sp500: 103.2 },
            { date: '2024-01-09', portfolio: 1248000, sp500: 104.1 },
            { date: '2024-01-10', portfolio: 1250000, sp500: 104.5 }
          ]}>
            <XAxis dataKey="date" />
            <YAxis />
            <Line type="monotone" dataKey="portfolio" stroke="#3B82F6" strokeWidth={2} name="Portfolio" />
            <Line type="monotone" dataKey="sp500" stroke="#10B981" strokeWidth={2} name="S&P 500" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Asset Performance (YTD)</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span>Equity Portfolio</span>
            <span className="font-medium text-green-600">+12.5%</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Crypto Portfolio</span>
            <span className="font-medium text-green-600">+45.2%</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Bond Portfolio</span>
            <span className="font-medium text-red-600">-2.1%</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Commodities</span>
            <span className="font-medium text-green-600">+8.7%</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Key Statistics</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span>Best Day</span>
            <span className="font-medium text-green-600">+3.2%</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Worst Day</span>
            <span className="font-medium text-red-600">-2.8%</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Average Daily Return</span>
            <span className="font-medium text-blue-600">+0.15%</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Win Rate</span>
            <span className="font-medium text-green-600">62%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default HistoricalPrices;