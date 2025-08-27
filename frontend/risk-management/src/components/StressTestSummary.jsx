import React from 'react';

const StressTestSummary = ({ stressTestResults }) => {
  if (!stressTestResults || stressTestResults.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Stress Test Results</h3>
        <p className="text-gray-500">No stress test data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Stress Test Results</h3>
      <div className="space-y-3">
        {stressTestResults.map((test, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-3 bg-gray-50 rounded"
          >
            <span className="font-medium text-gray-700">{test.scenario}</span>
            <span
              className={`font-bold ${
                test.impact < -15
                  ? 'text-red-600'
                  : test.impact < -10
                  ? 'text-orange-600'
                  : 'text-yellow-600'
              }`}
            >
              {test.impact}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StressTestSummary;
