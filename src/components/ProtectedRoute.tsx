import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "customer" | "employee";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (typeof requiredRole !== "undefined" && userRole !== requiredRole) {
    if (userRole === "customer") {
      return <Navigate to="/customer-dashboard" replace />;
    } else if (userRole === "employee") {
      return <Navigate to="/employee-dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }
  return <>{children}</>;
};

export default ProtectedRoute;
