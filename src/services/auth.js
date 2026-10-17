// src/services/auth.js
// All Firebase Authentication logic — keeps UI components clean.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase/config";

/** Create a new account with email & password. */
export function signUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

/** Sign in an existing user. */
export function logIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

/** Sign out the current user. */
export function logOut() {
  return signOut(auth);
}

/** Send a password-reset email. */
export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}
