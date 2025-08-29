// src/components/portfolio/AssetModal.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Save } from 'lucide-react';

const AssetModal = React.memo(function AssetModal({
  isEdit = false,
  initial = { type: 'equity', name: '', symbol: '', quantity: '', buyPrice: '' },
  submitting = false,
  onSubmit,
  onClose,
}) {
  const [local, setLocal] = useState(initial);

  useEffect(() => {
    setLocal(initial || { type: 'equity', name: '', symbol: '', quantity: '', buyPrice: '' });
  }, [initial]);

  const change = useCallback((field) => (e) => {
    const v = e.target.value;
    setLocal((s) => ({ ...s, [field]: field === 'symbol' ? v.toUpperCase() : v }));
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      onSubmit(local);
    },
    [local, onSubmit]
  );

  return createPortal(
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit Asset' : 'Add New Asset'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asset Type</label>
              <select
                value={local.type}
                onChange={change('type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="equity">Equity</option>
                <option value="crypto">Crypto</option>
                <option value="bond">Bond</option>
                <option value="commodity">Commodity</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={local.name}
              onChange={change('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Tesla Inc"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
            <input
              type="text"
              value={local.symbol}
              onChange={change('symbol')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., TSLA"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              step="0.00000001"
              value={local.quantity}
              onChange={change('quantity')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buy Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={local.buyPrice}
              onChange={change('buyPrice')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save size={16} className="mr-1" />
                  {isEdit ? 'Update' : 'Add'} Asset
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
});

export default AssetModal;
