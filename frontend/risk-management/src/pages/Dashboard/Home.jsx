import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import AssetAllocationChart from '../../components/AssetAllocationChart';
import VaRCards from '../../components/VaRCards';
import StressTestSummary from '../../components/StressTestSummary';
import AlertsList from '../../components/AlertsList';
import SparklineChart from '../../components/SparklineChart';

const Home = () => {
  const { user } = useContext(UserContext);
  
  // State for portfolio data
  const [portfolioData, setPortfolioData] = useState([]);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [portfolioChange, setPortfolioChange] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch portfolio data from backend
  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all portfolio assets
      const response = await axiosInstance.get(API_PATHS.PORTFOLIO.GET_ALL);
      const assets = response.data.assets || response.data || [];
      
      setPortfolioData(assets);
      
      // Calculate total portfolio value and current prices
      await calculatePortfolioMetrics(assets);
      
    } catch (err) {
      console.error('Failed to fetch portfolio data:', err);
      setError(err.response?.data?.message || 'Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate portfolio metrics with current prices
  const calculatePortfolioMetrics = async (assets) => {
    if (!assets || assets.length === 0) {
      setPortfolioValue(0);
      setPortfolioChange(0);
      return;
    }

    let totalValue = 0;
    let totalPreviousValue = 0;

    // Fetch current prices for each asset
    for (const asset of assets) {
      try {
        let priceData = null;
        
        // Fetch current price based on asset type
        switch (asset.type?.toLowerCase()) {
          case 'equity':
          case 'stock':
            const equityResponse = await axiosInstance.get(
              API_PATHS.ASSETS.GET_EQUITY_PRICE(asset.symbol)
            );
            priceData = equityResponse.data;
            break;
            
          case 'crypto':
          case 'cryptocurrency':
            const cryptoResponse = await axiosInstance.get(
              API_PATHS.ASSETS.GET_CRYPTO_PRICE(asset.symbol)
            );
            priceData = cryptoResponse.data;
            break;
            
          case 'bond':
            const bondResponse = await axiosInstance.get(
              API_PATHS.ASSETS.GET_BOND_PRICE(asset.symbol)
            );
            priceData = bondResponse.data;
            break;
            
          case 'commodity':
            const commodityResponse = await axiosInstance.get(
              API_PATHS.ASSETS.GET_COMMODITY_PRICE(asset.symbol)
            );
            priceData = commodityResponse.data;
            break;
            
          default:
            // Use purchase price if no API available
            priceData = { currentPrice: asset.purchasePrice || 0 };
        }

        if (priceData) {
          const currentPrice = priceData.currentPrice || priceData.price || 0;
          const quantity = asset.quantity || 0;
          const purchasePrice = asset.purchasePrice || 0;
          
          totalValue += currentPrice * quantity;
          totalPreviousValue += purchasePrice * quantity;
        }
      } catch (priceError) {
        console.warn(`Failed to fetch price for ${asset.symbol}:`, priceError);
        // Fallback to purchase price
        const fallbackValue = (asset.purchasePrice || 0) * (asset.quantity || 0);
        totalValue += fallbackValue;
        totalPreviousValue += fallbackValue;
      }
    }

    setPortfolioValue(totalValue);
    
    // Calculate percentage change
    if (totalPreviousValue > 0) {
      const changePercent = ((totalValue - totalPreviousValue) / totalPreviousValue) * 100;
      setPortfolioChange(changePercent);
    } else {
      setPortfolioChange(0);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchPortfolioData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Risk Management Dashboard</h1>
          <p className="text-gray-600">Loading your portfolio data...</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Risk Management Dashboard</h1>
          <p className="text-gray-600">Monitor your portfolio risk metrics and performance</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchPortfolioData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-gray-600">Monitor your portfolio risk metrics and performance</p>
      </div>
      
      {/* Portfolio Value */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 rounded-lg shadow-lg text-white">
        <h2 className="text-lg font-medium mb-2">Total Portfolio Value</h2>
        <p className="text-4xl font-bold">
          ${portfolioValue.toLocaleString(undefined, { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}
        </p>
        <p className={`mt-2 ${portfolioChange >= 0 ? 'text-green-200' : 'text-red-200'}`}>
          {portfolioChange >= 0 ? '+' : ''}{portfolioChange.toFixed(2)}% from purchase price
        </p>
        {portfolioData.length === 0 && (
          <p className="text-blue-100 text-sm mt-2">
            No assets in portfolio. Add some assets to get started!
          </p>
        )}
      </div>

      {/* Charts and Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AssetAllocationChart portfolioData={portfolioData} />
        <div className="space-y-4">
          <VaRCards portfolioData={portfolioData} />
          <SparklineChart portfolioData={portfolioData} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StressTestSummary portfolioData={portfolioData} />
        <AlertsList portfolioData={portfolioData} />
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={fetchPortfolioData}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </button>
      </div>
    </div>
  );
};

export default Home;