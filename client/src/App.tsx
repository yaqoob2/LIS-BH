import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import AppShell from "./layout/AppShell";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

import CasesPage from "./pages/cases/CasesPage";
import CaseDetailPage from "./pages/cases/CaseDetailPage";

import AIPage from "./pages/ai/AIPage";
import LegalResourcesPage from "./pages/legal-resources/LegalResourcesPage";
import UsersPage from "./pages/users/UsersPage";

import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <>
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          duration: 3500,
        }}
      />

      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* AUTHENTICATED */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/cases" element={<CasesPage />} />

            <Route path="/cases/:id" element={<CaseDetailPage />} />

            <Route path="/ai" element={<AIPage />} />

            <Route path="/legal-resources" element={<LegalResourcesPage />} />

            <Route path="/users" element={<UsersPage />} />
          </Route>
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
