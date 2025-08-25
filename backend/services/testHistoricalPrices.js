require("dotenv").config({ path: "../.env" });


const {
  getHistoricalStockPrices,
  getHistoricalCryptoPrices,
  getHistoricalBondYields,
  getHistoricalCommodityPrices
} = require("./historicalPriceService");

(async () => {
  console.log("FRED_API_KEY raw:", process.env.FRED_API_KEY);
  try {
    console.log("=== Testing Historical Stock Prices ===");
    const stockPrices = await getHistoricalStockPrices("AAPL", 10);
    console.log(stockPrices);

    console.log("=== Testing Historical Crypto Prices ===");
    const cryptoPrices = await getHistoricalCryptoPrices("BTCUSDT", 10);
    console.log(cryptoPrices);

    console.log("=== Testing Historical Bond Yields ===");
    const bondPrices = await getHistoricalBondYields("DGS10", 10); // 10-year US Treasury
    console.log(bondPrices);

    console.log("=== Testing Historical Commodity Prices ===");
    const commodityPrices = await getHistoricalCommodityPrices("gold", 10);
    console.log(commodityPrices);

    console.log("✅ All functions executed successfully!");
  } catch (err) {
    console.error("Error testing historical prices:", err.message);
  }
})();
