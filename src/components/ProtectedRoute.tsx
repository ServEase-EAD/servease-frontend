import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated, getUserRole } from "../services/authService";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "customer" | "employee" | "admin";
}

/**
 * ProtectedRoute Component
 * Protects routes by checking JWT authentication and user roles
 * Role is extracted from the JWT token, not from localStorage
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  // Check if user is authenticated by validating JWT token
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Get user role from JWT token
  const userRole = getUserRole();

  // If specific role is required, check if user has that role
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on user's actual role
    switch (userRole) {
      case "customer":
        return <Navigate to="/customer-dashboard" replace />;
      case "employee":
        return <Navigate to="/employee-dashboard" replace />;
      case "admin":
        return <Navigate to="/admin-dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
