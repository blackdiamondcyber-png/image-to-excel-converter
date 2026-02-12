"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function AuthForm({ mode = "login" }) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const isSignUp = mode === "signup";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isSignUp) {
        const { error: err } = await signUp(email, password);
        if (err) throw err;
        setSuccess("Check your email for a confirmation link!");
      } else {
        const { error: err } = await signIn(email, password);
        if (err) throw err;
        window.location.href = "/";
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-snap-bg flex items-center justify-center p-5">
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-snap-accent to-purple-600 flex items-center justify-center text-2xl mx-auto mb-4">
            📊
          </div>
          <h1 className="text-2xl font-bold text-snap-text">Rohan</h1>
          <p className="text-snap-text-muted text-sm mt-1">
            {isSignUp ? "Create your account" : "Sign in to your account"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-snap-text-muted text-xs font-medium mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-snap-surface border border-snap-border rounded-xl px-4 py-3 text-snap-text text-sm outline-none focus:border-snap-border-focus transition-colors placeholder:text-snap-text-dim"
              />
            </div>
          )}

          <div>
            <label className="block text-snap-text-muted text-xs font-medium mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full bg-snap-surface border border-snap-border rounded-xl px-4 py-3 text-snap-text text-sm outline-none focus:border-snap-border-focus transition-colors placeholder:text-snap-text-dim"
            />
          </div>

          <div>
            <label className="block text-snap-text-muted text-xs font-medium mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full bg-snap-surface border border-snap-border rounded-xl px-4 py-3 text-snap-text text-sm outline-none focus:border-snap-border-focus transition-colors placeholder:text-snap-text-dim"
            />
          </div>

          {error && (
            <div className="bg-snap-danger-bg border border-snap-danger rounded-xl px-4 py-3 text-snap-danger text-xs">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-snap-success-bg border border-snap-success rounded-xl px-4 py-3 text-snap-success text-xs">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl border-none bg-gradient-to-br from-snap-accent to-purple-600 text-white text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Please wait..."
              : isSignUp
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center text-snap-text-muted text-xs mt-6">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <a
                href="/login"
                className="text-snap-accent hover:underline font-medium"
              >
                Sign in
              </a>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <a
                href="/signup"
                className="text-snap-accent hover:underline font-medium"
              >
                Sign up
              </a>
            </>
          )}
        </p>

        {/* Skip auth hint */}
        <p className="text-center text-snap-text-dim text-[10px] mt-4">
          <a href="/" className="hover:text-snap-text-muted transition-colors">
            Continue without account →
          </a>
        </p>
      </div>
    </div>
  );
}
