require("dotenv").config({ path: "../.env" });

const {
  getHistoricalStockPrices,
  getHistoricalCryptoPrices,
  getHistoricalBondYields,
  getHistoricalCommodityPrices
} = require("./historicalPriceService");

const REDIS = require("../config/redis");

const ALERT_THRESHOLD = {
  var_95: 1000,  // $ thresholds for 1-day losses
  var_99: 2000,
  stressLoss: 3000
};

// ------------------- Default Scenarios (edit as needed) -------------------
const DEFAULT_SCENARIOS = [
  {
    name: "Mild Risk-Off",
    equityShock: -0.10,       // -10% equity move
    cryptoShock: -0.15,       // -15% crypto move
    commodityShock: -0.08,    // -8% commodity move
    rateShock_bps: 50         // +50 bps parallel rate rise
  },
  {
    name: "Severe Risk-Off",
    equityShock: -0.20,
    cryptoShock: -0.30,
    commodityShock: -0.15,
    rateShock_bps: 100
  },
  {
    name: "Rates Shock",
    equityShock: -0.05,
    cryptoShock: -0.10,
    commodityShock: -0.02,
    rateShock_bps: 200
  }
];

// ------------------- Utilities -------------------
function pctChange(arr) {
  const changes = [];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i - 1] === 0 || arr[i - 1] == null || arr[i] == null) {
      changes.push(0);
    } else {
      changes.push((arr[i] - arr[i - 1]) / arr[i - 1]);
    }
  }
  return changes;
}

// Absolute first differences (e.g., yields in decimals)
function firstDiff(arr) {
  const diffs = [];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] == null || arr[i - 1] == null) diffs.push(0);
    else diffs.push(arr[i] - arr[i - 1]);
  }
  return diffs;
}

// Robust empirical quantile (p in [0,1]), sorted ascending; no interpolation
function quantile(sortedArr, p) {
  if (!sortedArr.length) return 0;
  const idx = Math.floor(p * (sortedArr.length - 1));
  return sortedArr[Math.max(0, Math.min(sortedArr.length - 1, idx))];
}

// ------------------- Historical VaR -------------------
async function calculatePortfolioVaR(portfolio, numDays = 252) {
  // portfolio: [{ asset_type, symbol_or_name, quantity, current_value, modified_duration?, convexity? }, ...]
  const totalValue = portfolio.reduce((sum, p) => sum + (p.current_value || 0), 0);
  if (totalValue === 0) return { var_95: 0, var_99: 0, portfolioReturns: [], totalValue };

  // Fetch historical series and compute asset daily returns
  const assetReturns = {};
  for (const asset of portfolio) {
    let series = [];
    try {
      switch (asset.asset_type) {
        case "equity": {
          const prices = (await getHistoricalStockPrices(asset.symbol_or_name, numDays)).map(p => p.close);
          series = pctChange(prices);
          break;
        }
        case "crypto": {
          const prices = (await getHistoricalCryptoPrices(asset.symbol_or_name, numDays)).map(p => p.close);
          series = pctChange(prices);
          break;
        }
        case "commodity": {
          const prices = (await getHistoricalCommodityPrices(asset.symbol_or_name, numDays)).map(p => p.close);
          series = pctChange(prices);
          break;
        }
        case "bond": {
          // Use yield changes mapped to price returns via duration/convexity
          // Assumption: getHistoricalBondYields returns yields in decimals (e.g., 0.025 = 2.5%)
          const yields = (await getHistoricalBondYields(asset.symbol_or_name, numDays)).map(p => p.value);
          const dy = firstDiff(yields);
          const Dmod = Number.isFinite(asset.modified_duration) ? asset.modified_duration : 5; // default if missing
          const C = Number.isFinite(asset.convexity) ? asset.convexity : 0; // optional
          series = dy.map(dy_i => (-(Dmod) * dy_i) + 0.5 * C * dy_i * dy_i);
          break;
        }
        default:
          console.warn("Unknown asset type:", asset.asset_type);
          series = [];
      }
    } catch (e) {
      console.warn(`Data fetch error for ${asset.symbol_or_name}:`, e?.message);
      series = [];
    }
    assetReturns[asset.symbol_or_name] = series;
  }

  const minLen = Math.min(...Object.values(assetReturns).map(r => r.length));
  if (!Number.isFinite(minLen) || minLen <= 0) return { var_95: 0, var_99: 0, portfolioReturns: [], totalValue };

  // Form daily portfolio returns using current-value weights
  const portfolioReturns = [];
  for (let i = 0; i < minLen; i++) {
    let dailyReturn = 0;
    for (const asset of portfolio) {
      const weight = (asset.current_value || 0) / totalValue;
      const r = assetReturns[asset.symbol_or_name]?.[i] ?? 0;
      dailyReturn += weight * r;
    }
    portfolioReturns.push(dailyReturn);
  }

  const sorted = [...portfolioReturns].sort((a, b) => a - b);
  const var95 = -quantile(sorted, 0.05) * totalValue;
  const var99 = -quantile(sorted, 0.01) * totalValue;

  return { var_95: var95, var_99: var99, portfolioReturns, totalValue };
}

// ------------------- Scenario Stress Testing -------------------
function stressTestCurrentPortfolio(portfolio, scenarios = DEFAULT_SCENARIOS) {
  // One-day scenario revaluation in currency units
  return scenarios.map(scn => {
    let pnl = 0;
    for (const a of portfolio) {
      const v = a.current_value || 0;
      if (v === 0) continue;

      if (a.asset_type === "equity") {
        pnl += v * (scn.equityShock ?? 0);
      } else if (a.asset_type === "crypto") {
        pnl += v * (scn.cryptoShock ?? 0);
      } else if (a.asset_type === "commodity") {
        pnl += v * (scn.commodityShock ?? 0);
      } else if (a.asset_type === "bond") {
        const Dmod = Number.isFinite(a.modified_duration) ? a.modified_duration : 5;
        const C = Number.isFinite(a.convexity) ? a.convexity : 0;
        const dy = ((scn.rateShock_bps ?? 0) / 10000); // bps -> decimal yield
        const dP_over_P = (-(Dmod) * dy) + 0.5 * C * dy * dy;
        pnl += v * dP_over_P;
      } else {
        // Unknown types assumed 0 shock
        pnl += 0;
      }
    }
    const loss = -pnl; // report as positive loss when pnl is negative
    return { scenario: scn.name, loss, assumptions: scn };
  });
}

// ------------------- Trigger Alerts -------------------
function checkAlerts(varMetrics, stressResults) {
  const alerts = [];

  if ((varMetrics.var_95 || 0) >= ALERT_THRESHOLD.var_95)
    alerts.push(`⚠️ VaR 95% exceeds threshold: $${(varMetrics.var_95 || 0).toFixed(2)}`);
  if ((varMetrics.var_99 || 0) >= ALERT_THRESHOLD.var_99)
    alerts.push(`⚠️ VaR 99% exceeds threshold: $${(varMetrics.var_99 || 0).toFixed(2)}`);

  stressResults.forEach(s => {
    if ((s.loss || 0) >= ALERT_THRESHOLD.stressLoss)
      alerts.push(`⚠️ Stress test loss $${(s.loss || 0).toFixed(2)} exceeds threshold in "${s.scenario}"`);
  });

  return alerts;
}

// ------------------- Main Function -------------------
async function evaluatePortfolioRisk(portfolio, options = {}) {
  const { numDays = 252, scenarios = DEFAULT_SCENARIOS } = options;

  const varMetrics = await calculatePortfolioVaR(portfolio, numDays);
  const stressResults = stressTestCurrentPortfolio(portfolio, scenarios);
  const alerts = checkAlerts(varMetrics, stressResults);

  return {
    varMetrics,        // { var_95, var_99, portfolioReturns, totalValue }
    stressResults,     // [ { scenario, loss, assumptions }, ... ]
    alerts
  };
}

// ------------------- Export -------------------
module.exports = {
  evaluatePortfolioRisk,
  calculatePortfolioVaR,
  stressTestCurrentPortfolio
};
