import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const ProtectedRoute = ({ element }) => {
  const { user, userLoading } = useContext(UserContext);
  const isAuthenticated = !!localStorage.getItem("token") && user;

  if (userLoading) {
    return (
      <div className="p-6 text-gray-700">Loading your account...</div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // Optionally also require user object:
  // if (!user) return <Navigate to="/login" replace />;

  return element;
};

export default ProtectedRoute;
