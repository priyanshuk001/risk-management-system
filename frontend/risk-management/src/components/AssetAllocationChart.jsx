import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

const AssetAllocationChart = ({ portfolioData }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalValue, setTotalValue] = useState(0);

  // Asset type colors mapping
  const assetColors = {
    equity: '#3B82F6',      // Blue
    stock: '#3B82F6',       // Blue
    crypto: '#F59E0B',      // Orange
    cryptocurrency: '#F59E0B', // Orange
    bond: '#10B981',        // Green
    commodity: '#8B5CF6',   // Purple
    cash: '#6B7280',        // Gray
    other: '#EF4444'        // Red
  };

  // Calculate asset allocation with current prices
  const calculateAssetAllocation = async () => {
    if (!portfolioData || portfolioData.length === 0) {
      setChartData([]);
      setTotalValue(0);
      return;
    }

    setLoading(true);
    const assetValues = {};
    let portfolioTotal = 0;

    try {
      // Calculate current value for each asset
      for (const asset of portfolioData) {
        try {
          let currentPrice = 0;
          
          // Fetch current price based on asset type
          switch (asset.type?.toLowerCase()) {
            case 'equity':
            case 'stock':
              const equityResponse = await axiosInstance.get(
                API_PATHS.ASSETS.GET_EQUITY_PRICE(asset.symbol)
              );
              currentPrice = equityResponse.data.currentPrice || equityResponse.data.price || 0;
              break;
              
            case 'crypto':
            case 'cryptocurrency':
              const cryptoResponse = await axiosInstance.get(
                API_PATHS.ASSETS.GET_CRYPTO_PRICE(asset.symbol)
              );
              currentPrice = cryptoResponse.data.currentPrice || cryptoResponse.data.price || 0;
              break;
              
            case 'bond':
              const bondResponse = await axiosInstance.get(
                API_PATHS.ASSETS.GET_BOND_PRICE(asset.symbol)
              );
              currentPrice = bondResponse.data.currentPrice || bondResponse.data.price || 0;
              break;
              
            case 'commodity':
              const commodityResponse = await axiosInstance.get(
                API_PATHS.ASSETS.GET_COMMODITY_PRICE(asset.symbol)
              );
              currentPrice = commodityResponse.data.currentPrice || commodityResponse.data.price || 0;
              break;
              
            default:
              // Fallback to purchase price
              currentPrice = asset.purchasePrice || 0;
          }

          const assetValue = currentPrice * (asset.quantity || 0);
          const assetType = (asset.type || 'other').toLowerCase();
          
          // Group by asset type
          if (assetValues[assetType]) {
            assetValues[assetType] += assetValue;
          } else {
            assetValues[assetType] = assetValue;
          }
          
          portfolioTotal += assetValue;

        } catch (error) {
          console.warn(`Failed to fetch price for ${asset.symbol}:`, error);
          // Fallback to purchase price
          const fallbackValue = (asset.purchasePrice || 0) * (asset.quantity || 0);
          const assetType = (asset.type || 'other').toLowerCase();
          
          if (assetValues[assetType]) {
            assetValues[assetType] += fallbackValue;
          } else {
            assetValues[assetType] = fallbackValue;
          }
          
          portfolioTotal += fallbackValue;
        }
      }

      // Convert to chart data format
      const chartDataArray = Object.entries(assetValues).map(([type, value]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: portfolioTotal > 0 ? ((value / portfolioTotal) * 100).toFixed(1) : 0,
        absoluteValue: value,
        color: assetColors[type] || assetColors.other
      }));

      // Sort by value descending
      chartDataArray.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));

      setChartData(chartDataArray);
      setTotalValue(portfolioTotal);

    } catch (error) {
      console.error('Error calculating asset allocation:', error);
    } finally {
      setLoading(false);
    }
  };

  // Recalculate when portfolio data changes
  useEffect(() => {
    calculateAssetAllocation();
  }, [portfolioData]);

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{data.name}</p>
          <p className="text-blue-600">{data.value}%</p>
          <p className="text-gray-600">
            ${data.absoluteValue.toLocaleString(undefined, { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Asset Allocation</h3>
        {loading && (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        )}
      </div>

      {chartData.length === 0 ? (
        // Empty state
        <div className="h-64 flex flex-col items-center justify-center text-gray-500">
          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {chartData.map((asset, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: asset.color }}
                  ></div>
                  <span className="text-sm text-gray-600 font-medium">
                    {asset.name}
                  </span>
                </div>
                <span className="text-sm text-gray-800 font-semibold">
                  {asset.value}%
                </span>
              </div>
            ))}
          </div>

          {/* Total Portfolio Value */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Total Value:</span>
              <span className="text-lg font-bold text-gray-800">
                ${totalValue.toLocaleString(undefined, { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AssetAllocationChart;