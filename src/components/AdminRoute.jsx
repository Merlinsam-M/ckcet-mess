// src/components/AdminRoute.jsx
// Protects admin pages — checks Firebase Auth + admins/{uid} in Firestore.
// If not admin, shows "Access Denied". If still checking, shows spinner.

import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { checkIsAdmin } from "../services/admin";
import Spinner from "./Spinner";
import { ShieldX } from "lucide-react";

export default function AdminRoute({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null); // null = still checking

  useEffect(() => {
    if (authLoading || !user) return;
    checkIsAdmin(user.uid).then(setIsAdmin);
  }, [user, authLoading]);

  // Firebase auth still loading
  if (authLoading) return <Spinner />;

  // Not logged in at all
  if (!user) return <Navigate to="/login" replace />;

  // Checking admin status
  if (isAdmin === null) return <Spinner text="Checking access..." />;

  // Not an admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <ShieldX className="w-12 h-12 text-red-400 mb-3" />
        <h2 className="text-lg font-bold text-gray-900">Access Denied</h2>
        <p className="text-sm text-gray-500 mt-1">
          You are not authorized to view this page.
        </p>
      </div>
    );
  }

  return children;
}
