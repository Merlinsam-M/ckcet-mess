// src/layouts/BuyerLayout.jsx
// Wraps all buyer pages with a bottom navigation bar.
// Tabs: Menu, My Tokens, Account — highlights the active tab.

import { NavLink, Outlet } from "react-router-dom";
import { UtensilsCrossed, Ticket, UserCircle } from "lucide-react";

const tabs = [
  { to: "/menu",      label: "Menu",      Icon: UtensilsCrossed },
  { to: "/my-tokens", label: "My Tokens", Icon: Ticket },
  { to: "/account",   label: "Account",   Icon: UserCircle },
];

export default function BuyerLayout() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Page content — grows to fill space above the nav bar */}
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      {/* ── Bottom Navigation Bar ─────────────────────── */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 z-40 safe-area-bottom">
        <div className="max-w-lg mx-auto flex">
          {tabs.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors
                ${isActive
                  ? "text-primary-600"
                  : "text-gray-400 hover:text-gray-600"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
