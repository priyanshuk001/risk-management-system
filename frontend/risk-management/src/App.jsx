import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import UserProvider, { UserContext } from "./context/UserContext";

// Auth Pages
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";

// Dashboard Pages
import Home from "./pages/Dashboard/Home";
import Portfolio from "./pages/Dashboard/Portfolio";
import Alerts from "./pages/Dashboard/Alerts";
import HistoricalPrices from "./pages/Dashboard/HistoricalPrices";

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<Root />} />

          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Dashboard routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolio"
            element={
              <ProtectedRoute>
                <Portfolio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute>
                <Alerts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/historical-prices"
            element={
              <ProtectedRoute>
                <HistoricalPrices />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </UserProvider>
  );
};

// Protect routes
const ProtectedRoute = ({ children }) => {
  const { user, userLoading } = useContext(UserContext);
  const token = localStorage.getItem("token");

  if (userLoading) return <div>Loading...</div>;

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const Root = () => {
  // Check if token exists in localStorage
  const isAuthenticated = !!localStorage.getItem("token");

  // Redirect to dashboard if authenticated, otherwise to login
  return isAuthenticated ? (
    <Navigate to="/home" />
  ) : (
    <Navigate to="/login" />
  );
};

export default App;
