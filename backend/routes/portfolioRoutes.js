const express = require("express");
const {
  add_asset,
  update_asset,
  delete_asset,
  get_all,
  get_portfolio_summary,
  evaluate_risk
} = require("../controllers/portfolioController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ Routes with authentication
router.post("/add", protect, add_asset);
router.put("/update/:id", protect, update_asset);
router.delete("/delete/:id/:type", protect, delete_asset);
router.get("/getall", protect, get_all);
router.get("/getportfoliosummary", protect, get_portfolio_summary);
router.get("/evaluate-risk",protect, evaluate_risk);


module.exports = router;
