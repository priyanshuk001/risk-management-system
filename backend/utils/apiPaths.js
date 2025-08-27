// utils/apiPaths.js
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
    DELETE_ASSET: (type, assetId) => `/api/v1/portfolio/delete/${type}/${assetId}`,
    GET_ALL: "/api/v1/portfolio/getall",
    EVALUATE_RISK: "/api/v1/portfolio/evaluate-risk",
  },

  ASSETS: {
    GET_EQUITY_PRICE: (symbol) => `/api/v1/assets/equity/price/${symbol}`,
    GET_CRYPTO_PRICE: (symbol) => `/api/v1/assets/crypto/price/${symbol}`,
    GET_BOND_PRICE: (symbol) => `/api/v1/assets/bond/price/${symbol}`,
    GET_COMMODITY_PRICE: (symbol) => `/api/v1/assets/commodity/price/${symbol}`,
  },
};
