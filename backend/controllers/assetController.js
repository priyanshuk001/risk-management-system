const { getStockPrice, getCryptoPrice, getBondYield, getCommodityPrice } = require("../services/marketDataService");

// ---------------- Equity ----------------
const getEquityPrice = async (req, res) => {
  const { symbol } = req.params;
  const data = await getStockPrice(symbol);

  if (!data) return res.status(404).json({ message: "Equity not found" });
  res.json(data);
};

// ---------------- Crypto ----------------
const getCryptoPriceHandler = async (req, res) => {
  const { symbol } = req.params;
  const data = await getCryptoPrice(symbol);

  if (!data) return res.status(404).json({ message: "Crypto not found" });
  res.json(data);
};

// ---------------- Bonds ----------------
const getBondPrice = async (req, res) => {
  const { symbol } = req.params;
  const data = await getBondYield(symbol);

  if (!data) return res.status(404).json({ message: "Bond not found" });
  res.json(data);
};

// ---------------- Commodities ----------------
const getCommodityPriceHandler = async (req, res) => {
  const { symbol } = req.params;
  const data = await getCommodityPrice(symbol);

  if (!data) return res.status(404).json({ message: "Commodity not found" });
  res.json(data);
};

module.exports = {
  getEquityPrice,
  getCryptoPriceHandler,
  getBondPrice,
  getCommodityPriceHandler,
};
