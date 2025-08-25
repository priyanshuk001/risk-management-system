const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

// Import services for each asset type
const { getStockPrice, getCryptoPrice, getBondYield, getCommodityPrice } = require("../services/marketDataService");   // Equity

// ---------------- Equity ----------------
router.get("/equity/price/:symbol", protect, async (req, res) => {
  const { symbol } = req.params;
  const data = await getStockPrice(symbol);

  if (!data) return res.status(404).json({ message: "Equity not found" });
  res.json(data);
});

// ---------------- Crypto ----------------
router.get("/crypto/price/:symbol", protect, async (req, res) => {
  const { symbol } = req.params;
  const data = await getCryptoPrice(symbol);

  if (!data) return res.status(404).json({ message: "Crypto not found" });
  res.json(data);
});

// ---------------- Bonds ----------------
router.get("/bond/price/:symbol", protect, async (req, res) => {
  const { symbol } = req.params;
  const data = await getBondYield(symbol);

  if (!data) return res.status(404).json({ message: "Bond not found" });
  res.json(data);
});

// ---------------- Commodities ----------------
router.get("/commodity/price/:symbol", protect, async (req, res) => {
  const { symbol } = req.params;
  const data = await getCommodityPrice(symbol);

  if (!data) return res.status(404).json({ message: "Commodity not found" });
  res.json(data);
});

module.exports = router;
