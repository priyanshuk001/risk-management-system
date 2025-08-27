const yahooFinance = require("yahoo-finance2").default;
const axios = require("axios");
const redis = require("../config/redis"); // Redis client

const CACHE_TTL = {
  equity: 60,      // 1 min
  crypto: 60,      // 1 min
  bond: 3600,      // 1 hour
  commodity: 300   // 5 min
};

const BINANCE_URL = "https://api.binance.com/api/v3/ticker/price";
const FRED_API_KEY = process.env.FRED_API_KEY;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// ---------------- Helpers ----------------
async function safeGet(key) {
  try {
    return await redis.get(key);
  } catch (e) {
    console.warn("Redis GET failed:", e.message);
    return null;
  }
}

async function safeSetEX(key, ttl, value) {
  try {
    await redis.setex(key, ttl, value);
  } catch (e) {
    console.warn("Redis SETEX failed:", e.message);
  }
}

// ---------------- Controllers ----------------

// Equity
const getEquityPrice = async (req, res) => {
  try {
    const { symbol } = req.params;
    const key = `equity:${symbol}`;

    const cached = await safeGet(key);
    if (cached) return res.json(JSON.parse(cached));

    const data = await yahooFinance.quote(symbol);
    if (!data) return res.status(404).json({ message: "Equity not found" });

    const response = {
      symbol: data.symbol,
      currentPrice: data.regularMarketPrice,
      price: data.regularMarketPrice,
      currency: data.currency,
      time: new Date(data.regularMarketTime * 1000).toISOString()
    };

    await safeSetEX(key, CACHE_TTL.equity, JSON.stringify(response));
    res.json(response);
  } catch (error) {
    console.error("Equity fetch error:", error.message);
    res.status(500).json({ message: "Failed to fetch equity price" });
  }
};

// Crypto
const getCryptoPrice = async (req, res) => {
  try {
    const { symbol } = req.params;
    const key = `crypto:${symbol}`;

    const cached = await safeGet(key);
    if (cached) return res.json(JSON.parse(cached));

    const { data } = await axios.get(BINANCE_URL, { params: { symbol } });
    if (!data) return res.status(404).json({ message: "Crypto not found" });

    const response = {
      symbol: data.symbol,
      currentPrice: parseFloat(data.price),
      price: parseFloat(data.price)
    };

    await safeSetEX(key, CACHE_TTL.crypto, JSON.stringify(response));
    res.json(response);
  } catch (error) {
    console.error("Crypto fetch error:", error.message);
    res.status(500).json({ message: "Failed to fetch crypto price" });
  }
};

// Bond
const getBondPrice = async (req, res) => {
  try {
    const { symbol } = req.params;

    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${symbol}&api_key=${FRED_API_KEY}&file_type=json`;
    const { data } = await axios.get(url);

    if (!data.observations?.length) return res.status(404).json({ message: "Bond not found" });

    const latest = data.observations[data.observations.length - 1];
    const response = {
      date: latest.date,
      currentPrice: parseFloat(latest.value),
      price: parseFloat(latest.value)
    };

    res.json(response);
  } catch (error) {
    console.error("Bond fetch error:", error.message);
    res.status(500).json({ message: "Failed to fetch bond price" });
  }
};

// Commodity
const nameMap = {
  gold: "XAU/USD",
  silver: "XAG/USD",
  oil: "Crude Oil",
  brent: "Brent",
  "natural gas": "Natural gas",
  gasoline: "Gasoline",
  "heating oil": "Heating Oil"
};

const getCommodityPrice = async (req, res) => {
  try {
    const { symbol } = req.params;
    const key = `commodity:${symbol.toLowerCase()}`;

    const cached = await safeGet(key);
    if (cached) return res.json(JSON.parse(cached));

    const options = {
      method: "GET",
      url: "https://commodity-prices2.p.rapidapi.com/api/Commodities",
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "commodity-prices2.p.rapidapi.com"
      }
    };

    const { data } = await axios.request(options);

    const apiName = nameMap[symbol.toLowerCase()];
    if (!apiName) return res.status(400).json({ message: `No mapping found for ${symbol}` });

    const commodity = data.find(item => item.name === apiName);
    if (!commodity) return res.status(404).json({ message: "Commodity not found" });

    const response = {
      ...commodity,
      currentPrice: parseFloat(commodity.price),
      price: parseFloat(commodity.price)
    };

    await safeSetEX(key, CACHE_TTL.commodity, JSON.stringify(response));
    res.json(response);
  } catch (error) {
    console.error("Commodity fetch error:", error.message);
    res.status(500).json({ message: "Failed to fetch commodity price" });
  }
};

module.exports = {
  getEquityPrice,
  getCryptoPrice,
  getBondPrice,
  getCommodityPrice
};
