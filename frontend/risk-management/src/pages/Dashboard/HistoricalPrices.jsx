import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign,
  BarChart3,
  Activity
} from "lucide-react";

const HistoricalPricesPage = () => {
  const [portfolioData, setPortfolioData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("monthly"); // monthly, weekly, yearly, ytd
  const [statistics, setStatistics] = useState({});

  // Time period configurations
  const timePeriods = {
    weekly: { days: 7, label: "Weekly", interval: "1 Week" },
    monthly: { days: 30, label: "Monthly", interval: "1 Month" },
    yearly: { days: 365, label: "Yearly", interval: "1 Year" },
    ytd: { days: null, label: "Year to Date", interval: "YTD" }
  };

  // Fetch historical portfolio data
  const fetchHistoricalData = async (period) => {
    try {
      setLoading(true);
      setError(null);
      
      let days = timePeriods[period].days;
      
      // Calculate YTD days
      if (period === "ytd") {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        days = Math.ceil((now - startOfYear) / (1000 * 60 * 60 * 24));
      }

      const response = await axiosInstance.get(`${API_PATHS.PORTFOLIO.GET_HISTORICAL}?days=${days}`);
      
      if (response.data.success) {
        const { portfolioHistory, summary } = response.data;
        setPortfolioData(portfolioHistory);
        calculateStatistics(portfolioHistory);
        console.log(`📈 Loaded ${portfolioHistory.length} data points for ${period}`);
      } else {
        setError("Failed to fetch historical data");
      }
    } catch (error) {
      console.error("Error fetching historical data:", error);
      setError(error.response?.data?.message || "Failed to load historical data");
    } finally {
      setLoading(false);
    }
  };

  // Calculate key statistics
  const calculateStatistics = (data) => {
    if (data.length === 0) return;

    const values = data.map(d => d.totalValue);
    const currentValue = values[values.length - 1];
    const startValue = values[0];
    
    // Calculate daily returns
    const dailyReturns = [];
    for (let i = 1; i < values.length; i++) {
      const returnPct = ((values[i] - values[i-1]) / values[i-1]) * 100;
      dailyReturns.push(returnPct);
    }

    const totalReturn = ((currentValue - startValue) / startValue) * 100;
    const bestDay = Math.max(...dailyReturns);
    const worstDay = Math.min(...dailyReturns);
    const averageReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length;
    const winRate = (dailyReturns.filter(ret => ret > 0).length / dailyReturns.length) * 100;
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const volatility = Math.sqrt(dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - averageReturn, 2), 0) / dailyReturns.length);

    setStatistics({
      currentValue,
      startValue,
      totalReturn,
      bestDay,
      worstDay,
      averageReturn,
      winRate,
      maxValue,
      minValue,
      volatility,
      totalDays: data.length
    });
  };

  // Format data for charts
  const formatChartData = (data) => {
    return data.map(point => ({
      ...point,
      date: new Date(point.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: selectedPeriod === 'yearly' ? 'numeric' : undefined
      }),
      value: point.totalValue
    }));
  };

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{label}</p>
          <p className="text-blue-600 font-semibold">
            ${data.value?.toLocaleString(undefined, { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </p>
        </div>
      );
    }
    return null;
  };

  // Load data when component mounts or period changes
  useEffect(() => {
    fetchHistoricalData(selectedPeriod);
  }, [selectedPeriod]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Historical Prices</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Track your portfolio performance over time
                </p>
              </div>
            </div>
            
            {/* Time Period Selector */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(timePeriods).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSelectedPeriod(key)}
                  disabled={loading}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    selectedPeriod === key
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } disabled:opacity-50`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Overview Cards */}
        {!loading && !error && statistics.currentValue && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(statistics.currentValue)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Return</p>
                  <p className={`text-2xl font-bold ${
                    statistics.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(statistics.totalReturn)}
                  </p>
                </div>
                {statistics.totalReturn >= 0 ? 
                  <TrendingUp className="h-8 w-8 text-green-500" /> : 
                  <TrendingDown className="h-8 w-8 text-red-500" />
                }
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Best Day</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPercentage(statistics.bestDay)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Win Rate</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {statistics.winRate.toFixed(1)}%
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </div>
        )}

        {/* Main Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Portfolio Performance - {timePeriods[selectedPeriod].label}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{timePeriods[selectedPeriod].interval}</span>
            </div>
          </div>

          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Loading chart data...</span>
              </div>
            </div>
          ) : error ? (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="text-red-500 mb-2">
                  <BarChart3 className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => fetchHistoricalData(selectedPeriod)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : portfolioData.length === 0 ? (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No historical data available</p>
                <p className="text-sm text-gray-500 mt-2">
                  Add assets to your portfolio to see performance charts
                </p>
              </div>
            </div>
          ) : (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={formatChartData(portfolioData)}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6B7280"
                    fontSize={12}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    stroke="#6B7280"
                    fontSize={12}
                    tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Detailed Statistics */}
        {!loading && !error && statistics.currentValue && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Period Return</span>
                  <span className={`font-semibold ${
                    statistics.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(statistics.totalReturn)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Daily Return</span>
                  <span className={`font-semibold ${
                    statistics.averageReturn >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(statistics.averageReturn)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Volatility</span>
                  <span className="font-semibold text-gray-900">
                    {statistics.volatility.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data Points</span>
                  <span className="font-semibold text-gray-900">
                    {statistics.totalDays} days
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Extremes</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Highest Value</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(statistics.maxValue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lowest Value</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(statistics.minValue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Worst Day</span>
                  <span className="font-semibold text-red-600">
                    {formatPercentage(statistics.worstDay)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Win Rate</span>
                  <span className="font-semibold text-blue-600">
                    {statistics.winRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HistoricalPricesPage;
