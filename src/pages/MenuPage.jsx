// src/pages/MenuPage.jsx
// Displays active foods with CartContext quantity selectors.
// Shows live Token Distribution status and persistent bottom Cart summary.

import { useEffect, useState } from "react";
import { subscribeActiveFoods } from "../services/food";
import {
  subscribeAppSettings,
  isTokenWindowOpen,
  formatTime12h,
} from "../services/settings";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import {
  UtensilsCrossed,
  Minus,
  Plus,
  ShoppingBag,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

// ── Skeleton shown while foods load ───────────────────────────────
function MenuSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-100 rounded w-1/5" />
          </div>
          <div className="h-8 w-20 bg-gray-200 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export default function MenuPage() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // App settings state for token time window
  const [settings, setSettings] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cart Context for shared cart state
  const { cart, cartItems, changeQty, totalQty, totalAmount } = useCart();

  useEffect(() => {
    // 1. Subscribe to active foods live from Firestore
    const unsubFoods = subscribeActiveFoods(
      (data) => {
        setFoods(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    // 2. Subscribe to settings/app live from Firestore
    const unsubSettings = subscribeAppSettings((data) => {
      setSettings(data);
    });

    return () => {
      unsubFoods();
      unsubSettings();
    };
  }, []);

  // Check if current time is within token distribution window
  const isOpen = settings
    ? isTokenWindowOpen(settings.tokenStartTime, settings.tokenEndTime)
    : true;

  // Handle Confirm & Pay click (prevent double clicks, show notice)
  async function handleConfirmPay() {
    if (isSubmitting) return;
    setIsSubmitting(true);

    toast.error("Payment isn't connected yet", {
      id: "payment-not-connected", // prevents duplicate toasts on fast clicks
    });

    setTimeout(() => {
      setIsSubmitting(false);
    }, 1000);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-28">
      {/* ── Header ─────────────────────── */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
          <UtensilsCrossed className="w-4.5 h-4.5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Menu</h1>
          <p className="text-xs text-gray-400">Select items and quantity</p>
        </div>
      </div>

      {/* ── Token Time Window Banner ───── */}
      {settings && (
        <div className="mb-5 animate-fade-in-up">
          {isOpen ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2.5 text-emerald-800 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Tokens are open now ({formatTime12h(settings.tokenStartTime)} –{" "}
                {formatTime12h(settings.tokenEndTime)})
              </span>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2.5 text-red-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>
                Tokens will be issued only between{" "}
                {formatTime12h(settings.tokenStartTime)} and{" "}
                {formatTime12h(settings.tokenEndTime)}.
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Loading state ──────────────── */}
      {loading && <MenuSkeleton />}

      {/* ── Error state ────────────────── */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 text-sm font-medium">Failed to load menu</p>
          <p className="text-xs text-gray-400 mt-1">{error}</p>
        </div>
      )}

      {/* ── Empty state ────────────────── */}
      {!loading && !error && foods.length === 0 && (
        <div className="text-center py-16">
          <div className="w-14 h-14 mx-auto bg-primary-50 rounded-2xl flex items-center justify-center mb-3">
            <UtensilsCrossed className="w-7 h-7 text-primary-300" />
          </div>
          <h3 className="text-base font-semibold text-gray-700">No items available</h3>
          <p className="text-sm text-gray-400 mt-1">The menu is empty right now. Check back later!</p>
        </div>
      )}

      {/* ── Food list ──────────────────── */}
      {!loading && !error && foods.length > 0 && (
        <div className="space-y-3">
          {foods.map((food, i) => {
            const currentQty = cart[food.id]?.qty || 0;

            return (
              <div
                key={food.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>

                {/* Name + Price */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{food.name}</p>
                  <p className="text-primary-600 font-bold text-sm">₹{food.price}</p>
                </div>

                {/* Quantity selector */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => changeQty(food, -1)}
                    disabled={currentQty === 0}
                    className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    aria-label={`Decrease ${food.name}`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-7 text-center text-sm font-bold text-gray-900 tabular-nums">
                    {currentQty}
                  </span>

                  <button
                    onClick={() => changeQty(food, 1)}
                    className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white hover:bg-primary-700 transition"
                    aria-label={`Increase ${food.name}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Bottom summary bar (visible only when items are selected) */}
      {totalQty > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-30 px-4 pb-2">
          <div className="max-w-lg mx-auto bg-gray-900 text-white rounded-2xl p-4 shadow-xl flex items-center justify-between gap-3 animate-slide-down">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold leading-tight">
                  {totalQty} item{totalQty > 1 ? "s" : ""} · ₹{totalAmount}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {cartItems.map((item) => `${item.name} × ${item.qty}`).join(", ")}
                </p>
              </div>
            </div>

            {/* Confirm & Pay button */}
            <button
              onClick={handleConfirmPay}
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50 shrink-0 flex items-center gap-1.5"
            >
              <span>Confirm & Pay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
