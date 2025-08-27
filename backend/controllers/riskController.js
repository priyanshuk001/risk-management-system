// controllers/riskController.js
const { evaluatePortfolioRisk } = require("../services/riskEngine"); // Your uploaded file
const { getStockPrice, getCryptoPrice, getBondYield, getCommodityPrice } = require("../services/marketDataService");
const { get_all } = require("../controllers/portfolioController"); // Import your existing portfolio controller

// Get user's portfolio and convert to risk engine format
async function getUserPortfolioForRisk(userId) {
  try {
    // Create a mock request object to use your existing portfolio controller
    const mockReq = {
      user: { id: userId }
    };
    
    let portfolioAssets = [];
    
    // Create a mock response object to capture the data
    const mockRes = {
      json: (data) => {
        portfolioAssets = data.assets || data || [];
      },
      status: () => mockRes
    };
    
    // Call your existing portfolio controller
    await get_all(mockReq, mockRes);
    
    if (!portfolioAssets || portfolioAssets.length === 0) {
      return [];
    }

    // Convert to risk engine format and get current values
    const riskPortfolio = [];
    
    for (const asset of portfolioAssets) {
      try {
        let currentPrice = 0;
        
        // Get current price based on asset type
        switch (asset.type?.toLowerCase()) {
          case 'equity':
          case 'stock':
            const equityData = await getStockPrice(asset.symbol);
            currentPrice = equityData?.price || asset.purchasePrice || 0;
            break;
            
          case 'crypto':
          case 'cryptocurrency':
            const cryptoData = await getCryptoPrice(asset.symbol);
            currentPrice = parseFloat(cryptoData?.price) || asset.purchasePrice || 0;
            break;
            
          case 'bond':
            const bondData = await getBondYield(asset.symbol);
            currentPrice = parseFloat(bondData?.value) || asset.purchasePrice || 0;
            break;
            
          case 'commodity':
            const commodityData = await getCommodityPrice(asset.symbol);
            currentPrice = parseFloat(commodityData?.price) || asset.purchasePrice || 0;
            break;
            
          default:
            currentPrice = asset.purchasePrice || 0;
        }

        const currentValue = currentPrice * (asset.quantity || 0);
        
        riskPortfolio.push({
          asset_type: asset.type?.toLowerCase() || 'equity',
          symbol_or_name: asset.symbol,
          quantity: asset.quantity || 0,
          current_value: currentValue,
          purchase_price: asset.purchasePrice || 0,
          purchase_value: (asset.purchasePrice || 0) * (asset.quantity || 0)
        });
        
      } catch (priceError) {
        console.warn(`Failed to get current price for ${asset.symbol}:`, priceError);
        // Use purchase price as fallback
        const fallbackValue = (asset.purchasePrice || 0) * (asset.quantity || 0);
        riskPortfolio.push({
          asset_type: asset.type?.toLowerCase() || 'equity',
          symbol_or_name: asset.symbol,
          quantity: asset.quantity || 0,
          current_value: fallbackValue,
          purchase_price: asset.purchasePrice || 0,
          purchase_value: fallbackValue
        });
      }
    }
    
    return riskPortfolio;
  } catch (error) {
    console.error('Error preparing portfolio for risk analysis:', error);
    throw error;
  }
}

// Main risk analysis endpoint
const calculatePortfolioRisk = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's portfolio in risk engine format
    const portfolio = await getUserPortfolioForRisk(userId);
    
    if (portfolio.length === 0) {
      return res.json({
        success: true,
        message: "No portfolio data available",
        varMetrics: { var_95: 0, var_99: 0 },
        stressResults: [],
        alerts: [],
        portfolioValue: 0
      });
    }

    // Run risk analysis using your risk engine
    const riskAnalysis = await evaluatePortfolioRisk(portfolio);
    
    // Calculate total portfolio value
    const portfolioValue = portfolio.reduce((sum, asset) => sum + asset.current_value, 0);
    
    const response = {
      success: true,
      portfolioValue,
      totalAssets: portfolio.length,
      varMetrics: {
        var95: Math.round(riskAnalysis.varMetrics.var_95 || 0),
        var99: Math.round(riskAnalysis.varMetrics.var_99 || 0),
        portfolioVolatility: calculatePortfolioVolatility(riskAnalysis.varMetrics.portfolioReturns || [])
      },
      stressTest: riskAnalysis.stressResults.map(result => ({
        scenario: `${(result.shock * 100).toFixed(0)}% Market Decline`,
        shock: result.shock,
        estimatedLoss: Math.round(result.loss * portfolioValue),
        lossPercentage: (result.shock * 100).toFixed(1)
      })),
      alerts: riskAnalysis.alerts,
      riskLevel: calculateRiskLevel(riskAnalysis.varMetrics, portfolioValue),
      lastCalculated: new Date().toISOString()
    };

    res.json(response);

  } catch (error) {
    console.error('Risk calculation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to calculate portfolio risk",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Stress test only endpoint
const getStressTestResults = async (req, res) => {
  try {
    const userId = req.user.id;
    const portfolio = await getUserPortfolioForRisk(userId);
    
    if (portfolio.length === 0) {
      return res.json({
        success: true,
        stressTests: [],
        message: "No portfolio data for stress testing"
      });
    }

    const riskAnalysis = await evaluatePortfolioRisk(portfolio);
    const portfolioValue = portfolio.reduce((sum, asset) => sum + asset.current_value, 0);
    
    const stressTests = riskAnalysis.stressResults.map(result => ({
      scenario: `${(result.shock * 100).toFixed(0)}% Market Decline`,
      shock: result.shock,
      estimatedLoss: Math.round(result.loss * portfolioValue),
      lossPercentage: ((result.loss * portfolioValue / portfolioValue) * 100).toFixed(1),
      severity: result.shock <= -0.3 ? 'Severe' : result.shock <= -0.2 ? 'Moderate' : 'Mild'
    }));

    res.json({
      success: true,
      portfolioValue,
      stressTests,
      lastCalculated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Stress test error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to run stress tests"
    });
  }
};

// Risk alerts endpoint
const getRiskAlerts = async (req, res) => {
  try {
    const userId = req.user.id;
    const portfolio = await getUserPortfolioForRisk(userId);
    
    if (portfolio.length === 0) {
      return res.json({
        success: true,
        alerts: [],
        riskLevel: 'Low'
      });
    }

    const riskAnalysis = await evaluatePortfolioRisk(portfolio);
    const portfolioValue = portfolio.reduce((sum, asset) => sum + asset.current_value, 0);
    
    res.json({
      success: true,
      alerts: riskAnalysis.alerts,
      riskLevel: calculateRiskLevel(riskAnalysis.varMetrics, portfolioValue),
      alertCount: riskAnalysis.alerts.length,
      lastChecked: new Date().toISOString()
    });

  } catch (error) {
    console.error('Risk alerts error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to get risk alerts"
    });
  }
};

// Helper functions
function calculatePortfolioVolatility(returns) {
  if (!returns || returns.length === 0) return 0;
  
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance) * Math.sqrt(252); // Annualized
  
  return (volatility * 100).toFixed(2); // As percentage
}

function calculateRiskLevel(varMetrics, portfolioValue) {
  const var95Percent = ((varMetrics.var_95 || 0) / portfolioValue) * 100;
  
  if (var95Percent > 10) return 'High';
  if (var95Percent > 5) return 'Medium';
  return 'Low';
}

module.exports = {
  calculatePortfolioRisk,
  getStressTestResults,
  getRiskAlerts
};