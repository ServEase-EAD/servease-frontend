import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import CustomerDashboard from "./pages/CustomerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EnhancedAdminDashboard from "./components/admin/EnhancedAdminDashboard";
import "./App.css";

// Temporary Home component until you create a proper one
import React from "react";

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
  return (
    <Router>
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
    </Router>
  );
}

export default App;
