export const dummyData = {
  portfolioValue: 1250000,
  assetAllocation: [
    { name: 'Equity', value: 45, color: '#3B82F6' },
    { name: 'Crypto', value: 20, color: '#F59E0B' },
    { name: 'Bonds', value: 25, color: '#10B981' },
    { name: 'Commodities', value: 10, color: '#EF4444' }
  ],
  varMetrics: {
    var95: 125000,
    var99: 187500
  },
  stressTestResults: [
    { scenario: 'Market Crash', impact: -18.5 },
    { scenario: 'Interest Rate Spike', impact: -12.3 },
    { scenario: 'Currency Devaluation', impact: -8.7 }
  ],
  recentAlerts: [
    { id: 1, message: 'VaR threshold exceeded for crypto portfolio', type: 'High', timestamp: '2024-01-15 14:30' },
    { id: 2, message: 'Correlation spike detected between assets', type: 'Medium', timestamp: '2024-01-15 11:20' },
    { id: 3, message: 'Liquidity risk in bond positions', type: 'Low', timestamp: '2024-01-15 09:15' }
  ],
  portfolioReturns: [
    { day: 1, value: 0.2 },
    { day: 2, value: -0.5 },
    { day: 3, value: 1.2 },
    { day: 4, value: 0.8 },
    { day: 5, value: -0.3 },
    { day: 6, value: 1.5 },
    { day: 7, value: 0.7 },
    { day: 8, value: -0.9 },
    { day: 9, value: 2.1 },
    { day: 10, value: 1.3 }
  ]
};