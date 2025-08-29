export const BASE_URL = "http://localhost:8000";

export const API_PATHS = {
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    REGISTER: "/api/v1/auth/register",
    GET_USER_INFO: "/api/v1/auth/getUser",
  },

  PORTFOLIO: {
    ADD_ASSET: "/api/v1/portfolio/add",
    UPDATE_ASSET: (assetId) => `/api/v1/portfolio/update/${assetId}`,
    DELETE_ASSET: (assetId, type) => `/api/v1/portfolio/delete/${assetId}/${type}`,
    GET_ALL: "/api/v1/portfolio/getall",
    GET_SUMMARY: "/api/v1/portfolio/getportfoliosummary",
    EVALUATE_RISK: "/api/v1/portfolio/evaluate-risk",
    GET_HISTORICAL: "/api/v1/portfolio/historical",
    GET_HISTORICAL_DAYS: (days) => `/api/v1/portfolio/historical?days=${days}`,
  },

  ASSETS: {
    GET_EQUITY_PRICE: (symbol) => `/api/v1/assets/equity/price/${symbol}`,
    GET_CRYPTO_PRICE: (symbol) => `/api/v1/assets/crypto/price/${symbol}`,
    GET_BOND_PRICE: (symbol) => `/api/v1/assets/bond/price/${symbol}`,
    GET_COMMODITY_PRICE: (symbol) => `/api/v1/assets/commodity/price/${symbol}`,
  },

  ALERTS: {
    ADD_ALERT: "/api/v1/alerts/add",
    GET_ALL: "/api/v1/alerts/getall",
  },
};
