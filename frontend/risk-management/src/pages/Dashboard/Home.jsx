import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import AssetAllocationChart from '../../components/AssetAllocationChart';
import VaRCards from '../../components/VaRCards';
import AlertsList from '../../components/AlertsList';
import Layout from './Layout';

const Home = () => {
  const { user } = useContext(UserContext);

  // State for portfolio
  const [portfolioData, setPortfolioData] = useState([]);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [portfolioChange, setPortfolioChange] = useState(0);

  // State for alerts
  const [alerts, setAlerts] = useState([]);

  // Loading/error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch portfolio data
  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(API_PATHS.PORTFOLIO.GET_ALL);
      const { assets = {} } = response.data;

      const response1 = await axiosInstance.get(API_PATHS.PORTFOLIO.GET_SUMMARY);
      const {totalValue = 0, totalInvested = 0 } = response1.data;



      const mergedAssets = [
        ...(assets.equities || []),
        ...(assets.bonds || []),
        ...(assets.cryptos || []),
        ...(assets.commodities || []),
      ];

      setPortfolioData(mergedAssets);

      // Use backend-calculated values
      setPortfolioValue(totalValue);
      setPortfolioChange(
        totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0
      );

    } catch (err) {
      console.error('Failed to fetch portfolio data:', err);
      setError(err.response?.data?.message || 'Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.ALERTS.GET_ALL);
      setAlerts(response.data || []);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  };

  // Load data when user changes
  useEffect(() => {
    if (user) {
      fetchPortfolioData();
      fetchAlerts();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Risk Management Dashboard</h1>
        <p>Loading your portfolio data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <h1 className="text-3xl font-bold">Risk Management Dashboard</h1>
          <p className="text-gray-600">Monitor your portfolio risk metrics and performance</p>
          <div className="bg-red-50 p-6 rounded-lg text-center">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchPortfolioData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.fullName || 'User'}!
          </h1>
          <p className="text-gray-600">Monitor your portfolio risk metrics and performance</p>
        </div>

        {/* Portfolio Value */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 rounded-lg text-white">
          <h2 className="text-lg font-medium mb-2">Total Portfolio Value</h2>
          <p className="text-4xl font-bold">
            ${portfolioValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className={`mt-2 ${portfolioChange >= 0 ? 'text-green-200' : 'text-red-200'}`}>
            {portfolioChange >= 0 ? '+' : ''}
            {portfolioChange.toFixed(2)}% from purchase price
          </p>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {portfolioData.length > 0 && (
            <AssetAllocationChart portfolioData={portfolioData} />
          )}
          <div className="space-y-4">
            <VaRCards portfolioData={portfolioData} />
          </div>
        </div>

        {/* Bottom Row -Alerts*/}
        <div className="grid grid-cols-1 gap-6">
          <AlertsList alerts={alerts} />
        </div>

        {/* Refresh */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              fetchPortfolioData();
              fetchAlerts();
            }}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Home;