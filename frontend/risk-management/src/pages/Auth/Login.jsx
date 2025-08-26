import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import AuthLayout from "./AuthLayout";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter the password");
      return;
    }
    setError("");
    // Login API call here
  }

  return (
    <AuthLayout>
      <h2 className="text-xl font-bold mb-6 text-center text-slate-800">Login</h2>
      <form className="space-y-4" onSubmit={handleLogin}>
        <div>
          <label className="block text-sm font-medium text-slate-600">Email</label>
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              placeholder="••••••••"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-2 text-slate-500 hover:text-slate-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-sky-700 text-white py-2 rounded-lg hover:bg-sky-800 transition"
        >
          Login
        </button>
        <p className="text-sm text-slate-500 text-center mt-4">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-sky-700 hover:underline">Sign up</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
