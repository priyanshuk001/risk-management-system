import React, { useEffect, useState } from "react";
import axios from "axios";

const RiskMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem("token"); // JWT from login
        const res = await axios.get("/api/v1/risk/metrics", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMetrics(res.data);
      } catch (err) {
        console.error("Error fetching risk metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) return <p className="p-6">Loading risk metrics...</p>;
  if (!metrics) return <p className="p-6 text-red-500">Failed to load risk metrics</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Risk Metrics</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VaR Details */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Value at Risk (VaR)</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium">1-Day VaR</h4>
              <p className="text-2xl font-bold text-blue-600">
                ${metrics.var.oneDay.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">95% confidence level</p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-medium">10-Day VaR</h4>
              <p className="text-2xl font-bold text-orange-600">
                ${metrics.var.tenDay.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">95% confidence level</p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-medium">1-Month VaR</h4>
              <p className="text-2xl font-bold text-red-600">
                ${metrics.var.oneMonth.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">99% confidence level</p>
            </div>
          </div>
        </div>

        {/* Risk Ratios */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Risk Ratios</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Sharpe Ratio</span>
              <span className="text-lg font-bold text-green-600">{metrics.ratios.sharpe}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Sortino Ratio</span>
              <span className="text-lg font-bold text-green-600">{metrics.ratios.sortino}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Maximum Drawdown</span>
              <span className="text-lg font-bold text-red-600">{metrics.ratios.maxDrawdown}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Beta</span>
              <span className="text-lg font-bold text-blue-600">{metrics.ratios.beta}</span>
            </div>
          </div>
        </div>

        {/* Portfolio Volatility */}
        <div className="bg-white p-6 rounded-lg shadow-lg col-span-1 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Portfolio Volatility Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded">
              <h4 className="font-medium text-gray-700">Daily Volatility</h4>
              <p className="text-2xl font-bold text-purple-600">{metrics.volatility.daily}%</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <h4 className="font-medium text-gray-700">Monthly Volatility</h4>
              <p className="text-2xl font-bold text-purple-600">{metrics.volatility.monthly}%</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <h4 className="font-medium text-gray-700">Annual Volatility</h4>
              <p className="text-2xl font-bold text-purple-600">{metrics.volatility.annual}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskMetrics;
