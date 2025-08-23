import React from "react";
import AuthLayout from "./AuthLayout";

const Signup = () => {

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!fullName) {
      setError("Please enter your name");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setError("");
  }

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Sign Up</h2>
      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600">Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-sky-700 text-white py-2 rounded-lg hover:bg-sky-800 transition"
        >
          Create Account
        </button>
        <p className="text-sm text-slate-500 text-center mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-sky-700 hover:underline">Login</a>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Signup;
