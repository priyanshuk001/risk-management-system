import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import RiskMetrics from './pages/RiskMetrics';
import Alerts from './pages/Alerts';
import HistoricalPrices from './pages/HistoricalPrices';
import SettingsPage from './pages/SettingsPage';

const Home = () => {
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

export default Home;