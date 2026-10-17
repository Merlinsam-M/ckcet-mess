// src/App.jsx
// Root component — sets up all routes and the toast notification system.
// Buyer pages are wrapped in BuyerLayout (bottom nav bar).
// Admin pages are protected by AdminRoute and wrapped in AdminLayout (sidebar on desktop, bottom nav on mobile).

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import BuyerLayout from "./layouts/BuyerLayout";
import AdminLayout from "./layouts/AdminLayout";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import MenuPage from "./pages/MenuPage";
import MyTokensPage from "./pages/MyTokensPage";
import AccountPage from "./pages/AccountPage";
import AdminServePage from "./pages/AdminServePage";
import AdminMenuPage from "./pages/AdminMenuPage";
import AdminHistoryPage from "./pages/AdminHistoryPage";
import AdminAccountPage from "./pages/AdminAccountPage";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes — anyone can visit */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Buyer routes — must be logged in, wrapped in bottom nav layout */}
            <Route
              element={
                <ProtectedRoute>
                  <BuyerLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/my-tokens" element={<MyTokensPage />} />
              <Route path="/account" element={<AccountPage />} />
            </Route>

            {/* Admin routes — must be logged in + admin doc in Firestore, wrapped in AdminLayout */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<Navigate to="/admin/serve" replace />} />
              <Route path="serve" element={<AdminServePage />} />
              <Route path="menu" element={<AdminMenuPage />} />
              <Route path="history" element={<AdminHistoryPage />} />
              <Route path="account" element={<AdminAccountPage />} />
            </Route>

            {/* Redirect root and unknown URLs to menu */}
            <Route path="*" element={<Navigate to="/menu" replace />} />
          </Routes>
        </BrowserRouter>

        {/* Toast notifications (appears at top-center) */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "12px",
              fontSize: "14px",
              fontFamily: "Inter, sans-serif",
            },
          }}
        />
      </CartProvider>
    </AuthProvider>
  );
}
