// src/components/portfolio/AssetsTable.jsx
import React, { useMemo } from 'react';
import { Edit, Trash2 } from 'lucide-react';

const AssetsTable = React.memo(function AssetsTable({
  assets,
  assetTypes,
  onEdit,
  onDelete,
}) {
  const rows = useMemo(
    () =>
      assets.map((asset) => {
        const currentPrice = asset.currentPrice ?? asset.buyPrice ?? 0;
        const totalValue = currentPrice * (asset.quantity ?? 0);
        return { ...asset, currentPrice, totalValue };
      }),
    [assets]
  );

  const getTypeConfig = (type) =>
    assetTypes.find((t) => t.value === String(type).toLowerCase()) || assetTypes;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Asset
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantity
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Buy Price
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Value
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map((asset) => {
            const typeConfig = getTypeConfig(asset.type);
            const TagIcon = typeConfig.icon;
            return (
              <tr key={asset._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900 font-mono">
                      {asset.symbol}
                    </div>
                    <div className="text-sm text-gray-500">{asset.name || asset.symbol}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${typeConfig.color}-100 text-${typeConfig.color}-800`}
                  >
                    <TagIcon size={12} className="mr-1" />
                    {asset.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {asset.quantity?.toLocaleString() || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  ${(asset.buyPrice || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                  ${asset.totalValue.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => onEdit(asset)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded transition-colors"
                      title="Edit asset"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(asset)}
                      className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                      title="Delete asset"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

export default AssetsTable;
