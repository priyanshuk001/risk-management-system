import React from 'react';

const VaRCards = ({ varMetrics }) => {
  if (!varMetrics) {
    return (
      <div className="text-gray-600 p-4">
        Loading VaR metrics...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* VaR 95% */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h4 className="text-sm font-medium text-gray-500 mb-2">VaR 95%</h4>
        <p className="text-2xl font-bold text-red-600">
          ${varMetrics.var95?.toLocaleString() || 0}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Maximum expected loss (95% confidence)
        </p>
      </div>

      {/* VaR 99% */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h4 className="text-sm font-medium text-gray-500 mb-2">VaR 99%</h4>
        <p className="text-2xl font-bold text-red-700">
          ${varMetrics.var99?.toLocaleString() || 0}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Maximum expected loss (99% confidence)
        </p>
      </div>
    </div>
  );
};

export default VaRCards;
