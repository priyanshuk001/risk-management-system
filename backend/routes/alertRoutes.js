const express = require("express");
const router = express.Router();
const { addAlert, getAlerts } = require("../controllers/alertController");
const { protect } = require("../middlewares/authMiddleware");

// POST /api/v1/alerts/add
router.post("/add", protect, addAlert);
router.get("/getall", protect, getAlerts);

module.exports = router;
