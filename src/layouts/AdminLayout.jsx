// src/layouts/AdminLayout.jsx
// Main layout for all admin pages.
// Features a left sidebar on desktop and a bottom navigation bar on mobile.

import { NavLink, Outlet, Link } from "react-router-dom";
import {
  UtensilsCrossed,
  ChefHat,
  History,
  UserCircle,
  ArrowRightLeft,
  ShieldCheck,
} from "lucide-react";

// Admin navigation items
const navItems = [
  { to: "/admin/serve",   label: "Food Serve", Icon: UtensilsCrossed },
  { to: "/admin/menu",    label: "Menu Edit",  Icon: ChefHat },
  { to: "/admin/history", label: "History",    Icon: History },
  { to: "/admin/account", label: "Account",    Icon: UserCircle },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* ─── DESKTOP SIDEBAR (visible on md screens and above) ─── */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 min-h-screen p-5 shrink-0 sticky top-0 h-screen">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-md shadow-primary-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 leading-tight">CKCET Mess</h2>
            <span className="text-[11px] font-semibold text-primary-600 uppercase tracking-wider">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="space-y-1.5 flex-1">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all
                ${
                  isActive
                    ? "bg-primary-50 text-primary-700 shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <Icon className="w-4.5 h-4.5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Link to switch to Buyer View */}
        <div className="pt-4 border-t border-gray-100">
          <Link
            to="/menu"
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-primary-600 hover:bg-primary-50/50 rounded-xl transition"
          >
            <ArrowRightLeft className="w-4 h-4 text-gray-400" />
            <span>Switch to buyer view</span>
          </Link>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <main className="flex-1 min-w-0 pb-20 md:pb-8">
        <Outlet />
      </main>

      {/* ─── MOBILE BOTTOM NAVIGATION BAR (visible on screens below md) ─── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 z-40 safe-area-bottom">
        <div className="max-w-md mx-auto flex">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors
                ${
                  isActive
                    ? "text-primary-600"
                    : "text-gray-400 hover:text-gray-600"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
