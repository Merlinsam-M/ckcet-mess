// src/pages/DashboardPage.jsx
// Simple placeholder dashboard shown after login.
// Displays the user's email and a logout button.
// Will be replaced with the full Buyer portal in later stages.

import { useNavigate } from "react-router-dom";
import { logOut } from "../services/auth";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { LogOut, UtensilsCrossed, User } from "lucide-react";
import TokenCard from "../components/TokenCard";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logOut();
      toast.success("Logged out.");
      navigate("/login");
    } catch {
      toast.error("Logout failed. Try again.");
    }
  }

  // Sample token data to preview the TokenCard component
  const sampleToken = {
    tokenId: "A1024",
    email: user?.email || "student@ckcet.ac.in",
    items: [
      { name: "Meals", qty: 1, price: 40 },
      { name: "Omelet", qty: 1, price: 20 },
    ],
    amount: 60,
    createdAt: { toDate: () => new Date(2026, 8, 30, 10, 42, 0) }, // mock Firestore Timestamp
    status: "active",
  };

  const sampleServedToken = {
    tokenId: "A1023",
    email: user?.email || "student@ckcet.ac.in",
    items: [{ name: "Briyani", qty: 1, price: 80 }],
    amount: 80,
    createdAt: { toDate: () => new Date(2026, 8, 30, 9, 15, 0) },
    status: "served",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* ── Top Bar ─────────────────────── */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-primary-100 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-primary-600" />
            <span className="font-bold text-gray-900">CKCET Mess</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* ── Content ─────────────────────── */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* User info card */}
        <div className="bg-white rounded-2xl border border-primary-100 shadow-lg shadow-primary-100/30 p-5 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Logged in as</p>
              <p className="font-semibold text-gray-900 text-sm truncate max-w-[250px]">
                {user?.email}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-3">
            🎉 Auth is working! Menu, ordering &amp; tokens coming in later stages.
          </p>
        </div>

        {/* ── Token Card Preview ─────────── */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Token Preview</h2>
          <p className="text-sm text-gray-500 mb-6">
            These are sample tokens to preview the TokenCard component. Real tokens will be generated server-side after payment.
          </p>

          {/* Active token */}
          <div className="mb-6">
            <TokenCard {...sampleToken} />
          </div>

          {/* Served token */}
          <div>
            <TokenCard {...sampleServedToken} />
          </div>
        </div>
      </main>
    </div>
  );
}
