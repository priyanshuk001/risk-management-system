// src/components/portfolio/PortfolioPage.jsx
import React, { useCallback, useEffect, useState, useDeferredValue } from 'react';
import Layout from './Layout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { Plus, TrendingUp, Coins, Building, BarChart3 } from 'lucide-react';
import AssetModal from '../../components/AssetModal';
import AssetsTable from '../../components/AssetsTable';

const PortfolioPage = () => {
  const [assets, setAssets] = useState([]);
  const [portfolioSummary, setPortfolioSummary] = useState({
    totalValue: 0,
    totalInvested: 0,
    breakdown: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const assetTypes = [
    { value: 'equity', label: 'Equity', icon: TrendingUp, color: 'blue' },
    { value: 'crypto', label: 'Crypto', icon: Coins, color: 'yellow' },
    { value: 'bond', label: 'Bond', icon: Building, color: 'green' },
    { value: 'commodity', label: 'Commodity', icon: BarChart3, color: 'purple' },
  ];

  const fetchPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axiosInstance.get(API_PATHS.PORTFOLIO.GET_ALL);

      if (res.data.success && res.data.assets) {
        const { equities = [], bonds = [], cryptos = [], commodities = [] } = res.data.assets;

        const allAssets = [
          ...equities.map((asset) => ({ ...asset, type: 'Equity' })),
          ...bonds.map((asset) => ({ ...asset, type: 'Bond' })),
          ...cryptos.map((asset) => ({ ...asset, type: 'Crypto' })),
          ...commodities.map((asset) => ({ ...asset, type: 'Commodity' })),
        ];

        setAssets(allAssets);
      } else {
        setAssets([]);
      }
    } catch (error) {
      console.error('❌ Error fetching portfolio:', error);
      setError(error.response?.data?.message || 'Failed to fetch portfolio');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPortfolioSummary = useCallback(async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.PORTFOLIO.GET_SUMMARY);

      if (res.data.success) {
        setPortfolioSummary({
          totalValue: res.data.totalValue || 0,
          totalInvested: res.data.totalInvested || 0,
          breakdown: res.data.breakdown || {},
        });
      }
    } catch (error) {
      console.error('❌ Error fetching portfolio summary:', error);
    }
  }, []);

  const handleAddSubmit = useCallback(
    async (local) => {
      setSubmitting(true);
      try {
        const payload = {
          type: local.type,
          name: local.name,
          symbol: String(local.symbol || '').toUpperCase(),
          quantity: parseFloat(local.quantity),
          buyPrice: parseFloat(local.buyPrice),
        };

        await axiosInstance.post(API_PATHS.PORTFOLIO.ADD_ASSET, payload);

        setShowAddModal(false);
        await Promise.all([fetchPortfolio(), fetchPortfolioSummary()]);
      } catch (error) {
        console.error('❌ Error adding asset:', error);
        alert(error.response?.data?.message || 'Failed to add asset');
      } finally {
        setSubmitting(false);
      }
    },
    [fetchPortfolio, fetchPortfolioSummary]
  );

  const handleUpdateSubmit = useCallback(
    async (local) => {
      if (!editingAsset?._id) return;
      setSubmitting(true);
      try {
        const payload = {
          name: local.name,
          symbol: String(local.symbol || '').toUpperCase(),
          quantity: parseFloat(local.quantity),
          buyPrice: parseFloat(local.buyPrice),
        };

        await axiosInstance.put(API_PATHS.PORTFOLIO.UPDATE_ASSET(editingAsset._id), payload);

        setShowEditModal(false);
        setEditingAsset(null);
        await Promise.all([fetchPortfolio(), fetchPortfolioSummary()]);
      } catch (error) {
        console.error('❌ Error updating asset:', error);
        alert(error.response?.data?.message || 'Failed to update asset');
      } finally {
        setSubmitting(false);
      }
    },
    [editingAsset, fetchPortfolio, fetchPortfolioSummary]
  );

  const handleDeleteAsset = useCallback(
    async (asset) => {
      if (!confirm(`Are you sure you want to delete ${asset.symbol}?`)) return;

      try {
        const assetType = String(asset.type || '').toLowerCase();
        await axiosInstance.delete(API_PATHS.PORTFOLIO.DELETE_ASSET(asset._id, assetType));
        await Promise.all([fetchPortfolio(), fetchPortfolioSummary()]);
      } catch (error) {
        console.error('❌ Error deleting asset:', error);
        alert(error.response?.data?.message || 'Failed to delete asset');
      }
    },
    [fetchPortfolio, fetchPortfolioSummary]
  );

  const openEditModal = useCallback((asset) => {
    setEditingAsset(asset);
    setShowEditModal(true);
  }, []);

  const closeModals = useCallback(() => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingAsset(null);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchPortfolio(), fetchPortfolioSummary()]);
    };
    loadData();
  }, [fetchPortfolio, fetchPortfolioSummary]);

  const deferredAssets = useDeferredValue(assets);

  const portfolioContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-lg text-gray-600">Loading portfolio...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading portfolio</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => Promise.all([fetchPortfolio(), fetchPortfolioSummary()])}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Portfolio</h2>
              <p className="mt-1 text-sm text-gray-600">Track and manage your investment portfolio</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors flex items-center"
              >
                <Plus size={16} className="mr-1" />
                Add Asset
              </button>
              <button
                onClick={() => Promise.all([fetchPortfolio(), fetchPortfolioSummary()])}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Assets</p>
                <p className="text-2xl font-bold text-gray-900">{assets.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Invested</p>
                <p className="text-2xl font-bold text-gray-900">
                  $
                  {portfolioSummary.totalInvested.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  $
                  {portfolioSummary.totalValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {assets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No assets found</h3>
              <p className="mt-2 text-sm text-gray-500">
                Get started by adding your first asset to the portfolio.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center mx-auto"
                >
                  <Plus size={16} className="mr-2" />
                  Add Your First Asset
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Portfolio Holdings</h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors flex items-center"
              >
                <Plus size={14} className="mr-1" />
                Add Asset
              </button>
            </div>

            <AssetsTable
              assets={deferredAssets}
              assetTypes={assetTypes}
              onEdit={openEditModal}
              onDelete={handleDeleteAsset}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout>
      {portfolioContent()}

      {showAddModal && (
        <AssetModal
          isEdit={false}
          initial={{ type: 'equity', name: '', symbol: '', quantity: '', buyPrice: '' }}
          submitting={submitting}
          onSubmit={handleAddSubmit}
          onClose={closeModals}
        />
      )}
      {showEditModal && (
        <AssetModal
          isEdit
          initial={{
            type: editingAsset?.type?.toLowerCase() ?? 'equity',
            name: editingAsset?.name ?? '',
            symbol: editingAsset?.symbol ?? '',
            quantity: editingAsset?.quantity?.toString() ?? '',
            buyPrice: editingAsset?.buyPrice?.toString() ?? '',
          }}
          submitting={submitting}
          onSubmit={handleUpdateSubmit}
          onClose={closeModals}
        />
      )}
    </Layout>
  );
};

export default PortfolioPage;
