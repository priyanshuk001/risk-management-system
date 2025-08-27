// pages/Portfolio.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL, API_PATHS } from "../utils/apiPaths";

const Portfolio = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch portfolio assets
  const fetchPortfolio = async () => {
    try {
      const token = localStorage.getItem("token"); // if you're storing JWT
      const res = await axios.get(`${BASE_URL}${API_PATHS.PORTFOLIO.GET_ALL}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAssets(res.data.assets || []); // assuming backend sends { assets: [...] }
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching portfolio:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">📊 My Portfolio</h2>

      {loading ? (
        <p>Loading portfolio...</p>
      ) : assets.length === 0 ? (
        <p>No assets found in your portfolio.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 p-2">Type</th>
              <th className="border border-gray-200 p-2">Name</th>
              <th className="border border-gray-200 p-2">Quantity</th>
              <th className="border border-gray-200 p-2">Buy Price</th>
              <th className="border border-gray-200 p-2">Current Price</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset._id}>
                <td className="border border-gray-200 p-2">{asset.type}</td>
                <td className="border border-gray-200 p-2">{asset.name}</td>
                <td className="border border-gray-200 p-2">{asset.quantity}</td>
                <td className="border border-gray-200 p-2">${asset.buyPrice}</td>
                <td className="border border-gray-200 p-2">
                  {asset.currentPrice ? `$${asset.currentPrice}` : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Portfolio;
