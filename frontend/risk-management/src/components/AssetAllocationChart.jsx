import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

const AssetAllocationChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);

  // Asset type colors mapping
  const assetColors = {
    equities: '#3B82F6',      // Blue
    cryptos: '#F59E0B',       // Orange
    bonds: '#10B981',         // Green
    commodities: '#8B5CF6',   // Purple
  };

  // Fetch portfolio summary from your existing endpoint
  const fetchPortfolioSummary = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.PORTFOLIO.GET_SUMMARY);
      
      if (response.data.success) {
        const { totalValue: total, totalInvested: invested, breakdown } = response.data;
        
        // Convert breakdown to chart data format
        const chartDataArray = Object.entries(breakdown)
          .filter(([type, data]) => data.value > 0) // Only include assets with value > 0
          .map(([type, data]) => ({
            name: type.charAt(0).toUpperCase() + type.slice(1),
            value: parseFloat(data.percentage),
            absoluteValue: data.value,
            investedValue: data.invested,
            color: assetColors[type] || '#EF4444' // Red for unknown types
          }));

        // Sort by value descending
        chartDataArray.sort((a, b) => b.value - a.value);

        setChartData(chartDataArray);
        setTotalValue(total);
        setTotalInvested(invested);
      } else {
        console.error('Failed to fetch portfolio summary:', response.data.message);
        setChartData([]);
        setTotalValue(0);
        setTotalInvested(0);
      }
    } catch (error) {
      console.error('Error fetching portfolio summary:', error);
      setChartData([]);
      setTotalValue(0);
      setTotalInvested(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchPortfolioSummary();
  }, []);

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const gainLoss = data.absoluteValue - data.investedValue;
      const gainLossPercent = data.investedValue > 0 
        ? ((gainLoss / data.investedValue) * 100).toFixed(1) 
        : 0;

      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{data.name}</p>
          <p className="text-blue-600 font-semibold">{data.value}%</p>
          <p className="text-gray-600">
            Current: ${data.absoluteValue.toLocaleString(undefined, { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </p>
          <p className="text-gray-600">
            Invested: ${data.investedValue.toLocaleString(undefined, { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </p>
          <p className={`font-medium ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {gainLoss >= 0 ? '+' : ''}${gainLoss.toLocaleString(undefined, { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })} ({gainLoss >= 0 ? '+' : ''}{gainLossPercent}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate overall portfolio performance
  const overallGainLoss = totalValue - totalInvested;
  const overallGainLossPercent = totalInvested > 0 
    ? ((overallGainLoss / totalInvested) * 100).toFixed(1) 
    : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Asset Allocation</h3>
        <div className="flex items-center gap-2">
          {loading && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          )}
          <button
            onClick={fetchPortfolioSummary}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {chartData.length === 0 ? (
        // Empty state
        <div className="h-64 flex flex-col items-center justify-center text-gray-500">
          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012-2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-lg font-medium mb-1">No Assets Found</p>
          <p className="text-sm">Add some assets to see your allocation</p>
        </div>
      ) : (
        <>
          {/* Pie Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend with performance indicators */}
          <div className="grid grid-cols-1 gap-3 mt-4">
            {chartData.map((asset, index) => {
              const gainLoss = asset.absoluteValue - asset.investedValue;
              const gainLossPercent = asset.investedValue > 0 
                ? ((gainLoss / asset.investedValue) * 100).toFixed(1) 
                : 0;

              return (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3" 
                      style={{ backgroundColor: asset.color }}
                    ></div>
                    <div>
                      <span className="text-sm text-gray-800 font-medium">
                        {asset.name}
                      </span>
                      <div className="text-xs text-gray-600">
                        ${asset.absoluteValue.toLocaleString(undefined, { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-800 font-semibold">
                      {asset.value}%
                    </span>
                    <div className={`text-xs font-medium ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {gainLoss >= 0 ? '+' : ''}{gainLossPercent}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Portfolio Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Total Invested:</span>
              <span className="text-lg font-semibold text-gray-800">
                ${totalInvested.toLocaleString(undefined, { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Current Value:</span>
              <span className="text-lg font-bold text-gray-800">
                ${totalValue.toLocaleString(undefined, { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Total Gain/Loss:</span>
              <span className={`text-lg font-bold ${overallGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {overallGainLoss >= 0 ? '+' : ''}${overallGainLoss.toLocaleString(undefined, { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })} ({overallGainLoss >= 0 ? '+' : ''}{overallGainLossPercent}%)
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AssetAllocationChart;
