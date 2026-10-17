// src/pages/AdminMenuPage.jsx
// Admin page to manage food items and app settings (Token distribution window).
// Only accessible if the user has a document in admins/{uid} (checked by AdminRoute).

import { useEffect, useState } from "react";
import {
  subscribeAllFoods,
  addFood,
  updateFood,
  toggleFoodActive,
} from "../services/food";
import {
  subscribeAppSettings,
  updateAppSettings,
} from "../services/settings";
import toast from "react-hot-toast";
import {
  Plus,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Check,
  X,
  UtensilsCrossed,
  Clock,
  Save,
  ChefHat,
} from "lucide-react";

export default function AdminMenuPage() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New-food form state
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [adding, setAdding] = useState(false);

  // Inline-edit state: which food is being edited
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [saving, setSaving] = useState(false);

  // Token distribution settings state
  const [startTime, setStartTime] = useState("09:30");
  const [endTime, setEndTime] = useState("12:15");
  const [savingSettings, setSavingSettings] = useState(false);

  // Subscribe to ALL foods and App Settings
  useEffect(() => {
    const unsubFoods = subscribeAllFoods(
      (data) => {
        setFoods(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    const unsubSettings = subscribeAppSettings((data) => {
      if (data.tokenStartTime) setStartTime(data.tokenStartTime);
      if (data.tokenEndTime) setEndTime(data.tokenEndTime);
    });

    return () => {
      unsubFoods();
      unsubSettings();
    };
  }, []);

  // ── Add food ────────────────────────────────────────────────────
  async function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim() || !newPrice) return;
    setAdding(true);
    try {
      await addFood(newName, newPrice);
      toast.success(`"${newName.trim()}" added!`);
      setNewName("");
      setNewPrice("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  }

  // ── Start editing food ──────────────────────────────────────────
  function startEdit(food) {
    setEditId(food.id);
    setEditName(food.name);
    setEditPrice(String(food.price));
  }

  // ── Save food edit ──────────────────────────────────────────────
  async function handleSaveEdit() {
    if (!editName.trim() || !editPrice) return;
    setSaving(true);
    try {
      await updateFood(editId, {
        name: editName.trim(),
        price: Number(editPrice),
      });
      toast.success("Updated!");
      setEditId(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  // ── Toggle food active/disabled ─────────────────────────────────
  async function handleToggle(food) {
    try {
      await toggleFoodActive(food.id, food.active);
      toast.success(
        food.active ? `"${food.name}" disabled` : `"${food.name}" enabled`
      );
    } catch (err) {
      toast.error(err.message);
    }
  }

  // ── Save Token Distribution Settings ──────────────────────────
  async function handleSaveSettings(e) {
    e.preventDefault();
    if (!startTime || !endTime) return;
    setSavingSettings(true);
    try {
      await updateAppSettings({
        tokenStartTime: startTime,
        tokenEndTime: endTime,
      });
      toast.success("Token settings saved!");
    } catch (err) {
      toast.error("Failed to save settings: " + err.message);
    } finally {
      setSavingSettings(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* ── Header ────────────────────── */}
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
          <ChefHat className="w-4.5 h-4.5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Menu Editor</h1>
          <p className="text-xs text-gray-400">Manage Menu & Token Hours</p>
        </div>
      </div>

        {/* ── Token Distribution Settings ─────── */}
        <form
          onSubmit={handleSaveSettings}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 animate-fade-in-up"
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-primary-600" />
            <p className="text-sm font-semibold text-gray-800">
              Token Distribution Hours
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              Timezone: Asia/Kolkata (IST)
            </span>
            <button
              type="submit"
              disabled={savingSettings}
              className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition disabled:opacity-60 flex items-center gap-1.5 text-xs font-semibold"
            >
              {savingSettings ? (
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Save Settings
            </button>
          </div>
        </form>

        {/* ── Add Food Form ─────────────── */}
        <form
          onSubmit={handleAdd}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 animate-fade-in-up"
        >
          <p className="text-sm font-semibold text-gray-700 mb-3">Add New Food</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Food name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
            />
            <input
              type="number"
              placeholder="₹ Price"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              required
              min="1"
              className="w-24 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
            />
            <button
              type="submit"
              disabled={adding}
              className="px-3 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition disabled:opacity-60 flex items-center gap-1 text-sm font-medium shrink-0"
            >
              {adding ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add
            </button>
          </div>
        </form>

        {/* ── Loading state ─────────────── */}
        {loading && (
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
              </div>
            ))}
          </div>
        )}

        {/* ── Error state ──────────────── */}
        {error && (
          <p className="text-center text-red-500 text-sm py-8">{error}</p>
        )}

        {/* ── Empty state ──────────────── */}
        {!loading && !error && foods.length === 0 && (
          <div className="text-center py-12">
            <UtensilsCrossed className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No food items yet. Add one above!</p>
          </div>
        )}

        {/* ── Food list ────────────────── */}
        {!loading && !error && foods.length > 0 && (
          <div className="space-y-3">
            {foods.map((food) => (
              <div
                key={food.id}
                className={`bg-white rounded-xl border p-4 flex items-center gap-3 transition ${
                  food.active ? "border-gray-100" : "border-gray-100 opacity-50"
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    food.active ? "bg-primary-600 text-white" : "bg-gray-300 text-white"
                  }`}
                >
                  <UtensilsCrossed className="w-5 h-5" />
                </div>

                {/* Name + Price (editable or static) */}
                {editId === food.id ? (
                  <div className="flex-1 flex gap-2 items-center">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-2 py-1.5 rounded-lg border border-primary-300 text-sm focus:ring-2 focus:ring-primary-200 outline-none"
                    />
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      min="1"
                      className="w-20 px-2 py-1.5 rounded-lg border border-primary-300 text-sm focus:ring-2 focus:ring-primary-200 outline-none"
                    />
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition"
                      aria-label="Save"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
                      aria-label="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {food.name}
                      </p>
                      <p className="text-primary-600 font-bold text-sm">
                        ₹{food.price}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <button
                      onClick={() => startEdit(food)}
                      className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-primary-50 hover:text-primary-600 transition"
                      aria-label="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggle(food)}
                      className={`p-2 rounded-lg transition ${
                        food.active
                          ? "bg-green-50 text-green-600 hover:bg-green-100"
                          : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                      }`}
                      aria-label={food.active ? "Disable" : "Enable"}
                    >
                      {food.active ? (
                        <ToggleRight className="w-5 h-5" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
  );
}
