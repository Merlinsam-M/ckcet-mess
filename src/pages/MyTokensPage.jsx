// src/pages/MyTokensPage.jsx
// Shows the signed-in user's own ACTIVE tokens live from Firestore.
// Served tokens automatically disappear from this page.

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { subscribeBuyerActiveTokens } from "../services/token";
import TokenCard, { TokenEmptyState } from "../components/TokenCard";
import { Ticket, AlertCircle } from "lucide-react";

export default function MyTokensPage() {
  const { user } = useAuth();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Subscribe live to active tokens where userId == current user UID
    const unsub = subscribeBuyerActiveTokens(
      user.uid,
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
  }, [user?.uid]);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24">
      {/* ── Header ─────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
            <Ticket className="w-4.5 h-4.5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">My Tokens</h1>
            <p className="text-xs text-gray-400">Your active food collection tokens</p>
          </div>
        </div>

        {!loading && tokens.length > 0 && (
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            {tokens.length} Active
          </span>
        )}
      </div>

      {/* ── Error state ────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center text-xs text-red-700 mb-4">
          <AlertCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
          <p className="font-semibold">Unable to load tokens</p>
          <p className="text-gray-500 mt-0.5">{error}</p>
        </div>
      )}

      {/* ── Loading skeleton ───────────── */}
      {loading && (
        <div className="w-full max-w-[380px] mx-auto space-y-4 animate-pulse">
          <div className="h-44 bg-gray-200 rounded-2xl" />
          <div className="h-32 bg-gray-100 rounded-2xl" />
        </div>
      )}

      {/* ── Token list ─────────────────── */}
      {!loading && !error && (
        tokens.length > 0 ? (
          <div className="space-y-6">
            {tokens.map((token) => {
              const display = token.displayId
                ? token.displayId.replace(/^#/, "")
                : token.id;

              return (
                <TokenCard
                  key={token.id}
                  tokenId={display}
                  email={token.email || user?.email}
                  items={token.items || []}
                  amount={token.amount}
                  createdAt={token.createdAt}
                  status="active"
                />
              );
            })}
          </div>
        ) : (
          <TokenEmptyState />
        )
      )}
    </div>
  );
}
