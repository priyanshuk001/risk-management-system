const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  getEquityPrice,
  getCryptoPriceHandler,
  getBondPrice,
  getCommodityPriceHandler,
} = require("../controllers/assetController");


router.get("/equity/price/:symbol", protect, getEquityPrice);
router.get("/crypto/price/:symbol", protect, getCryptoPriceHandler);
router.get("/bond/price/:symbol", protect, getBondPrice);
router.get("/commodity/price/:symbol", protect, getCommodityPriceHandler);

module.exports = router;
