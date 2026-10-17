// src/services/token.js
// Firestore operations for the tokens collection.
// Used by the Buyer My Tokens page and Admin Food Serve page.

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  runTransaction,
  serverTimestamp,
  getDocs,
  Timestamp,
  limit as limitFn,
  startAfter,
} from "firebase/firestore";
import { db, auth } from "../firebase/config";

const tokensRef = collection(db, "tokens");

// ── Buyer: Subscribe to current user's ACTIVE tokens live ────────
// Reads tokens where userId == uid and status == "active".
// Returns unsubscribe function.
export function subscribeBuyerActiveTokens(userId, onData, onError) {
  const q = query(
    tokensRef,
    where("userId", "==", userId),
    where("status", "==", "active")
  );

  return onSnapshot(
    q,
    (snap) => {
      const tokens = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Sort newest first in memory so it works seamlessly
      tokens.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return timeB - timeA;
      });
      onData(tokens);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

// ── Admin: Subscribe to all ACTIVE tokens live (newest first) ────
// Requires composite index on tokens (status ASC, createdAt DESC).
export function subscribeActiveTokens(onData, onError) {
  const q = query(
    tokensRef,
    where("status", "==", "active"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snap) => {
      const tokens = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onData(tokens);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

// ── Admin: Search ACTIVE tokens by displayId in Firestore ────────
// Uses Firestore query on displayId — never loads full history into browser.
export function searchActiveTokens(searchId, onData, onError) {
  const cleanId = searchId.trim().replace(/^#/, "");
  // Query for both "A1024" and "#A1024" to match how admin or tester created it
  const q = query(
    tokensRef,
    where("status", "==", "active"),
    where("displayId", "in", [cleanId, `#${cleanId}`])
  );

  return onSnapshot(
    q,
    (snap) => {
      const tokens = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onData(tokens);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

// ── Admin: Mark token as served using a Firestore TRANSACTION ────
// Checks status == "active", then sets status: "served", servedAt, servedBy.
// If already served, throws "This token has already been served."
export async function markTokenAsServed(tokenId) {
  const tokenRef = doc(db, "tokens", tokenId);

  await runTransaction(db, async (transaction) => {
    const tokenDoc = await transaction.get(tokenRef);
    if (!tokenDoc.exists()) {
      throw new Error("Token does not exist.");
    }

    const data = tokenDoc.data();
    if (data.status !== "active") {
      throw new Error("This token has already been served.");
    }

    const adminUid = auth.currentUser ? auth.currentUser.uid : "unknown";

    transaction.update(tokenRef, {
      status: "served",
      servedAt: serverTimestamp(),
      servedBy: adminUid,
    });
  });
}

// ── Helper: Format timestamp in Asia/Kolkata timezone ─────────────
export function formatTokenDateTime(timestamp) {
  if (!timestamp) return { dateStr: "", timeStr: "" };
  const date =
    timestamp && typeof timestamp.toDate === "function"
      ? timestamp.toDate()
      : timestamp instanceof Date
      ? timestamp
      : new Date(timestamp);

  const dateStr = date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  const timeStr = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  return { dateStr, timeStr };
}

// ── Helper: Get start and end Timestamps for a date string in Asia/Kolkata ──
// dateStr is "YYYY-MM-DD". Returns { start: Timestamp, end: Timestamp }.
export function getDayBounds(dateStr) {
  // Build the start-of-day and end-of-day in Asia/Kolkata as UTC Date objects.
  // Asia/Kolkata is UTC+5:30, so 00:00 IST = previous day 18:30 UTC.
  const [y, m, d] = dateStr.split("-").map(Number);
  const startIST = new Date(Date.UTC(y, m - 1, d, 0, 0, 0) - 5.5 * 60 * 60 * 1000);
  const endIST = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999) - 5.5 * 60 * 60 * 1000);
  return {
    start: Timestamp.fromDate(startIST),
    end: Timestamp.fromDate(endIST),
  };
}

// ── Admin History: Fetch tokens for a date with pagination ──────────
// Returns { tokens, lastDoc } for "Load more". PAGE_SIZE = 25.
// Requires composite index: tokens (createdAt DESC) — single-field is fine.
// When filtered by status, needs: tokens (status ASC, createdAt DESC).
export const HISTORY_PAGE_SIZE = 25;

export async function fetchTokensByDate(dateStr, statusFilter, lastDoc) {
  const { start, end } = getDayBounds(dateStr);

  const constraints = [
    where("createdAt", ">=", start),
    where("createdAt", "<=", end),
  ];
  if (statusFilter && statusFilter !== "all") {
    constraints.push(where("status", "==", statusFilter));
  }
  constraints.push(orderBy("createdAt", "desc"));
  constraints.push(limitFn(HISTORY_PAGE_SIZE));
  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  const q = query(tokensRef, ...constraints);
  const snap = await getDocs(q);
  const tokens = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const newLastDoc = snap.docs[snap.docs.length - 1] || null;
  return { tokens, lastDoc: newLastDoc, hasMore: snap.docs.length === HISTORY_PAGE_SIZE };
}

// ── Admin History: Search by displayId (Firestore query, not full-load) ──
export async function searchTokensByDisplayId(dateStr, searchId) {
  const { start, end } = getDayBounds(dateStr);
  const cleanId = searchId.trim().replace(/^#/, "");

  const q = query(
    tokensRef,
    where("createdAt", ">=", start),
    where("createdAt", "<=", end),
    where("displayId", "in", [cleanId, `#${cleanId}`]),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Admin History: Search by email (Firestore query, not full-load) ──
export async function searchTokensByEmail(dateStr, emailStr) {
  const { start, end } = getDayBounds(dateStr);

  const q = query(
    tokensRef,
    where("createdAt", ">=", start),
    where("createdAt", "<=", end),
    where("email", "==", emailStr.trim().toLowerCase()),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Admin PDF: Fetch ALL tokens for a single date (no pagination) ───
export async function fetchAllTokensForDate(dateStr) {
  const { start, end } = getDayBounds(dateStr);

  const q = query(
    tokensRef,
    where("createdAt", ">=", start),
    where("createdAt", "<=", end),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

