// src/components/TokenCard.jsx
// ─────────────────────────────────────────────────────────────────────
// Display-only token card matching the CKCET Mess reference image.
//
// PROPS:
//   tokenId   — string, e.g. "A1024"
//   email     — string, e.g. "student@ckcet.ac.in"
//   items     — array of { name, qty, price }
//   amount    — number, total price
//   createdAt — Firestore Timestamp (has .toDate()) or Date
//   status    — "active" | "served"
//
// FEATURES:
//   • Moving gradient on header + status pill (active only)
//   • Live clock (Asia/Kolkata) in the footer
//   • Served tokens are grey/dimmed, no animation
//   • Respects prefers-reduced-motion
//   • Handles long emails (truncate) and 1-5 items
// ─────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import {
  Ticket,
  Utensils,
  Mail,
  CalendarDays,
  Clock,
  Wallet,
  ChefHat,
} from "lucide-react";

// ── tiny logo placeholder (SVG book icon) ─────────────────────────
// We inline a small SVG so the card works even without an image file.
function CollegeLogo() {
  return (
    <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
      <svg viewBox="0 0 40 40" className="w-8 h-8">
        <circle cx="20" cy="20" r="18" fill="rgba(255,255,255,0.25)" />
        <path
          d="M12 28V14l8-4 8 4v14l-8-4-8 4zm8-4l8 4M20 24l-8 4M20 10v14"
          stroke="white"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// ── Date / Time formatting helpers ────────────────────────────────
function formatDate(date) {
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function formatTime(date) {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

// ── Live clock hook ───────────────────────────────────────────────
function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

// ── Food-item icon (rotates between two icons) ────────────────────
function FoodIcon({ index }) {
  // alternate icons for visual variety
  return index % 2 === 0 ? (
    <Utensils className="w-4 h-4" />
  ) : (
    <Utensils className="w-4 h-4 rotate-12" />
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function TokenCard({
  tokenId,
  email,
  items = [],
  amount,
  createdAt,
  status = "active",
}) {
  const isActive = status === "active";
  const clock = useLiveClock();

  // Parse Firestore Timestamp or plain Date
  const date =
    createdAt && typeof createdAt.toDate === "function"
      ? createdAt.toDate()
      : createdAt instanceof Date
      ? createdAt
      : new Date();

  return (
    <div
      className={`
        token-card w-full max-w-[380px] mx-auto rounded-2xl overflow-hidden
        border transition-all duration-300
        ${isActive
          ? "border-blue-200 shadow-xl shadow-blue-100/60"
          : "border-gray-200 shadow-md opacity-70 grayscale-[40%]"
        }
      `}
    >
      {/* ─── 1. HEADER BANNER ──────────────────────────────────── */}
      <div
        className={`
          token-header relative px-4 py-4 flex items-center gap-3
          ${isActive ? "token-gradient-animate" : "bg-gray-400"}
        `}
      >
        <CollegeLogo />
        {/* Divider */}
        <div className="w-px h-10 bg-white/30" />
        {/* College name */}
        <div className="min-w-0">
          <p className="text-white text-xl font-extrabold leading-tight">CK</p>
          <p className="text-white/90 text-[9px] font-semibold uppercase tracking-wider leading-tight">
            College of Engineering<br />and Technology
          </p>
        </div>
      </div>

      {/* ─── 2. BODY ───────────────────────────────────────────── */}
      <div className="bg-[#F8FBFF] px-5 py-5 space-y-4">
        {/* ── TOKEN label ────────────────── */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-blue-200/60" />
          <span className="text-[11px] font-semibold tracking-[0.25em] text-blue-300 uppercase">
            Token
          </span>
          <div className="flex-1 h-px bg-blue-200/60" />
        </div>

        {/* ── Token ID pill ──────────────── */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-5 py-2.5">
            <Ticket className="w-5 h-5 text-blue-400" />
            <span className="text-2xl font-extrabold text-[#0B1F5C] tracking-tight">
              #{tokenId}
            </span>
          </div>
        </div>

        {/* ── Items box ──────────────────── */}
        <div className="bg-white rounded-xl border border-blue-100 divide-y divide-blue-50">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                <FoodIcon index={i} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-[#0B1F5C] text-sm">{item.name}</span>
                <span className="text-gray-400 text-sm ml-1.5">× {item.qty}</span>
              </div>
              <span className="font-bold text-[#0B1F5C] text-sm whitespace-nowrap">
                ₹{item.price}
              </span>
            </div>
          ))}
        </div>

        {/* ── Divider ────────────────────── */}
        <div className="h-px bg-blue-100/60" />

        {/* ── Detail rows ────────────────── */}
        <div className="space-y-2.5">
          {/* Email */}
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-blue-300 shrink-0" />
            <span className="text-blue-300">Email</span>
            <span className="flex-1 text-right font-medium text-[#0B1F5C] truncate ml-2">
              {email}
            </span>
          </div>
          {/* Date */}
          <div className="flex items-center gap-3 text-sm">
            <CalendarDays className="w-4 h-4 text-blue-300 shrink-0" />
            <span className="text-blue-300">Date</span>
            <span className="flex-1 text-right font-medium text-[#0B1F5C]">
              {formatDate(date)}
            </span>
          </div>
          {/* Time */}
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-blue-300 shrink-0" />
            <span className="text-blue-300">Time</span>
            <span className="flex-1 text-right font-medium text-[#0B1F5C]">
              {formatTime(date)}
            </span>
          </div>
        </div>

        {/* ── Divider ────────────────────── */}
        <div className="h-px bg-blue-100/60" />

        {/* ── Total amount strip ──────────── */}
        <div className="bg-blue-50 rounded-xl px-4 py-3 flex items-center gap-3">
          <Wallet className="w-5 h-5 text-blue-400 shrink-0" />
          <span className="text-sm text-blue-400 font-medium">Total amount</span>
          <span className="flex-1 text-right text-xl font-extrabold text-blue-600">
            ₹{amount}
          </span>
        </div>


        {/* ── Status pill ────────────────── */}
        <div className="flex justify-center">
          <div
            className={`
              inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wide
              ${isActive
                ? "token-status-animate text-white"
                : "bg-gray-300 text-gray-600"
              }
            `}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isActive ? "bg-white" : "bg-gray-500"
              }`}
            />
            {isActive ? "Waiting to be Served" : "Served"}
          </div>
        </div>
      </div>

      {/* ─── 3. FOOTER ─────────────────────────────────────────── */}
      <div className="bg-[#F0F5FF] border-t border-blue-100 px-5 py-3 flex items-center gap-3 text-xs text-blue-400">
        <ChefHat className="w-4 h-4 shrink-0" />
        <div className="w-px h-4 bg-blue-200" />
        <span className="flex-1">
          Show this token to the admin to collect your food.
        </span>
        <span className="font-mono text-blue-300 tabular-nums shrink-0">
          {clock}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// LOADING SKELETON — show while tokens are being fetched
// ═══════════════════════════════════════════════════════════════════
export function TokenCardSkeleton() {
  return (
    <div className="w-full max-w-[380px] mx-auto rounded-2xl overflow-hidden border border-gray-200 animate-pulse">
      {/* Header */}
      <div className="h-20 bg-gray-200" />
      {/* Body */}
      <div className="bg-gray-50 px-5 py-5 space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto" />
        <div className="h-10 bg-gray-200 rounded-full w-2/3 mx-auto" />
        <div className="h-20 bg-gray-200 rounded-xl" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="h-12 bg-gray-200 rounded-xl" />
        <div className="h-8 bg-gray-200 rounded-full w-1/2 mx-auto" />
      </div>
      {/* Footer */}
      <div className="h-10 bg-gray-100" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// EMPTY STATE — show when user has no active tokens
// ═══════════════════════════════════════════════════════════════════
export function TokenEmptyState() {
  return (
    <div className="w-full max-w-[380px] mx-auto text-center py-12 px-6">
      <div className="w-16 h-16 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
        <Ticket className="w-8 h-8 text-blue-300" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">No active tokens</h3>
      <p className="text-sm text-gray-400">
        Order food from the menu to receive your token.
      </p>
    </div>
  );
}
