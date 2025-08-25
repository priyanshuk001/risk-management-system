const { evaluatePortfolioRisk } = require("./riskengine");
require("dotenv").config({ path: "../.env" });

const portfolio = [
  { asset_type: "equity", symbol_or_name: "AAPL", quantity: 10, current_value: 1700 },
  { asset_type: "crypto", symbol_or_name: "BTCUSDT", quantity: 1, current_value: 30000 },
  { asset_type: "bond", symbol_or_name: "DGS10", quantity: 5, current_value: 5000 }
];

(async () => {
  try {
    const riskReport = await evaluatePortfolioRisk(portfolio);
    console.log("=== Portfolio Risk Report ===");
    console.log("VaR Metrics:", riskReport.varMetrics);
    console.log("Stress Test Results:", riskReport.stressResults);
    console.log("Alerts:", riskReport.alerts);
  } catch (err) {
    console.error("Error evaluating portfolio risk:", err.message);
  }
})();
