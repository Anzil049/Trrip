import { Navigate, Route, Routes } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { AppLayout } from "./components/AppLayout";
import { AuthLayout } from "./components/AuthLayout";
import { useAuth } from "./state/AuthContext";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { DashboardPage } from "./pages/DashboardPage";
import { UploadPage } from "./pages/UploadPage";
import { ItinerariesPage } from "./pages/ItinerariesPage";
import { ItineraryDetailPage } from "./pages/ItineraryDetailPage";
import { SharedItineraryPage } from "./pages/SharedItineraryPage";
import { SettingsPage } from "./pages/SettingsPage";
import { SharedHubPage } from "./pages/SharedHubPage";

import { useEffect } from "react";

const RedirectWithToast = () => {
  useEffect(() => {
    toast.error("Please log in to access this page.");
  }, []);
  return <Navigate to="/login" replace />;
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <p className="container" style={{ paddingTop: 24 }}>
        Loading session...
      </p>
    );
  }
  return user ? children : <RedirectWithToast />;
};

export default function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/upload" element={<Navigate to="/#builder" replace />} />
        <Route path="/itineraries" element={<ItinerariesPage />} />
        <Route path="/itineraries/:id" element={<ItineraryDetailPage />} />
        <Route path="/shared" element={<SharedHubPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="/share/:shareToken" element={<SharedItineraryPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
