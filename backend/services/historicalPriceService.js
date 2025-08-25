const yahooFinance = require("yahoo-finance2").default;
const axios = require("axios");
require("dotenv").config();
const redis = require("../config/redis"); // Redis client
const CACHE_TTL = {
    equity: 3600,      // 1 hour
    crypto: 300,       // 5 minutes
    bond: 3600,        // 1 hour
    commodity: 300     // 5 minutes
};

// ------------------- Redis helpers -------------------
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

// ------------------- 1) Historical Equity Prices -------------------
async function getHistoricalStockPrices(symbol, numDays = 252) {
    const key = `hist:equity:${symbol}:${numDays}`;
    const cached = await safeGet(key);
    if (cached) {
        console.log(`🔄 Historical equity from cache: ${symbol}`);
        return JSON.parse(cached);
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - numDays * 1.5); // extra buffer for weekends

    const queryOptions = { period1: startDate.toISOString().split("T")[0], period2: endDate.toISOString().split("T")[0], interval: "1d" };
    const data = await yahooFinance.historical(symbol, queryOptions);

    const prices = data.map(d => ({ date: d.date.toISOString(), close: d.close }));

    await safeSetEX(key, CACHE_TTL.equity, JSON.stringify(prices));
    console.log(`📡 Fetched historical equity: ${symbol}`);
    return prices;
}

// ------------------- 2) Historical Crypto Prices (Binance) -------------------
async function getHistoricalCryptoPrices(symbol, numDays = 252) {
    const key = `hist:crypto:${symbol}:${numDays}`;
    const cached = await safeGet(key);
    if (cached) {
        console.log(`🔄 Historical crypto from cache: ${symbol}`);
        return JSON.parse(cached);
    }

    // Binance API: daily candles (klines)
    const url = "https://api.binance.com/api/v3/klines";
    const endTime = Date.now();
    const startTime = endTime - numDays * 24 * 60 * 60 * 1000; // milliseconds

    const { data } = await axios.get(url, {
        params: { symbol, interval: "1d", startTime, endTime, limit: 1000 }
    });

    // data = [[time, open, high, low, close, volume, ...], ...]
    const prices = data.map(d => ({ date: new Date(d[0]).toISOString(), close: parseFloat(d[4]) }));

    await safeSetEX(key, CACHE_TTL.crypto, JSON.stringify(prices));
    console.log(`📡 Fetched historical crypto: ${symbol}`);
    return prices;
}

// ------------------- 3) Historical Bond Yields (FRED) -------------------
const FRED_API_KEY = process.env.FRED_API_KEY;

async function getHistoricalBondYields(seriesId, numDays = 252) {
  const key = `hist:bond:${seriesId}:${numDays}`;
  const cached = await safeGet(key);
  if (cached) {
    console.log(`🔄 Historical bond from cache: ${seriesId}`);
    return JSON.parse(cached);
  }

  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - numDays * 1.5); // buffer for weekends/holidays

    const params = {
      series_id: seriesId,
      api_key: FRED_API_KEY,
      file_type: "json",
      observation_start: startDate.toISOString().split("T")[0],
      observation_end: endDate.toISOString().split("T")[0]
    };

    const url = `https://api.stlouisfed.org/fred/series/observations`;

    console.log("📡 Fetching FRED bond data with params:", params);

    const { data } = await axios.get(url, { params });

    if (!data.observations || data.observations.length === 0) {
      throw new Error(`No observations returned for ${seriesId}`);
    }

    const observations = data.observations
      .slice(-numDays)
      .map(o => ({ date: o.date, value: parseFloat(o.value) }));

    await safeSetEX(key, CACHE_TTL.bond, JSON.stringify(observations));
    console.log(`✅ Fetched historical bond: ${seriesId}`);
    return observations;

  } catch (error) {
    // Build the full debug URL for copy-paste
    const debugUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json`;
    console.error(`❌ Error fetching historical bond (${seriesId}):`, error.message);
    console.error(`🔍 Debug URL: ${debugUrl}`);
    return [];
  }
}


// ------------------- 4) Historical Commodity Prices (RapidAPI) -------------------
const COMMODITY_API_HOST = "commodity-prices2.p.rapidapi.com";
const COMMODITY_API_URL = `https://${COMMODITY_API_HOST}/api/commodity`;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

const commodityNameMap = {
    gold: "XAU/USD",
    silver: "XAG/USD",
    oil: "Crude Oil",
    brent: "Brent",
    "natural gas": "Natural gas",
    gasoline: "Gasoline",
    "heating oil": "Heating Oil"
};

async function getHistoricalCommodityPrices(name, numDays = 252) {
    const key = `hist:commodity:${name}:${numDays}`;
    const cached = await safeGet(key);
    if (cached) {
        console.log(`🔄 Historical commodity from cache: ${name}`);
        return JSON.parse(cached);
    }

    const apiName = commodityNameMap[name.toLowerCase()];
    if (!apiName) throw new Error(`Commodity mapping not found for: ${name}`);

    const options = {
        method: "GET",
        url: `${COMMODITY_API_URL}/${encodeURIComponent(apiName)}/historical`, // check if API supports this
        headers: {
            "x-rapidapi-key": RAPIDAPI_KEY,
            "x-rapidapi-host": COMMODITY_API_HOST
        },
        params: { limit: numDays }
    };

    const { data } = await axios.request(options);

    // Expected format: [{ date: 'YYYY-MM-DD', close: price }, ...]
    const prices = data.map(d => ({ date: d.date, close: d.price }));

    await safeSetEX(key, CACHE_TTL.commodity, JSON.stringify(prices));
    console.log(`📡 Fetched historical commodity: ${name}`);
    return prices;
}

// ------------------- Export functions -------------------
module.exports = {
    getHistoricalStockPrices,
    getHistoricalCryptoPrices,
    getHistoricalBondYields,
    getHistoricalCommodityPrices
};
