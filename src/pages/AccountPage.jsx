// src/pages/AccountPage.jsx
// Buyer account page: shows user email, role, and logout button.
// Shows "Open admin portal" button ONLY if the user has an admin document.

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logOut } from "../services/auth";
import { checkIsAdmin } from "../services/admin";
import toast from "react-hot-toast";
import { User, LogOut, Mail, Shield, ShieldCheck, ArrowRight } from "lucide-react";

export default function AccountPage() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.uid) {
      checkIsAdmin(user.uid).then(setIsAdmin);
    }
  }, [user?.uid]);

  async function handleLogout() {
    try {
      await logOut();
      toast.success("Logged out.");
      navigate("/login");
    } catch {
      toast.error("Logout failed. Try again.");
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* ── Header ─────────────────────── */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
          <User className="w-4.5 h-4.5 text-primary-600" />
        </div>
        <h1 className="text-lg font-bold text-gray-900">Account</h1>
      </div>

      {/* ── User info card ─────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 animate-fade-in-up">
        {/* Avatar + email */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
            {isAdmin ? (
              <ShieldCheck className="w-6 h-6 text-primary-600" />
            ) : (
              <User className="w-6 h-6 text-primary-600" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400 font-medium">Signed in as</p>
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Detail rows */}
        <div className="space-y-3 pt-2 border-t border-gray-50">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-gray-300" />
            <span className="text-gray-500">Email</span>
            <span className="flex-1 text-right text-gray-900 font-medium truncate ml-2">
              {user?.email}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Shield className="w-4 h-4 text-gray-300" />
            <span className="text-gray-500">Role</span>
            <span className="flex-1 text-right text-gray-900 font-medium">
              {isAdmin ? (
                <span className="text-primary-700 font-bold">Administrator</span>
              ) : (
                "Student"
              )}
            </span>
          </div>
        </div>
      </div>

      {/* ── Open Admin Portal Link (visible ONLY for admins) ── */}
      {isAdmin && (
        <div className="mt-4 animate-fade-in-up">
          <Link
            to="/admin/serve"
            className="w-full flex items-center justify-between px-4 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-xs shadow-md shadow-primary-200 transition"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Open admin portal</span>
            </div>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* ── Logout button ──────────────── */}
      <button
        onClick={handleLogout}
        className="mt-6 w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 rounded-xl transition text-sm"
      >
        <LogOut className="w-4 h-4" />
        Log Out
      </button>
    </div>
  );
}
