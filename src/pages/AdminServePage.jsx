// src/pages/AdminServePage.jsx
// Admin page to view active tokens live and mark them as served.
// Search queries Firestore directly on displayId.

import { useEffect, useState } from "react";
import {
  subscribeActiveTokens,
  searchActiveTokens,
  markTokenAsServed,
  formatTokenDateTime,
} from "../services/token";
import toast from "react-hot-toast";
import {
  Search,
  X,
  Utensils,
  CheckCircle2,
  Clock,
  Mail,
  AlertTriangle,
  RotateCw,
} from "lucide-react";

export default function AdminServePage() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search input state
  const [searchQuery, setSearchQuery] = useState("");

  // Confirmation dialog state
  const [selectedToken, setSelectedToken] = useState(null);
  const [isServing, setIsServing] = useState(false);

  // Live subscription: listens to all active tokens or searches displayId in Firestore
  useEffect(() => {
    setLoading(true);
    setError(null);

    const isSearching = searchQuery.trim().length > 0;

    const unsub = isSearching
      ? searchActiveTokens(
          searchQuery,
          (data) => {
            setTokens(data);
            setLoading(false);
          },
          (err) => {
            setError(err.message);
            setLoading(false);
          }
        )
      : subscribeActiveTokens(
          (data) => {
            setTokens(data);
            setLoading(false);
          },
          (err) => {
            setError(err.message);
            setLoading(false);
          }
        );

    return () => unsub();
  }, [searchQuery]);

  // Execute transaction to mark token as served after confirmation
  async function handleConfirmServe() {
    if (!selectedToken || isServing) return;
    setIsServing(true);

    try {
      await markTokenAsServed(selectedToken.id);
      const display = selectedToken.displayId
        ? selectedToken.displayId.replace(/^#/, "")
        : selectedToken.id;
      toast.success(`Token #${display} marked as served!`);
      setSelectedToken(null);
    } catch (err) {
      toast.error(err.message || "Failed to mark token as served.");
      setSelectedToken(null);
    } finally {
      setIsServing(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* ── Header ────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
            <Utensils className="w-4.5 h-4.5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Food Serve Queue</h1>
            <p className="text-xs text-gray-400">Live active tokens for pickup</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
          {tokens.length} Active
        </span>
      </div>

        {/* ── Search Bar (Firestore query on displayId) ────────── */}
        <div className="relative mb-5">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search Token ID... (e.g. A1024)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Error state ───────────────── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5 text-red-700 text-xs">
            <div className="flex items-center gap-2 font-bold mb-1">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>Failed to load tokens</span>
            </div>
            <p className="mb-2">{error}</p>
            {error.includes("index") && (
              <p className="font-semibold text-red-800">
                Tip: Firestore requires a composite index on &quot;tokens&quot; (status ASC, createdAt DESC). Check your browser console (F12) for the auto-create link.
              </p>
            )}
          </div>
        )}

        {/* ── Loading state ─────────────── */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse space-y-3"
              >
                <div className="flex justify-between items-center">
                  <div className="h-6 w-24 bg-gray-200 rounded-lg" />
                  <div className="h-5 w-16 bg-gray-100 rounded-full" />
                </div>
                <div className="h-4 w-3/4 bg-gray-100 rounded" />
                <div className="h-10 bg-gray-50 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* ── Empty state ───────────────── */}
        {!loading && !error && tokens.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
            <div className="w-14 h-14 mx-auto bg-primary-50 rounded-2xl flex items-center justify-center mb-3">
              <Utensils className="w-7 h-7 text-primary-400" />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">
              {searchQuery ? "No matching tokens" : "All caught up!"}
            </h3>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              {searchQuery
                ? `No active tokens found matching "${searchQuery}". Check the token number.`
                : "No active tokens in the queue right now. New tokens will appear live as students order."}
            </p>
          </div>
        )}

        {/* ── Active Tokens List ────────── */}
        {!loading && !error && tokens.length > 0 && (
          <div className="space-y-4">
            {tokens.map((token) => {
              const display = token.displayId
                ? token.displayId.replace(/^#/, "")
                : token.id.slice(0, 5).toUpperCase();
              const { dateStr, timeStr } = formatTokenDateTime(token.createdAt);

              return (
                <div
                  key={token.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition"
                >
                  {/* Card Header: displayId, status & time */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-primary-50 border border-primary-200 text-primary-700 font-extrabold text-base rounded-xl tracking-tight">
                        #{display}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    </div>

                    <div className="text-right text-[11px] text-gray-400">
                      <div className="flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>{timeStr}</span>
                      </div>
                      <span>{dateStr}</span>
                    </div>
                  </div>

                  {/* Buyer Email */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 py-2.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{token.email || "No email"}</span>
                  </div>

                  {/* Food Items */}
                  <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-1.5">
                    {Array.isArray(token.items) && token.items.length > 0 ? (
                      token.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="font-semibold text-gray-800">
                            {item.name} <span className="text-gray-400 font-normal">× {item.qty}</span>
                          </span>
                          <span className="font-medium text-gray-600">
                            ₹{item.price * (item.qty || 1)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400">No items listed</p>
                    )}

                    <div className="border-t border-gray-200/60 pt-2 mt-2 flex items-center justify-between text-xs font-bold text-gray-900">
                      <span>Total Amount</span>
                      <span className="text-primary-700 text-sm">₹{token.amount}</span>
                    </div>

                    {token.utrNumber && (
                      <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                        <span>UTR / Trans. ID:</span>
                        <span className="font-mono font-medium text-gray-700">{token.utrNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Mark as Served Button */}
                  <button
                    onClick={() => setSelectedToken(token)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.99]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark as Served</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Confirmation Dialog Modal ── */}
        {selectedToken && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 animate-scale-up">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-gray-900">
                  Mark Token #{selectedToken.displayId ? selectedToken.displayId.replace(/^#/, "") : selectedToken.id} as Served?
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  The food will be considered collected and this token will no longer appear in active tokens.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedToken(null)}
                  disabled={isServing}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmServe}
                  disabled={isServing}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isServing ? (
                    <RotateCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Yes, Mark as Served</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
