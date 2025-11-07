import React, { useMemo, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { ChatbotButton } from "./components/chatbot";
import LoadingSpinner from "./components/LoadingSpinner";
import "./App.css";

// Lazy load dashboard components for better performance
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard"));
const EmployeeDashboard = lazy(() => import("./pages/EmployeeDashboard"));
const EnhancedAdminDashboard = lazy(
  () => import("./components/admin/EnhancedAdminDashboard")
);

// Temporary Home component until you create a proper one
const HomePage: React.FC = () => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (token && userRole === "customer") {
    return <CustomerDashboard />;
  }
  if (token && userRole === "employee") {
    return <EmployeeDashboard />;
  }
  if (token && userRole === "admin") {
    return <EnhancedAdminDashboard />;
  }
  // Redirect to login page for unauthenticated users
  return <Navigate to="/login" replace />;
};

function App() {
  // Check if user is authenticated - memoize to prevent unnecessary re-renders
  const isAuthenticated = useMemo(() => !!localStorage.getItem("token"), []);

  return (
    <Router>
      <Suspense
        fallback={<LoadingSpinner message="Loading..." minHeight="100vh" />}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route
            path="/customer-dashboard"
            element={
              <ProtectedRoute requiredRole="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee-dashboard"
            element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <EnhancedAdminDashboard />
              </ProtectedRoute>
            }
          />
          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Chatbot Button - Available for all authenticated users */}
        {isAuthenticated && <ChatbotButton />}
      </Suspense>
    </Router>
  );
}

export default App;
