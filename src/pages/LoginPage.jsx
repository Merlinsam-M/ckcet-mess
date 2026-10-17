// src/pages/LoginPage.jsx
// Existing-user login page — email + password → Firebase checks credentials.

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logIn, resetPassword } from "../services/auth";
import { checkIsAdmin } from "../services/admin";
import toast from "react-hot-toast";
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect admin to /admin/serve and others to /menu
  useEffect(() => {
    if (!loading && user) {
      checkIsAdmin(user.uid).then((isAdmin) => {
        navigate(isAdmin ? "/admin/serve" : "/menu", { replace: true });
      });
    }
  }, [user, loading, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const cred = await logIn(email.trim(), password);
      const isAdmin = await checkIsAdmin(cred.user.uid);
      toast.success("Welcome back!");
      navigate(isAdmin ? "/admin/serve" : "/menu", { replace: true });
    } catch (err) {
      const msg =
        err.code === "auth/user-not-found" || err.code === "auth/invalid-credential"
          ? "Invalid email or password."
          : err.code === "auth/invalid-email"
          ? "Please enter a valid email."
          : err.code === "auth/too-many-requests"
          ? "Too many attempts. Try again later."
          : err.message;
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function handleForgot() {
    if (!email.trim()) {
      toast.error("Enter your email first, then click Forgot Password.");
      return;
    }
    try {
      await resetPassword(email.trim());
      toast.success("Password reset email sent! Check your inbox.");
    } catch {
      toast.error("Could not send reset email. Check the address.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* ── Header ─────────────────────── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-200">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-1 text-sm">Log in to your CKCET Mess account</p>
        </div>

        {/* ── Form Card ──────────────────── */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl shadow-primary-100/50 border border-primary-100 p-6 space-y-5"
        >
          {/* Email */}
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="login-pw" className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input
                id="login-pw"
                type={showPw ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>

            <button
              type="button"
              onClick={handleForgot}
              className="text-xs text-primary-600 hover:underline mt-1.5 float-right"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary-200 mt-2"
          >
            {busy ? (
              <>
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Logging in…
              </>
            ) : (
              <>
                Log In <ArrowRight className="w-4.5 h-4.5" />
              </>
            )}
          </button>
        </form>

        {/* ── Footer link ────────────────── */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-primary-600 font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
