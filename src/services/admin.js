// src/services/admin.js
// Checks if the current user is an admin by reading admins/{uid} from Firestore.
// A user is admin ONLY if that document exists. No frontend password tricks.

import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

/** Returns true if a doc admins/{uid} exists in Firestore. */
export async function checkIsAdmin(uid) {
  if (!uid) return false;
  const snap = await getDoc(doc(db, "admins", uid));
  return snap.exists();
}
