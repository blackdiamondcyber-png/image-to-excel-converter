"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function AuthForm({ mode = "login" }) {
  const router = useRouter();
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
        router.replace("/");
      } else {
        const { error: err } = await signIn(email, password);
        if (err) throw err;
        router.replace("/");
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
    <div className="min-h-screen bg-snap-bg flex items-center justify-center px-5 py-8">
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-snap-accent to-purple-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-snap-accent/20">
            📊
          </div>
          <h1 className="text-2xl font-bold text-snap-text">Rohan</h1>
          <p className="text-snap-text-muted text-sm mt-1.5">
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
              <label htmlFor="reset-email" className="block text-snap-text-muted text-xs font-medium mb-1.5">
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoComplete="email"
                className="w-full bg-snap-surface border border-snap-border rounded-xl px-4 py-3.5 text-snap-text text-[16px] outline-none focus:border-snap-border-focus focus:ring-1 focus:ring-snap-accent/30 transition-colors placeholder:text-snap-text-dim"
              />
            </div>

            {error && (
              <div className="bg-snap-danger-bg border border-snap-danger rounded-xl px-4 py-3 text-snap-danger text-xs" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-snap-success-bg border border-snap-success rounded-xl px-4 py-3 text-snap-success text-xs" role="status">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl border-none bg-gradient-to-br from-snap-accent to-purple-600 text-white text-sm font-bold cursor-pointer hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
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
                className="text-snap-accent hover:underline font-medium bg-transparent border-none cursor-pointer p-2 min-h-[44px]"
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
                  <label htmlFor="name" className="block text-snap-text-muted text-xs font-medium mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    autoComplete="name"
                    className="w-full bg-snap-surface border border-snap-border rounded-xl px-4 py-3.5 text-snap-text text-[16px] outline-none focus:border-snap-border-focus focus:ring-1 focus:ring-snap-accent/30 transition-colors placeholder:text-snap-text-dim"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-snap-text-muted text-xs font-medium mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  autoComplete="email"
                  className="w-full bg-snap-surface border border-snap-border rounded-xl px-4 py-3.5 text-snap-text text-[16px] outline-none focus:border-snap-border-focus focus:ring-1 focus:ring-snap-accent/30 transition-colors placeholder:text-snap-text-dim"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-snap-text-muted text-xs font-medium mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  className="w-full bg-snap-surface border border-snap-border rounded-xl px-4 py-3.5 text-snap-text text-[16px] outline-none focus:border-snap-border-focus focus:ring-1 focus:ring-snap-accent/30 transition-colors placeholder:text-snap-text-dim"
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
                    className="text-snap-accent text-xs hover:underline font-medium bg-transparent border-none cursor-pointer p-1 min-h-[44px]"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {error && (
                <div className="bg-snap-danger-bg border border-snap-danger rounded-xl px-4 py-3 text-snap-danger text-xs" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-snap-success-bg border border-snap-success rounded-xl px-4 py-3 text-snap-success text-xs" role="status">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl border-none bg-gradient-to-br from-snap-accent to-purple-600 text-white text-sm font-bold cursor-pointer hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
              >
                {loading
                  ? "Please wait..."
                  : isSignUp
                    ? "Create Account"
                    : "Sign In"}
              </button>
            </form>

            {/* Toggle login/signup */}
            <p className="text-center text-snap-text-muted text-sm mt-6">
              {isSignUp ? (
                <>
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-snap-accent hover:underline font-medium"
                  >
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="text-snap-accent hover:underline font-medium"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
