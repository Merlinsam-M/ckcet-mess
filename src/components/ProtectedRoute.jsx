// src/components/ProtectedRoute.jsx
// Wraps pages that require a logged-in user.
// Shows a spinner while Firebase loads, redirects to /login if no user.

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "./Spinner";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
