// src/services/settings.js
// Firestore service for app settings (e.g. token distribution time window).
// Stores configuration in the settings/app document.

import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

// Default settings if document doesn't exist in Firestore yet
export const DEFAULT_SETTINGS = {
  tokenStartTime: "09:30",
  tokenEndTime: "12:15",
  timezone: "Asia/Kolkata",
};

// Subscribe live to settings/app document
export function subscribeAppSettings(onSuccess, onError) {
  const docRef = doc(db, "settings", "app");
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onSuccess({ ...DEFAULT_SETTINGS, ...snapshot.data() });
      } else {
        onSuccess(DEFAULT_SETTINGS);
      }
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

// Update settings/app document in Firestore (Admin only)
export async function updateAppSettings({ tokenStartTime, tokenEndTime }) {
  const docRef = doc(db, "settings", "app");
  await setDoc(
    docRef,
    {
      tokenStartTime,
      tokenEndTime,
      timezone: "Asia/Kolkata",
    },
    { merge: true }
  );
}

// Helper: Format "09:30" to 12-hour AM/PM string (e.g. "9:30 AM")
export function formatTime12h(timeStr) {
  if (!timeStr) return "";
  const [hStr, mStr] = timeStr.split(":");
  let h = parseInt(hStr, 10);
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${mStr} ${ampm}`;
}

// Helper: Check if current time in Asia/Kolkata is within start and end time
export function isTokenWindowOpen(startTimeStr, endTimeStr) {
  if (!startTimeStr || !endTimeStr) return true;

  try {
    const now = new Date();
    // Format current time into Asia/Kolkata 24-hour hours and minutes
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
    const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
    const currentMinutes = hour * 60 + minute;

    const [startH, startM] = startTimeStr.split(":").map(Number);
    const [endH, endM] = endTimeStr.split(":").map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } catch (err) {
    console.error("Error checking token window:", err);
    return true;
  }
}
