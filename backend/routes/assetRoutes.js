const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  getEquityPrice,
  getCryptoPrice,
  getBondPrice,
  getCommodityPrice,
} = require("../controllers/assetController");


router.get("/equity/price/:symbol",  getEquityPrice);
router.get("/crypto/price/:symbol",  getCryptoPrice);
router.get("/bond/price/:symbol",  getBondPrice);
router.get("/commodity/price/:symbol",  getCommodityPrice);

module.exports = router;
