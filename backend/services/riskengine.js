require("dotenv").config({ path: "../.env" });

const {
  getHistoricalStockPrices,
  getHistoricalCryptoPrices,
  getHistoricalBondYields,
  getHistoricalCommodityPrices
} = require("./historicalPriceService");

const REDIS = require("../config/redis");
const ALERT_THRESHOLD = {
  var_95: 1000,   // Example: $1000 loss triggers alert
  var_99: 2000,
  stressLoss: 3000
};

// ------------------- Utility: percentage change -------------------
function pctChange(arr) {
  let changes = [];
  for (let i = 1; i < arr.length; i++) {
    changes.push((arr[i] - arr[i - 1]) / arr[i - 1]);
  }
  return changes;
}

// ------------------- Calculate Portfolio Historical VaR -------------------
async function calculatePortfolioVaR(portfolio, numDays = 252) {
  // portfolio = [{ asset_type, symbol_or_name, quantity, current_value }, ...]
  const totalValue = portfolio.reduce((sum, p) => sum + p.current_value, 0);
  if (totalValue === 0) return { var_95: 0, var_99: 0 };

  // Fetch historical returns for each asset
  const assetReturns = {};
  for (const asset of portfolio) {
    let prices = [];
    switch (asset.asset_type) {
      case "equity":
        prices = (await getHistoricalStockPrices(asset.symbol_or_name, numDays)).map(p => p.close);
        break;
      case "crypto":
        prices = (await getHistoricalCryptoPrices(asset.symbol_or_name, numDays)).map(p => p.close);
        break;
      case "bond":
        prices = (await getHistoricalBondYields(asset.symbol_or_name, numDays)).map(p => p.value);
        break;
      case "commodity":
        prices = (await getHistoricalCommodityPrices(asset.symbol_or_name, numDays)).map(p => p.close);
        break;
      default:
        console.warn("Unknown asset type:", asset.asset_type);
    }
    assetReturns[asset.symbol_or_name] = pctChange(prices);
  }

  const minLen = Math.min(...Object.values(assetReturns).map(r => r.length));
  if (minLen === 0) return { var_95: 0, var_99: 0 };

  // Portfolio daily returns
  const portfolioReturns = [];
  for (let i = 0; i < minLen; i++) {
    let dailyReturn = 0;
    for (const asset of portfolio) {
      const weight = asset.current_value / totalValue;
      const retArr = assetReturns[asset.symbol_or_name];
      dailyReturn += weight * (retArr[i] || 0);
    }
    portfolioReturns.push(dailyReturn);
  }

  portfolioReturns.sort((a, b) => a - b);

  const percentile = (arr, p) => arr[Math.floor((p / 100) * arr.length)];
  const var95 = -percentile(portfolioReturns, 5) * totalValue;
  const var99 = -percentile(portfolioReturns, 1) * totalValue;

  return { var_95: var95, var_99: var99, portfolioReturns };
}

// ------------------- Stress Test Scenarios -------------------
function stressTest(portfolioReturns, shocks = [-0.1, -0.2, -0.3]) {
  // Apply shocks to daily returns
  const totalValue = 1; // normalized
  const results = shocks.map(shock => {
    const stressedReturns = portfolioReturns.map(r => r + shock);
    const loss = -stressedReturns.reduce((a, b) => a + b, 0) * totalValue;
    return { shock, loss };
  });
  return results;
}

// ------------------- Trigger Alerts -------------------
function checkAlerts(varMetrics, stressResults) {
  const alerts = [];

  if (varMetrics.var_95 >= ALERT_THRESHOLD.var_95)
    alerts.push(`⚠️ VaR 95% exceeds threshold: $${varMetrics.var_95.toFixed(2)}`);
  if (varMetrics.var_99 >= ALERT_THRESHOLD.var_99)
    alerts.push(`⚠️ VaR 99% exceeds threshold: $${varMetrics.var_99.toFixed(2)}`);

  stressResults.forEach(s => {
    if (s.loss >= ALERT_THRESHOLD.stressLoss)
      alerts.push(`⚠️ Stress test loss ${s.loss.toFixed(2)} exceeds threshold for shock ${s.shock}`);
  });

  return alerts;
}

// ------------------- Main Function -------------------
async function evaluatePortfolioRisk(portfolio) {
  const varMetrics = await calculatePortfolioVaR(portfolio);
  const stressResults = stressTest(varMetrics.portfolioReturns || []);
  const alerts = checkAlerts(varMetrics, stressResults);

  return {
    varMetrics,
    stressResults,
    alerts
  };
}

// ------------------- Export -------------------
module.exports = {
  evaluatePortfolioRisk
};
