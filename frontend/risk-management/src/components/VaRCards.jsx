import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const VaRCards = ({ portfolioData }) => {
  const [varMetrics, setVarMetrics] = useState(null);
  const [stress, setStress] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatPct = (x) =>
    typeof x === "number" ? `${(x * 100).toFixed(0)}%` : "—";

  const calculateVaR = async () => {
    // If portfolio is empty, clear display gracefully
    if (!portfolioData || portfolioData.length === 0) {
      setVarMetrics(null);
      setStress([]);
      setAlerts([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Backend: GET /evaluate-risk
      const res = await axiosInstance.get(API_PATHS.PORTFOLIO.EVALUATE_RISK);

      // Expected response shape:
      // { success: true, risk: { varMetrics: { var_95, var_99 }, stressResults: [...], alerts: [] } }
      const risk = res?.data?.risk || {};
      const backendVar = risk?.varMetrics || {};
      const stressResults = Array.isArray(risk?.stressResults)
        ? risk.stressResults
        : [];
      const backendAlerts = Array.isArray(risk?.alerts) ? risk.alerts : [];

      if (backendVar.var_95 == null || backendVar.var_99 == null) {
        throw new Error("VaR metrics missing in response");
      }

      const var95 = Number(backendVar.var_95) || 0;
      const var99 = Number(backendVar.var_99) || 0;

      // Simple ES display approximation (tunable)
      const es95 = var95 * 1.25;
      const es99 = var99 * 1.25;

      setVarMetrics({
        var95: Math.round(var95),
        var99: Math.round(var99),
        expectedShortfall95: Math.round(es95),
        expectedShortfall99: Math.round(es99),
        lastUpdated: new Date().toISOString(),
      });

      setStress(stressResults);
      setAlerts(backendAlerts);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Unknown error";
      setError(`Failed to calculate risk metrics: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateVaR();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolioData]);

  if (loading) {
    return (
      <p className="text-center text-gray-500">Calculating risk...</p>
    );
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
            VaR 95% (Portfolio)
          </h4>
          <p className="text-2xl font-bold text-orange-600">
            ${varMetrics.var95.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Estimated maximum loss with 95% confidence over the chosen horizon
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-red-400">
          <h4 className="text-sm font-medium text-gray-500 mb-2">
            VaR 99% (Portfolio)
          </h4>
          <p className="text-2xl font-bold text-red-600">
            ${varMetrics.var99.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Estimated maximum loss with 99% confidence over the chosen horizon
          </p>
        </div>
      </div>

      {/* Expected Shortfall (display approximation) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-purple-400">
          <h4 className="text-sm font-medium text-gray-500 mb-2">
            Expected Shortfall 95% (ES)
          </h4>
          <p className="text-xl font-bold text-purple-600">
            ${varMetrics.expectedShortfall95.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Simple tail‑loss display approximation for quick context
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-pink-400">
          <h4 className="text-sm font-medium text-gray-500 mb-2">
            Expected Shortfall 99% (ES)
          </h4>
          <p className="text-xl font-bold text-pink-600">
            ${varMetrics.expectedShortfall99.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Simple tail‑loss display approximation for quick context
          </p>
        </div>
      </div>

      {/* Stress Test Results */}
      {stress.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Stress Test Results
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stress.map((s, idx) => {
              const a = s?.assumptions || {};
              return (
                <div key={idx} className="p-4 bg-gray-50 rounded border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-800">
                      {s?.scenario || a?.name || `Scenario ${idx + 1}`}
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      Loss: ${Number(s?.loss || 0).toFixed(0)}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-gray-600 space-y-1">
                    {"equityShock" in a && (
                      <div className="flex justify-between">
                        <span>Equity Shock</span>
                        <span className="font-medium">{formatPct(a.equityShock)}</span>
                      </div>
                    )}
                    {"cryptoShock" in a && (
                      <div className="flex justify-between">
                        <span>Crypto Shock</span>
                        <span className="font-medium">{formatPct(a.cryptoShock)}</span>
                      </div>
                    )}
                    {"commodityShock" in a && (
                      <div className="flex justify-between">
                        <span>Commodity Shock</span>
                        <span className="font-medium">{formatPct(a.commodityShock)}</span>
                      </div>
                    )}
                    {"rateShock_bps" in a && (
                      <div className="flex justify-between">
                        <span>Rate Shock</span>
                        <span className="font-medium">
                          {Number(a.rateShock_bps).toFixed(0)} bps
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Optional: Alerts summary if backend sends any */}
      {alerts.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-yellow-100">
          <p className="text-sm text-yellow-800">
            {alerts.length} risk alert{alerts.length > 1 ? "s" : ""} detected
          </p>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          Last updated: {new Date(varMetrics.lastUpdated).toLocaleString()}
        </span>
        <button
          onClick={calculateVaR}
          disabled={loading}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default VaRCards;
