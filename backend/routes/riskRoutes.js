// routes/riskRoutes.js
const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  calculatePortfolioRisk,
  getStressTestResults,
  getRiskAlerts
} = require("../controllers/riskController");

const router = express.Router();

// Get complete portfolio risk analysis
router.get("/analysis", protect, calculatePortfolioRisk);

// Get stress test results only
router.get("/stress-test", protect, getStressTestResults);

// Get risk alerts
router.get("/alerts", protect, getRiskAlerts);

module.exports = router;