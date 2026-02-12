"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function AuthForm({ mode = "login" }) {
  const { signIn, signUp, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [showReset, setShowReset] = useState(false);

  const isSignUp = mode === "signup";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isSignUp) {
        const { error: err } = await signUp(email, password, name || undefined);
        if (err) throw err;
        // Firebase auto-signs in after signup — redirect to app
        window.location.href = "/";
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

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Enter your email address above, then click reset");
      return;
    }

    setLoading(true);
    try {
      const { error: err } = await resetPassword(email);
      if (err) throw err;
      setSuccess("Password reset email sent! Check your inbox.");
      setShowReset(false);
    } catch (err) {
      setError(err.message || "Failed to send reset email");
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
            {showReset
              ? "Reset your password"
              : isSignUp
                ? "Create your account"
                : "Sign in to your account"}
          </p>
        </div>

        {/* Password Reset Form */}
        {showReset ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
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
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <p className="text-center text-snap-text-muted text-xs mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowReset(false);
                  setError("");
                  setSuccess("");
                }}
                className="text-snap-accent hover:underline font-medium bg-transparent border-none cursor-pointer"
              >
                Back to Sign In
              </button>
            </p>
          </form>
        ) : (
          <>
            {/* Login / Signup Form */}
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

              {/* Forgot password link (login only) */}
              {!isSignUp && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReset(true);
                      setError("");
                      setSuccess("");
                    }}
                    className="text-snap-accent text-xs hover:underline font-medium bg-transparent border-none cursor-pointer p-0"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

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

            {/* Toggle login/signup */}
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
          </>
        )}
      </div>
    </div>
  );
}
