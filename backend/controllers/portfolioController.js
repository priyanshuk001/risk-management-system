const Bond = require("../models/Bond");
const Commodity = require("../models/Commodity");
const Crypto = require("../models/Crypto");
const Equity = require("../models/Equity");
const axios = require("axios");
const { BASE_URL, API_PATHS } = require("../utils/apiPaths");
const { evaluatePortfolioRisk } = require("../services/riskEngine"); // adjust path if needed
const AlertHistory = require("../models/alerthistory"); // alert model
const { 
  getHistoricalStockPrices, 
  getHistoricalCryptoPrices, 
  getHistoricalBondYields, 
  getHistoricalCommodityPrices 
} = require('../services/historicalPriceService'); // Adjust path as needed


// Helper fn: correct model choose karo
function getModel(type) {
  switch (type) {
    case "equity":
      return Equity;
    case "crypto":
      return Crypto;
    case "commodity":
      return Commodity;
    case "bond":
      return Bond;
    default:
      throw new Error("Invalid asset type");
  }
}

// Add asset
exports.add_asset = async (req, res) => {
  const userId = req.user.id;

  try {
    const { type, name, symbol, quantity, buyPrice, couponRate, maturityDate, date } = req.body;

    // Choose model
    const Model = getModel(type);

    if (type === "Bond") {
      if (!name || !symbol || !quantity || !buyPrice || !couponRate || !maturityDate) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const newBond = new Model({
        userId,
        name,
        symbol,
        quantity,
        buyPrice,
        couponRate,
        maturityDate,
        date: date ? new Date(date) : new Date(),
      });

      await newBond.save();
      return res.status(201).json(newBond);

    } else {
      if (!name || !quantity || !buyPrice || !symbol) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const newAsset = new Model({
        userId,
        name,
        symbol,
        quantity,
        buyPrice,
        date: date ? new Date(date) : new Date(),
      });

      await newAsset.save();
      return res.status(201).json(newAsset);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Update asset
exports.update_asset = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;  // asset ID from URL
  const { type, ...updateFields } = req.body;

  try {
    const Model = getModel(type);

    const updatedAsset = await Model.findOneAndUpdate(
      { _id: id, userId },
      updateFields,
      { new: true } // return updated doc
    );

    if (!updatedAsset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    res.status(200).json(updatedAsset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};


// ✅ Delete asset
exports.delete_asset = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, id } = req.params;   // ⬅️ type comes from URL params now

    const Model = getModel(type);      // bond, equity, commodity, etc.
    if (!Model) {
      return res.status(400).json({ message: "Invalid asset type" });
    }

    const asset = await Model.findOneAndDelete({ _id: id, userId });
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    res.status(200).json({ message: `${type} deleted successfully` });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



// ✅ Get all assets of a type
exports.get_all = async (req, res) => {
  try {
    const userId = req.user.id;

    const equities = await Equity.find({ userId });
    const bonds = await Bond.find({ userId });
    const cryptos = await Crypto.find({ userId });
    const commodities = await Commodity.find({ userId });

    res.status(200).json({
      success: true,
      assets: {
        equities,
        bonds,
        cryptos,
        commodities
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


exports.get_portfolio_summary = async (req, res) => {
  try {
    const userId = req.user.id;

    // fetch assets from DB
    const equities = await Equity.find({ userId });
    const bonds = await Bond.find({ userId });
    const cryptos = await Crypto.find({ userId });
    const commodities = await Commodity.find({ userId });

    // helper to fetch current price from your own API
    const fetchPrice = async (url) => {
      try {
        const { data } = await axios.get(`${BASE_URL}${url}`);
        return data.currentPrice || data.price || 0;
      } catch (e) {
        console.warn("Price fetch failed:", url, e.message);
        return 0;
      }
    };

    // calculate values
    let equityTotal = 0, equityInvested = 0;
    for (let eq of equities) {
      const price = await fetchPrice(API_PATHS.ASSETS.GET_EQUITY_PRICE(eq.symbol));
      equityTotal += price * eq.quantity;
      equityInvested += (eq.buyPrice || 0) * eq.quantity;
    }

    let bondTotal = 0, bondInvested = 0;
    for (let bond of bonds) {
      const price = await fetchPrice(API_PATHS.ASSETS.GET_BOND_PRICE(bond.symbol));
      bondTotal += price * bond.quantity;
      bondInvested += (bond.buyPrice || 0) * bond.quantity;
    }

    let cryptoTotal = 0, cryptoInvested = 0;
    for (let c of cryptos) {
      const price = await fetchPrice(API_PATHS.ASSETS.GET_CRYPTO_PRICE(c.symbol));
      cryptoTotal += price * c.quantity;
      cryptoInvested += (c.buyPrice || 0) * c.quantity;
    }

    let commodityTotal = 0, commodityInvested = 0;
    for (let com of commodities) {
      const price = await fetchPrice(API_PATHS.ASSETS.GET_COMMODITY_PRICE(com.symbol));
      commodityTotal += price * com.quantity;
      commodityInvested += (com.buyPrice || 0) * com.quantity;
    }

    const totalValue = equityTotal + bondTotal + cryptoTotal + commodityTotal;
    const totalInvested = equityInvested + bondInvested + cryptoInvested + commodityInvested;

    const toPercent = (val) =>
      totalValue > 0 ? ((val / totalValue) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      totalValue,
      totalInvested,
      breakdown: {
        equities: { 
          value: equityTotal, 
          invested: equityInvested,
          percentage: toPercent(equityTotal) 
        },
        bonds: { 
          value: bondTotal, 
          invested: bondInvested,
          percentage: toPercent(bondTotal) 
        },
        cryptos: { 
          value: cryptoTotal, 
          invested: cryptoInvested,
          percentage: toPercent(cryptoTotal) 
        },
        commodities: { 
          value: commodityTotal, 
          invested: commodityInvested,
          percentage: toPercent(commodityTotal) 
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



exports.evaluate_risk = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch all assets
    const equities = await Equity.find({ userId });
    const bonds = await Bond.find({ userId });
    const cryptos = await Crypto.find({ userId });
    const commodities = await Commodity.find({ userId });

    // 2. Transform into riskEngine format
    const portfolio = [];

    equities.forEach(e => {
      portfolio.push({
        asset_type: "equity",
        symbol_or_name: e.symbol,
        quantity: e.quantity,
        current_value: e.quantity * e.buyPrice // or latest value if you store it
      });
    });

    cryptos.forEach(c => {
      portfolio.push({
        asset_type: "crypto",
        symbol_or_name: c.symbol,
        quantity: c.quantity,
        current_value: c.quantity * c.buyPrice
      });
    });

    bonds.forEach(b => {
      portfolio.push({
        asset_type: "bond",
        symbol_or_name: b.symbol,
        quantity: b.quantity,
        current_value: b.quantity * b.buyPrice
      });
    });

    commodities.forEach(cm => {
      portfolio.push({
        asset_type: "commodity",
        symbol_or_name: cm.symbol,
        quantity: cm.quantity,
        current_value: cm.quantity * cm.buyPrice
      });
    });

    if (portfolio.length === 0) {
      return res.status(400).json({ success: false, message: "No assets found in portfolio" });
    }

    // 3. Evaluate risk using risk engine
    const { varMetrics, stressResults, alerts } = await evaluatePortfolioRisk(portfolio);

    // 4. Store alerts in DB if any
    if (alerts && alerts.length > 0) {
      const alertDocs = alerts.map(msg => ({
        userId,
        message: msg
      }));
      await AlertHistory.insertMany(alertDocs);
    }

    // 5. Return response (without portfolioReturns)
    res.status(200).json({
      success: true,
      risk: {
        varMetrics: {
          var_95: varMetrics.var_95,
          var_99: varMetrics.var_99
        },
        stressResults,
        alerts
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};


exports.get_historical_data = async (req, res) => {
  try {
    const userId = req.user.id;
    const numDays = parseInt(req.query.days) || 365; // Default to 365 days, allow override
    
    console.log(`📊 Fetching ${numDays} days of portfolio value history for user: ${userId}`);

    // Fetch user's assets from DB
    const equities = await Equity.find({ userId });
    const bonds = await Bond.find({ userId });
    const cryptos = await Crypto.find({ userId });
    const commodities = await Commodity.find({ userId });

    // Object to store daily portfolio values: { "2024-08-29": 15420.50, "2024-08-28": 15100.23 }
    const portfolioDailyValues = {};

    // Helper function to add daily values to portfolio total
    const addDailyValues = (historicalData, quantity) => {
      for (const dayData of historicalData) {
        const date = dayData.date.split('T')[0]; // Extract YYYY-MM-DD
        const dailyValue = (dayData.close || dayData.value) * quantity; // Handle both price and value fields
        
        if (!portfolioDailyValues[date]) {
          portfolioDailyValues[date] = 0;
        }
        portfolioDailyValues[date] += dailyValue;
      }
    };

    // Fetch and aggregate historical prices for equities
    console.log(`📈 Processing ${equities.length} equities...`);
    for (const equity of equities) {
      try {
        const history = await getHistoricalStockPrices(equity.symbol, numDays);
        addDailyValues(history, equity.quantity);
        console.log(`✅ Added ${equity.symbol} (${equity.quantity} shares)`);
      } catch (error) {
        console.error(`❌ Error fetching equity ${equity.symbol}:`, error.message);
      }
    }

    // Fetch and aggregate historical yields for bonds
    console.log(`📊 Processing ${bonds.length} bonds...`);
    for (const bond of bonds) {
      try {
        const seriesId = bond.symbol || bond.seriesId;
        if (seriesId) {
          const history = await getHistoricalBondYields(seriesId, numDays);
          addDailyValues(history, bond.quantity);
          console.log(`✅ Added ${seriesId} bond (${bond.quantity} units)`);
        }
      } catch (error) {
        console.error(`❌ Error fetching bond ${bond.symbol}:`, error.message);
      }
    }

    // Fetch and aggregate historical prices for cryptos
    console.log(`₿ Processing ${cryptos.length} cryptocurrencies...`);
    for (const crypto of cryptos) {
      try {
        const history = await getHistoricalCryptoPrices(crypto.symbol, numDays);
        addDailyValues(history, crypto.quantity);
        console.log(`✅ Added ${crypto.symbol} (${crypto.quantity} units)`);
      } catch (error) {
        console.error(`❌ Error fetching crypto ${crypto.symbol}:`, error.message);
      }
    }

    // Fetch and aggregate historical prices for commodities
    console.log(`🏅 Processing ${commodities.length} commodities...`);
    for (const commodity of commodities) {
      try {
        const history = await getHistoricalCommodityPrices(commodity.name || commodity.symbol, numDays);
        addDailyValues(history, commodity.quantity);
        console.log(`✅ Added ${commodity.name} (${commodity.quantity} units)`);
      } catch (error) {
        console.error(`❌ Error fetching commodity ${commodity.name}:`, error.message);
      }
    }

    // Convert to sorted array format for frontend consumption
    const sortedDates = Object.keys(portfolioDailyValues).sort();
    const portfolioHistory = sortedDates.map(date => ({
      date,
      totalValue: parseFloat(portfolioDailyValues[date].toFixed(2))
    }));

    // Calculate some useful metrics
    const currentValue = portfolioHistory.length > 0 ? portfolioHistory[portfolioHistory.length - 1].totalValue : 0;
    const startValue = portfolioHistory.length > 0 ? portfolioHistory[0].totalValue : 0;
    const totalReturn = startValue > 0 ? ((currentValue - startValue) / startValue) * 100 : 0;

    console.log(`✅ Portfolio history calculated: ${portfolioHistory.length} data points`);
    console.log(`📊 Portfolio value: $${startValue.toFixed(2)} → $${currentValue.toFixed(2)} (${totalReturn.toFixed(2)}%)`);

    res.status(200).json({
      success: true,
      portfolioHistory,
      summary: {
        totalAssets: equities.length + bonds.length + cryptos.length + commodities.length,
        dataRange: `${numDays} days`,
        dataPoints: portfolioHistory.length,
        currentValue,
        startValue,
        totalReturn: parseFloat(totalReturn.toFixed(2)),
        fetchedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("❌ Error fetching portfolio historical data:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};



