// src/pages/AdminHistoryPage.jsx
// Full admin history page — date-filtered, status-filtered, paginated,
// searchable by Token ID or Email, with Download PDF support.
// On small screens, rows render as cards (no horizontal scroll).

import { useEffect, useState, useCallback } from "react";
import {
  fetchTokensByDate,
  searchTokensByDisplayId,
  searchTokensByEmail,
  formatTokenDateTime,
  HISTORY_PAGE_SIZE,
} from "../services/token";
import { downloadDayReport } from "../services/pdf";
import toast from "react-hot-toast";
import {
  History,
  Search,
  X,
  ChevronDown,
  FileDown,
  Calendar,
  Filter,
  AlertTriangle,
  Ticket,
  Loader2,
} from "lucide-react";

// Today in YYYY-MM-DD for the date picker default
function todayIST() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

// Format items array into a short string
function fmtItems(items) {
  if (!Array.isArray(items) || items.length === 0) return "—";
  return items.map((i) => `${i.name} ×${i.qty}`).join(", ");
}

export default function AdminHistoryPage() {
  // ── Filter state ──
  const [date, setDate] = useState(todayIST());
  const [status, setStatus] = useState("all"); // "all" | "active" | "served"
  const [searchQuery, setSearchQuery] = useState("");

  // ── Data state ──
  const [tokens, setTokens] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // ── PDF state ──
  const [pdfDate, setPdfDate] = useState(todayIST());
  const [pdfBusy, setPdfBusy] = useState(false);

  // ── Load first page of tokens ──
  const loadTokens = useCallback(async () => {
    setLoading(true);
    setError(null);
    setLastDoc(null);
    setHasMore(false);

    try {
      // If there's a search query, run a search instead of paginated fetch
      if (searchQuery.trim()) {
        const q = searchQuery.trim();
        // Decide if it's an email (contains @) or a token ID
        let results;
        if (q.includes("@")) {
          results = await searchTokensByEmail(date, q);
        } else {
          results = await searchTokensByDisplayId(date, q);
        }
        // Client-side status filter on search results
        if (status !== "all") {
          results = results.filter((t) => t.status === status);
        }
        setTokens(results);
        setHasMore(false);
      } else {
        const result = await fetchTokensByDate(date, status, null);
        setTokens(result.tokens);
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [date, status, searchQuery]);

  // Reload when filters change
  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  // ── Load more (pagination) ──
  async function handleLoadMore() {
    if (!lastDoc || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await fetchTokensByDate(date, status, lastDoc);
      setTokens((prev) => [...prev, ...result.tokens]);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err) {
      toast.error("Failed to load more: " + err.message);
    } finally {
      setLoadingMore(false);
    }
  }

  // ── Download PDF ──
  async function handleDownloadPdf() {
    if (pdfBusy) return;
    setPdfBusy(true);
    try {
      const result = await downloadDayReport(pdfDate);
      if (result.empty) {
        toast.error("No orders found for this date. PDF not generated.");
      } else {
        toast.success(`PDF downloaded with ${result.count} orders.`);
      }
    } catch (err) {
      toast.error("PDF generation failed: " + err.message);
    } finally {
      setPdfBusy(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      {/* ── Header ────────────────────── */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
          <History className="w-4.5 h-4.5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Token History</h1>
          <p className="text-xs text-gray-400">Browse past orders & generate reports</p>
        </div>
      </div>

      {/* ── Filters Row ───────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 animate-fade-in-up">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-primary-600" />
          <span className="text-xs font-semibold text-gray-700">Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Date picker */}
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1">Date</label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
              />
            </div>
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1">Status</label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition appearance-none bg-white pr-8"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="served">Served</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Token ID or Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-2 rounded-xl border border-gray-200 text-xs focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Error state ────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5 text-xs text-red-700">
          <div className="flex items-center gap-2 font-bold mb-1">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span>Failed to load history</span>
          </div>
          <p>{error}</p>
          {error.includes("index") && (
            <p className="mt-1 font-semibold text-red-800">
              Tip: Open your browser console (F12) and click the Firestore index creation link.
            </p>
          )}
        </div>
      )}

      {/* ── Loading state ──────────────── */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse space-y-2">
              <div className="h-4 w-1/3 bg-gray-200 rounded" />
              <div className="h-3 w-2/3 bg-gray-100 rounded" />
              <div className="h-3 w-1/2 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ────────────────── */}
      {!loading && !error && tokens.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
          <div className="w-14 h-14 mx-auto bg-primary-50 rounded-2xl flex items-center justify-center mb-3">
            <Ticket className="w-7 h-7 text-primary-300" />
          </div>
          <h3 className="text-sm font-bold text-gray-800 mb-1">No tokens found</h3>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            {searchQuery
              ? `No results matching "${searchQuery}" on this date.`
              : "No orders were placed on this date. Try a different date."}
          </p>
        </div>
      )}

      {/* ── Desktop Table (hidden on small screens) ── */}
      {!loading && !error && tokens.length > 0 && (
        <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 font-semibold">
                  <th className="px-3 py-3">S.No</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Email</th>
                  <th className="px-3 py-3">Token ID</th>
                  <th className="px-3 py-3">Food</th>
                  <th className="px-3 py-3 text-right">Amount</th>
                  <th className="px-3 py-3 text-center">Status</th>
                  <th className="px-3 py-3">Purchased</th>
                  <th className="px-3 py-3">Served</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tokens.map((t, i) => {
                  const display = (t.displayId || t.id).replace(/^#/, "");
                  const { dateStr, timeStr: purchaseTime } = formatTokenDateTime(t.createdAt);
                  const { timeStr: servedTime } = formatTokenDateTime(t.servedAt);
                  const isServed = t.status === "served";

                  return (
                    <tr key={t.id} className="hover:bg-gray-50/60 transition">
                      <td className="px-3 py-2.5 text-gray-400 font-medium">{i + 1}</td>
                      <td className="px-3 py-2.5 text-gray-600">{dateStr}</td>
                      <td className="px-3 py-2.5 text-gray-700 max-w-[140px] truncate">{t.email || "—"}</td>
                      <td className="px-3 py-2.5 font-bold text-primary-700">#{display}</td>
                      <td className="px-3 py-2.5 text-gray-600 max-w-[160px] truncate">{fmtItems(t.items)}</td>
                      <td className="px-3 py-2.5 text-right font-bold text-gray-900">₹{t.amount || 0}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          isServed
                            ? "bg-gray-100 text-gray-500"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}>
                          {isServed ? (
                            "Served"
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-500">{purchaseTime}</td>
                      <td className="px-3 py-2.5 text-gray-500">{isServed ? servedTime : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Mobile Cards (visible on small screens only) ── */}
      {!loading && !error && tokens.length > 0 && (
        <div className="sm:hidden space-y-3 mb-5">
          {tokens.map((t, i) => {
            const display = (t.displayId || t.id).replace(/^#/, "");
            const { dateStr, timeStr: purchaseTime } = formatTokenDateTime(t.createdAt);
            const { timeStr: servedTime } = formatTokenDateTime(t.servedAt);
            const isServed = t.status === "served";

            return (
              <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2.5">
                {/* Top row: S.No, Token ID, Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-medium">#{i + 1}</span>
                    <span className="px-2.5 py-0.5 bg-primary-50 border border-primary-200 text-primary-700 font-extrabold text-xs rounded-lg">
                      #{display}
                    </span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    isServed
                      ? "bg-gray-100 text-gray-500"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}>
                    {isServed ? "Served" : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </>
                    )}
                  </span>
                </div>

                {/* Email */}
                <p className="text-[11px] text-gray-500 truncate">{t.email || "—"}</p>

                {/* Food items */}
                <p className="text-xs text-gray-700 font-medium">{fmtItems(t.items)}</p>

                {/* Bottom row: Amount, Date, Times */}
                <div className="flex items-center justify-between pt-1 border-t border-gray-50 text-[10px] text-gray-400">
                  <span className="font-bold text-gray-900 text-xs">₹{t.amount || 0}</span>
                  <span>{dateStr} · {purchaseTime}</span>
                </div>

                {isServed && servedTime && (
                  <p className="text-[10px] text-gray-400">
                    Served at {servedTime}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Load More Button ───────────── */}
      {hasMore && !loading && !searchQuery && (
        <div className="flex justify-center mb-6">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            {loadingMore ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            <span>Load more ({HISTORY_PAGE_SIZE} rows)</span>
          </button>
        </div>
      )}

      {/* ── Download PDF Section ──────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-fade-in-up">
        <div className="flex items-center gap-2 mb-3">
          <FileDown className="w-4 h-4 text-primary-600" />
          <span className="text-xs font-semibold text-gray-700">Download PDF Report</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-[11px] font-medium text-gray-500 mb-1">Report Date</label>
            <input
              type="date"
              value={pdfDate}
              onChange={(e) => setPdfDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleDownloadPdf}
              disabled={pdfBusy}
              className="w-full sm:w-auto px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {pdfBusy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
