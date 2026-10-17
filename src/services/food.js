// src/services/food.js
// Firestore operations for the foods collection.
// Used by both the buyer Menu page and the Admin Menu Edit page.

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

const foodsRef = collection(db, "foods");

// ── Buyer: listen to active foods in real-time ────────────────────
// Returns an unsubscribe function. Calls onData(foods[]) or onError(err).
export function subscribeActiveFoods(onData, onError) {
  const q = query(
    foodsRef,
    where("active", "==", true),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    const foods = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    onData(foods);
  }, onError);
}

// ── Admin: listen to ALL foods (active + disabled) ────────────────
export function subscribeAllFoods(onData, onError) {
  const q = query(foodsRef, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const foods = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    onData(foods);
  }, onError);
}

// ── Admin: add a new food item ────────────────────────────────────
export function addFood(name, price) {
  return addDoc(foodsRef, {
    name: name.trim(),
    price: Number(price),
    active: true,
    createdAt: serverTimestamp(),
  });
}

// ── Admin: update food name and/or price ──────────────────────────
export function updateFood(foodId, data) {
  return updateDoc(doc(db, "foods", foodId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ── Admin: toggle active/disabled (soft delete) ───────────────────
export function toggleFoodActive(foodId, currentlyActive) {
  return updateDoc(doc(db, "foods", foodId), {
    active: !currentlyActive,
    updatedAt: serverTimestamp(),
  });
}
