import React, { useState, useEffect } from 'react';

const AuthLayout = ({ children }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePosition({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100
      });
    };

    const handleMouseLeave = () => {
      setMousePosition({ x: -1, y: -1 }); // Set to negative values when mouse leaves
    };

    const rightColumn = document.querySelector('.right-column');
    if (rightColumn) {
      rightColumn.addEventListener('mousemove', handleMouseMove);
      rightColumn.addEventListener('mouseleave', handleMouseLeave);
      return () => {
        rightColumn.removeEventListener('mousemove', handleMouseMove);
        rightColumn.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);

  //numbers for portfolio value

  const [portfolioValue, setPortfolioValue] = useState(() => {
    const baseValue = 1000000;
    const randomRange = 100000; // ±$100,000 range around base
    return baseValue + (Math.random() - 0.5) * 2 * randomRange;
  });

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen font-sans bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-200/30 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Left Column: Title + Form */}
      <div className="flex flex-col items-center justify-center w-full lg:w-1/2 p-6 sm:p-8 relative z-10">

        {/* Animated logo/icon */}
        <div className="mb-6 relative group">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6m3-3l3 3-3 3" />
            </svg>
          </div>
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>

        {/* Heading with gradient text */}
        <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4 text-center leading-tight">
          Risk Management
          <span className="block text-3xl lg:text-4xl font-light mt-2">Portfolio</span>
        </h1>

        {/* Sub-heading with animation */}
        <p className="text-slate-600 text-center text-lg mb-8 max-w-md leading-relaxed animate-pulse">
          Track, manage, and optimize your investments with
          <span className="font-semibold text-blue-600"> intelligent insights</span>
        </p>

        {/* Enhanced Form Card */}
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 relative overflow-hidden">
          {/* Card glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-3xl"></div>
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </div>

      {/* Right Column: Enhanced Visual Content */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 relative p-12 overflow-hidden right-column">

        {/* Dynamic gradient background */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 transition-all duration-500"
          style={{
            background: mousePosition.x >= 0 && mousePosition.x <= 100 && mousePosition.y >= 0 && mousePosition.y <= 100 ?
              `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.2) 0%, rgba(30, 41, 59, 1) 25%)` :
              `linear-gradient(135deg, rgba(30, 41, 59, 1) 0%, rgba(30, 58, 138, 1) 100%)`
          }}
        ></div>

        {/* Animated background shapes */}
        <div className="absolute w-96 h-96 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full -top-20 -left-30 blur-3xl animate-pulse"></div>
        <div className="absolute w-80 h-80 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full -bottom-32 -right-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-64 h-64 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full top-1/2 left-1/4 blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>

        {/* Floating geometric shapes */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 border border-white/20 rotate-45 animate-spin"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDuration: `${10 + Math.random() * 10}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}

        {/* Enhanced Portfolio Card */}
        <div
          className="bg-white/10 backdrop-blur-2xl p-8 rounded-2xl shadow-2xl border border-white/20 mb-8 w-96 relative group cursor-pointer transform transition-all duration-500 hover:scale-105"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="bg-gradient-to-br from-emerald-400 to-blue-500 p-4 rounded-2xl shadow-lg">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-emerald-300 text-sm font-medium">+12.5%</div>
                <div className="text-white/60 text-xs">This month</div>
              </div>
            </div>

            <div className="mb-4">
              <p className="font-semibold text-white/80 text-lg mb-2">Total Portfolio Value</p>
              <p className="text-5xl font-black text-white tracking-tight">
                ${Math.floor(portfolioValue).toLocaleString()}
              </p>
            </div>

            {/* Mini chart */}
            <div className="flex items-end gap-1 h-16 mt-6">
              {[30, 45, 35, 60, 80, 65, 75, 90, 70, 85, 95, 88].map((height, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-t from-emerald-500 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-emerald-400 hover:to-blue-300 flex-1"
                  style={{
                    height: `${height}%`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Risk Distribution Card */}
        <div className="bg-white/10 backdrop-blur-2xl p-8 rounded-2xl shadow-2xl border border-white/20 w-96 relative group cursor-pointer transform transition-all duration-500 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-orange-400 to-red-500 p-3 rounded-xl">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="font-bold text-white text-xl">Risk Analysis</p>
              </div>
              <div className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors cursor-pointer">
                <span className="text-xs text-white font-medium">Live</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-300">42%</div>
                <div className="text-xs text-white/60">Low Risk</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-300">35%</div>
                <div className="text-xs text-white/60">Medium Risk</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-300">23%</div>
                <div className="text-xs text-white/60">High Risk</div>
              </div>
            </div>

            {/* Enhanced chart */}
            <div className="flex items-end justify-center gap-2 h-24">
              {[25, 45, 70, 85, 60, 35, 50, 75, 40, 20].map((height, i) => (
                <div
                  key={i}
                  className="relative group cursor-pointer"
                  style={{ flex: 1 }}
                >
                  <div
                    className="bg-gradient-to-t from-blue-500 via-indigo-400 to-purple-400 rounded-t-lg transition-all duration-300 hover:from-blue-400 hover:via-indigo-300 hover:to-purple-300 w-full"
                    style={{
                      height: `${height}%`,
                      animationDelay: `${i * 0.2}s`
                    }}
                  />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {height}% risk
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating action button */}
        <div className="absolute bottom-8 right-8">
          <button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-4 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110 hover:rotate-12">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;