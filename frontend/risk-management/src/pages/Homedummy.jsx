import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis } from 'recharts';

// Dummy Data
const dummyData = {
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

// Asset Allocation Pie Chart Component
const AssetAllocationChart = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Asset Allocation</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dummyData.assetAllocation}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {dummyData.assetAllocation.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        {dummyData.assetAllocation.map((asset, index) => (
          <div key={index} className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: asset.color }}></div>
            <span className="text-sm text-gray-600">{asset.name}: {asset.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// VaR Cards Component
const VaRCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h4 className="text-sm font-medium text-gray-500 mb-2">VaR 95%</h4>
        <p className="text-2xl font-bold text-red-600">
          ${dummyData.varMetrics.var95.toLocaleString()}
        </p>
        <p className="text-sm text-gray-600 mt-1">Maximum expected loss (95% confidence)</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h4 className="text-sm font-medium text-gray-500 mb-2">VaR 99%</h4>
        <p className="text-2xl font-bold text-red-700">
          ${dummyData.varMetrics.var99.toLocaleString()}
        </p>
        <p className="text-sm text-gray-600 mt-1">Maximum expected loss (99% confidence)</p>
      </div>
    </div>
  );
};

// Stress Test Summary Component
const StressTestSummary = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Stress Test Results</h3>
      <div className="space-y-3">
        {dummyData.stressTestResults.map((test, index) => (
          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="font-medium text-gray-700">{test.scenario}</span>
            <span className={`font-bold ${test.impact < -15 ? 'text-red-600' : test.impact < -10 ? 'text-orange-600' : 'text-yellow-600'}`}>
              {test.impact}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Alerts List Component
const AlertsList = () => {
  const getAlertColor = (type) => {
    switch (type) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Alerts</h3>
      <div className="space-y-3">
        {dummyData.recentAlerts.map((alert) => (
          <div key={alert.id} className={`p-3 rounded border ${getAlertColor(alert.type)}`}>
            <div className="flex justify-between items-start">
              <p className="font-medium">{alert.message}</p>
              <span className="text-xs font-semibold px-2 py-1 rounded">
                {alert.type}
              </span>
            </div>
            <p className="text-xs mt-2 opacity-75">{alert.timestamp}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Sparkline Chart Component
const SparklineChart = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Portfolio Returns Trend</h3>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dummyData.portfolioReturns}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={false}
            />
            <XAxis dataKey="day" hide />
            <YAxis hide />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-gray-600 mt-2">Last 10 days performance (%)</p>
    </div>
  );
};

// Dashboard Page Component
const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Risk Management Dashboard</h1>
        <p className="text-gray-600">Monitor your portfolio risk metrics and performance</p>
      </div>
      
      {/* Portfolio Value */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 rounded-lg shadow-lg text-white">
        <h2 className="text-lg font-medium mb-2">Total Portfolio Value</h2>
        <p className="text-4xl font-bold">${dummyData.portfolioValue.toLocaleString()}</p>
        <p className="text-blue-100 mt-2">+2.34% from last month</p>
      </div>

      {/* Charts and Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AssetAllocationChart />
        <div className="space-y-4">
          <VaRCards />
          <SparklineChart />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StressTestSummary />
        <AlertsList />
      </div>
    </div>
  );
};

// Other Page Components
const Portfolio = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-800 mb-4">Portfolio Management</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Equity Holdings</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>AAPL</span>
            <span className="font-medium">$45,000</span>
          </div>
          <div className="flex justify-between">
            <span>GOOGL</span>
            <span className="font-medium">$38,500</span>
          </div>
          <div className="flex justify-between">
            <span>MSFT</span>
            <span className="font-medium">$52,200</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Crypto Holdings</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Bitcoin</span>
            <span className="font-medium">$180,000</span>
          </div>
          <div className="flex justify-between">
            <span>Ethereum</span>
            <span className="font-medium">$70,000</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Bond Holdings</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>US Treasury 10Y</span>
            <span className="font-medium">$200,000</span>
          </div>
          <div className="flex justify-between">
            <span>Corporate Bonds</span>
            <span className="font-medium">$112,500</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Sidebar Component
const Sidebar = ({ isOpen, toggleSidebar, currentPage, setCurrentPage }) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'portfolio', name: 'Portfolio', icon: Briefcase },
    { id: 'risk-metrics', name: 'Risk Metrics', icon: TrendingUp },
    { id: 'alerts', name: 'Alerts', icon: AlertTriangle },
    { id: 'historical-prices', name: 'Historical Prices', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const handleNavigation = (pageId) => {
    setCurrentPage(pageId);
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-gray-900 text-white transform transition-transform duration-300 ease-in-out z-30 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } w-64`}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Risk Manager</h2>
            <button onClick={toggleSidebar} className="lg:hidden">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User size={20} />
            </div>
            <div>
              <p className="font-medium">John Doe</p>
              <p className="text-sm text-gray-400">Risk Manager</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item.id)}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors w-full text-left ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700">
          <button className="flex items-center space-x-3 p-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg w-full transition-colors">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

// Main Layout Component
const Layout = ({ children, currentPage, setCurrentPage }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'lg:ml-64' : 'ml-0'
      }`}>
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Menu size={24} className="text-gray-600" />
            </button>
            <h1 className="ml-4 text-lg font-semibold text-gray-800">
              Risk Management System
            </h1>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'portfolio':
        return <Portfolio />;
      case 'risk-metrics':
        return <RiskMetrics />;
      case 'alerts':
        return <Alerts />;
      case 'historical-prices':
        return <HistoricalPrices />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

export default App;

const RiskMetrics = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-800 mb-6">Risk Metrics</h1>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* VaR Details */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Value at Risk (VaR)</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-medium">1-Day VaR</h4>
            <p className="text-2xl font-bold text-blue-600">$45,000</p>
            <p className="text-sm text-gray-600">95% confidence level</p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-medium">10-Day VaR</h4>
            <p className="text-2xl font-bold text-orange-600">$125,000</p>
            <p className="text-sm text-gray-600">95% confidence level</p>
          </div>
          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-medium">1-Month VaR</h4>
            <p className="text-2xl font-bold text-red-600">$187,500</p>
            <p className="text-sm text-gray-600">99% confidence level</p>
          </div>
        </div>
      </div>
      
      {/* Risk Ratios */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Risk Ratios</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Sharpe Ratio</span>
            <span className="text-lg font-bold text-green-600">1.42</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Sortino Ratio</span>
            <span className="text-lg font-bold text-green-600">1.86</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Maximum Drawdown</span>
            <span className="text-lg font-bold text-red-600">-12.5%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Beta</span>
            <span className="text-lg font-bold text-blue-600">0.89</span>
          </div>
        </div>
      </div>
      
      {/* Portfolio Volatility */}
      <div className="bg-white p-6 rounded-lg shadow-lg col-span-1 lg:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Portfolio Volatility Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded">
            <h4 className="font-medium text-gray-700">Daily Volatility</h4>
            <p className="text-2xl font-bold text-purple-600">2.1%</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <h4 className="font-medium text-gray-700">Monthly Volatility</h4>
            <p className="text-2xl font-bold text-purple-600">9.8%</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <h4 className="font-medium text-gray-700">Annual Volatility</h4>
            <p className="text-2xl font-bold text-purple-600">33.2%</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Alerts = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-800 mb-6">Risk Alerts Management</h1>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <h3 className="font-semibold text-red-800">High Risk Alerts</h3>
        <p className="text-2xl font-bold text-red-600">3</p>
      </div>
      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
        <h3 className="font-semibold text-orange-800">Medium Risk Alerts</h3>
        <p className="text-2xl font-bold text-orange-600">7</p>
      </div>
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
        <h3 className="font-semibold text-yellow-800">Low Risk Alerts</h3>
        <p className="text-2xl font-bold text-yellow-600">12</p>
      </div>
    </div>
    
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold">All Alerts</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {dummyData.recentAlerts.concat([
            { id: 4, message: 'High correlation detected between tech stocks', type: 'Medium', timestamp: '2024-01-14 16:45' },
            { id: 5, message: 'Portfolio concentration risk in crypto sector', type: 'High', timestamp: '2024-01-14 14:20' },
            { id: 6, message: 'Stop loss triggered for TSLA position', type: 'High', timestamp: '2024-01-14 11:30' }
          ]).map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  alert.type === 'High' ? 'bg-red-500' : 
                  alert.type === 'Medium' ? 'bg-orange-500' : 'bg-yellow-500'
                }`}></div>
                <div>
                  <p className="font-medium text-gray-800">{alert.message}</p>
                  <p className="text-sm text-gray-500">{alert.timestamp}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  alert.type === 'High' ? 'bg-red-100 text-red-800' :
                  alert.type === 'Medium' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {alert.type}
                </span>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const HistoricalPrices = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-800 mb-6">Historical Prices</h1>
    
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Price History Overview</h3>
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={[
            { date: '2024-01-01', portfolio: 1200000, sp500: 100 },
            { date: '2024-01-02', portfolio: 1195000, sp500: 99.5 },
            { date: '2024-01-03', portfolio: 1208000, sp500: 101.2 },
            { date: '2024-01-04', portfolio: 1225000, sp500: 102.1 },
            { date: '2024-01-05', portfolio: 1215000, sp500: 101.8 },
            { date: '2024-01-08', portfolio: 1235000, sp500: 103.2 },
            { date: '2024-01-09', portfolio: 1248000, sp500: 104.1 },
            { date: '2024-01-10', portfolio: 1250000, sp500: 104.5 }
          ]}>
            <XAxis dataKey="date" />
            <YAxis />
            <Line type="monotone" dataKey="portfolio" stroke="#3B82F6" strokeWidth={2} name="Portfolio" />
            <Line type="monotone" dataKey="sp500" stroke="#10B981" strokeWidth={2} name="S&P 500" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Asset Performance (YTD)</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span>Equity Portfolio</span>
            <span className="font-medium text-green-600">+12.5%</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Crypto Portfolio</span>
            <span className="font-medium text-green-600">+45.2%</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Bond Portfolio</span>
            <span className="font-medium text-red-600">-2.1%</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Commodities</span>
            <span className="font-medium text-green-600">+8.7%</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Key Statistics</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span>Best Day</span>
            <span className="font-medium text-green-600">+3.2%</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Worst Day</span>
            <span className="font-medium text-red-600">-2.8%</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Average Daily Return</span>
            <span className="font-medium text-blue-600">+0.15%</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Win Rate</span>
            <span className="font-medium text-green-600">62%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SettingsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Risk Thresholds</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">VaR Alert Threshold (%)</label>
            <input type="number" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Drawdown Limit (%)</label>
            <input type="number" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="15" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Concentration Risk Limit (%)</label>
            <input type="number" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="25" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
        <div className="space-y-4">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" defaultChecked />
            <span>Email alerts for high-risk events</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" defaultChecked />
            <span>Daily risk report</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span>SMS alerts for critical events</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" defaultChecked />
            <span>Weekly portfolio summary</span>
          </label>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold mb-4">User Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="john.doe@company.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Risk Manager</option>
              <option>Portfolio Manager</option>
              <option>Analyst</option>
              <option>Administrator</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input type="text" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="Risk Management" />
          </div>
        </div>
        <div className="mt-6">
          <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
);