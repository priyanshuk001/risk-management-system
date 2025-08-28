import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const VaRCards = ({ portfolioData }) => {
  const [varMetrics, setVarMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateVaR = async () => {
    if (!portfolioData || portfolioData.length === 0) {
      setVarMetrics(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ✅ Fixed: Use GET request as backend expects
      const response = await axiosInstance.get(API_PATHS.PORTFOLIO.EVALUATE_RISK);
      // ✅ Fixed: Extract data from correct nested structure
      const { varMetrics: backendVarMetrics, stressResults } =
        response.data.risk;

      // ✅ Add null checks for backend response
      if (!backendVarMetrics) {
        throw new Error('Risk metrics data not available from backend');
      }

      // Expected Shortfall approximation with null checks
      const var95 = backendVarMetrics.var_95 || 0;
      const var99 = backendVarMetrics.var_99 || 0;
      const es95 = var95 * 1.25;
      const es99 = var99 * 1.25;

      setVarMetrics({
        var95: Math.round(var95),
        var99: Math.round(var99),
        expectedShortfall95: Math.round(es95),
        expectedShortfall99: Math.round(es99),
        stressResults: stressResults || [],
        lastUpdated: new Date().toLocaleTimeString(),
      });
    } 
    catch (err) {
      console.error("Error calculating VaR:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Unknown error occurred";
      setError(`Failed to calculate risk metrics: ${errorMessage}`);
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateVaR();
  }, [portfolioData]);

  if (loading) {
    return <p className="text-center text-gray-500">Calculating risk...</p>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-medium">Risk Calculation Error</p>
        <p className="text-red-600 text-sm mb-3">{error}</p>
        <button
          onClick={calculateVaR}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!varMetrics) {
    return (
      <div className="text-center text-gray-500">
        <p>No portfolio data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* VaR Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-orange-400">
          <h4 className="text-sm font-medium text-gray-500 mb-2">
            VaR 95% (Historical)
          </h4>
          <p className="text-2xl font-bold text-orange-600">
            ${varMetrics.var95.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-red-400">
          <h4 className="text-sm font-medium text-gray-500 mb-2">
            VaR 99% (Historical)
          </h4>
          <p className="text-2xl font-bold text-red-600">
            ${varMetrics.var99.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Expected Shortfall */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-purple-400">
          <h4 className="text-sm font-medium text-gray-500 mb-2">
            Expected Shortfall 95%
          </h4>
          <p className="text-xl font-bold text-purple-600">
            ${varMetrics.expectedShortfall95.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-pink-400">
          <h4 className="text-sm font-medium text-gray-500 mb-2">
            Expected Shortfall 99%
          </h4>
          <p className="text-xl font-bold text-pink-600">
            ${varMetrics.expectedShortfall99.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Stress Test */}
      {varMetrics.stressResults.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Stress Test Results
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {varMetrics.stressResults.map((stress, idx) => (
              <div key={idx} className="text-center p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">
                  {(stress.shock * 100).toFixed(0)}% Market Shock
                </p>
                <p className="font-bold text-red-600">
                  ${stress.loss.toFixed(0)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={calculateVaR}
          disabled={loading}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm flex items-center gap-2"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default VaRCards;