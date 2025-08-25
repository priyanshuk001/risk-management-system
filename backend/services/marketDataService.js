const yahooFinance = require("yahoo-finance2").default;
const axios = require("axios");
const redis = require("../config/redis"); // Your redis client (CommonJS style)

const CACHE_TTL = {
  equity: 60,
  crypto: 60,
  bond: 3600,
  commodity: 300
};

const BINANCE_URL = "https://api.binance.com/api/v3/ticker/price";
const FRED_API_KEY = process.env.FRED_API_KEY;
const FRED_URL = "https://api.stlouisfed.org/fred/series/observations";
const COMMODITY_API_HOST = "commodity-prices2.p.rapidapi.com";
const COMMODITY_API_URL = `https://${COMMODITY_API_HOST}/api/commodity`;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// Helper: safe Redis GET
async function safeGet(key) {
  try {
    return await redis.get(key);
  } catch (e) {
    console.warn("Redis GET failed:", e.message);
    return null;
  }
}

// Helper: safe Redis SETEX
async function safeSetEX(key, ttl, value) {
  try {
    await redis.setex(key, ttl, value);
  } catch (e) {
    console.warn("Redis SETEX failed:", e.message);
  }
}

// 1) Equity (Yahoo Finance)
async function getStockPrice(symbol) {
  const key = `equity:${symbol}`;
  const cached = await safeGet(key);
  if (cached) {
    console.log(`🔄 Equity from cache: ${symbol}`);
    return JSON.parse(cached);
  }

  const data = await yahooFinance.quote(symbol);
  const priceInfo = {
    symbol: data.symbol,
    price: data.regularMarketPrice,
    currency: data.currency,
    time: new Date(data.regularMarketTime * 1000).toISOString()
  };

  await safeSetEX(key, CACHE_TTL.equity, JSON.stringify(priceInfo));
  console.log(`📡 Fetched equity: ${symbol}`);
  return priceInfo;
}

// 2) Crypto (Binance)
async function getCryptoPrice(symbol) {
  const key = `crypto:${symbol}`;
  const cached = await safeGet(key);
  if (cached) {
    console.log(`🔄 Crypto from cache: ${symbol}`);
    return JSON.parse(cached);
  }

  const { data } = await axios.get(BINANCE_URL, { params: { symbol } });
  // data = { symbol: 'BTCUSDT', price: '...' }
  await safeSetEX(key, CACHE_TTL.crypto, JSON.stringify(data));

  console.log(`📡 Fetched crypto: ${symbol}`);
  return data;
}

// 3) Bond Yield (FRED)
async function getBondYield(symbol) {
  try {
    // Example FRED API endpoint (replace with your actual one + API key if required)
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${symbol}&api_key=${FRED_API_KEY}&file_type=json`;

    const response = await axios.get(url);

    const observations = response.data.observations;

    if (!observations || observations.length === 0) return null;

    // Get the latest entry (last element)
    const latest = observations[observations.length - 1];

    return {
      date: latest.date,
      value: latest.value,
    };
  } catch (error) {
    console.error("Error fetching bond price:", error.message);
    return null;
  }
}


// 4) Commodity (RapidAPI "Commodity Prices" API)
const nameMap = {
  gold: "XAU/USD",
  silver: "XAG/USD",
  oil: "Crude Oil",
  brent: "Brent",
  "natural gas": "Natural gas",
  gasoline: "Gasoline",
  "heating oil": "Heating Oil"
};

async function getCommodityPrice(name) {
  const key = `commodity:${name.toLowerCase()}`;
  
  // Check cache first
  const cached = await safeGet(key);
  if (cached) {
    console.log(`🔄 Commodity from cache: ${name}`);
    return JSON.parse(cached);
  }

  // Fetch all commodities from API
  const options = {
    method: "GET",
    url: "https://commodity-prices2.p.rapidapi.com/api/Commodities",
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host": "commodity-prices2.p.rapidapi.com"
    }
  };

  const { data } = await axios.request(options);

  // Map requested name to API name
  const apiName = nameMap[name.toLowerCase()];
  if (!apiName) {
    throw new Error(`Commodity mapping not found for: ${name}`);
  }

  const commodity = data.find(item => item.name === apiName);
  if (!commodity) {
    console.log("Available commodities:", data.map(c => c.name));
    throw new Error(`Commodity ${name} not found in API`);
  }

  // Cache the result
  await safeSetEX(key, CACHE_TTL.commodity, JSON.stringify(commodity));
  console.log(`📡 Fetched commodity: ${name}`);
  return commodity;
}





module.exports = {
  getStockPrice,
  getCryptoPrice,
  getBondYield,
  getCommodityPrice
};
