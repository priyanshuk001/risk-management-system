import React, { createContext, useEffect, useState, useCallback } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // ✅ Added authentication state

  const updateUser = (userData) => {
    setUser(userData);
    setIsAuthenticated(!!userData); // ✅ Update auth state when user changes
  };

  const clearUser = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token"); // ✅ Clear token when clearing user
  };

  // ✅ Enhanced login function
  const login = async (email, password) => {
    try {
      setUserLoading(true);
      setUserError(null);

      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password,
      });

      const { token, user: userData } = response.data;
      
      // Store token and update user state
      localStorage.setItem("token", token);
      updateUser(userData);
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || "Login failed";
      setUserError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setUserLoading(false);
    }
  };

  // ✅ Enhanced register function
  const register = async (userData) => {
    try {
      setUserLoading(true);
      setUserError(null);

      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, userData);
      
      const { token, user: newUser } = response.data;
      
      // Store token and update user state
      localStorage.setItem("token", token);
      updateUser(newUser);
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || "Registration failed";
      setUserError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setUserLoading(false);
    }
  };

  // ✅ Enhanced logout function
  const logout = () => {
    clearUser();
    // Optionally redirect to login page
    window.location.href = "/login";
  };

  // fetch /auth/getUser if token exists
  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      return;
    }

    try {
      setUserLoading(true);
      setUserError(null);

      const { data } = await axiosInstance.get(API_PATHS.AUTH.GET_USER_INFO);
      
      // ✅ Handle different response structures
      const userData = data.user || data; // Flexible response handling
      setUser(userData);
      setIsAuthenticated(true);

    } catch (error) {
      console.error("Failed to fetch user:", error);
      
      // ✅ Handle specific error cases
      if (error.response?.status === 401) {
        // Token is invalid/expired
        localStorage.removeItem("token");
        setUser(null);
        setIsAuthenticated(false);
      }
      
      const errorMessage = error?.response?.data?.message || error.message || "Failed to fetch user data";
      setUserError(errorMessage);
    } finally {
      setUserLoading(false);
    }
  }, []);

  // ✅ Function to check if user is authenticated
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem("token");
    return !!(token && user);
  }, [user]);

  // on mount, load user
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // ✅ Clear error after some time
  useEffect(() => {
    if (userError) {
      const timer = setTimeout(() => {
        setUserError(null);
      }, 5000); // Clear error after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [userError]);

  return (
    <UserContext.Provider
      value={{
        // State
        user,
        userLoading,
        userError,
        isAuthenticated,
        
        // Actions
        updateUser,
        clearUser,
        fetchUser,
        login,        // ✅ Direct login function
        register,     // ✅ Direct register function
        logout,       // ✅ Logout function
        checkAuth,    // ✅ Auth check function
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;