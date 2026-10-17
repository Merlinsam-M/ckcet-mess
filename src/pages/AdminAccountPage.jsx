// src/pages/AdminAccountPage.jsx
// Admin account page: shows admin email, logout button, and link to switch to buyer view.

import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logOut } from "../services/auth";
import toast from "react-hot-toast";
import { User, LogOut, Mail, ShieldCheck, ArrowRightLeft } from "lucide-react";

export default function AdminAccountPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logOut();
      toast.success("Logged out successfully.");
      navigate("/login");
    } catch {
      toast.error("Logout failed. Try again.");
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* ── Header ─────────────────────── */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
          <User className="w-4.5 h-4.5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Admin Account</h1>
          <p className="text-xs text-gray-400">Admin settings & profile</p>
        </div>
      </div>

      {/* ── Admin Info Card ────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400 font-medium">Logged in as</p>
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Details list */}
        <div className="space-y-3 pt-2 border-t border-gray-50">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-gray-300" />
            <span className="text-gray-500">Email</span>
            <span className="flex-1 text-right text-gray-900 font-medium truncate ml-2">
              {user?.email}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <ShieldCheck className="w-4 h-4 text-primary-500" />
            <span className="text-gray-500">Role</span>
            <span className="flex-1 text-right text-primary-700 font-bold">
              Administrator
            </span>
          </div>
        </div>
      </div>

      {/* ── Switch to Buyer View Link ──── */}
      <div className="mt-4">
        <Link
          to="/menu"
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition text-xs shadow-sm"
        >
          <ArrowRightLeft className="w-4 h-4 text-primary-600" />
          <span>Switch to buyer view</span>
        </Link>
      </div>

      {/* ── Logout Button ──────────────── */}
      <button
        onClick={handleLogout}
        className="mt-3 w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 rounded-xl transition text-xs shadow-sm"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out</span>
      </button>
    </div>
  );
}
