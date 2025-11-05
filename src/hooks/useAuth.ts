/**
 * Custom React hooks for authentication
 */
import { useState, useEffect } from "react";
import {
  getUserFromToken,
  getUserRole,
  isAuthenticated,
  hasRole,
  hasAnyRole,
  logout as authLogout,
} from "../services/authService";
import type { UserInfo } from "../services/authService";
import { useNavigate } from "react-router-dom";

/**
 * Hook to get current user information from JWT token
 * @returns User information or null if not authenticated
 */
export const useAuth = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        const userData = getUserFromToken();
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const logout = () => {
    authLogout();
    setUser(null);
    navigate("/login");
  };

  return {
    user,
    isAuthenticated: !!user,
    loading,
    logout,
  };
};

/**
 * Hook to check if user has specific role
 * @param requiredRole - Required role
 * @returns boolean indicating if user has the required role
 */
export const useRole = (requiredRole: "customer" | "employee" | "admin") => {
  const [hasRequiredRole, setHasRequiredRole] = useState(false);

  useEffect(() => {
    setHasRequiredRole(hasRole(requiredRole));
  }, [requiredRole]);

  return hasRequiredRole;
};

/**
 * Hook to check if user has any of the specified roles
 * @param roles - Array of allowed roles
 * @returns boolean indicating if user has any of the roles
 */
export const useAnyRole = (roles: Array<"customer" | "employee" | "admin">) => {
  const [hasAnyRequiredRole, setHasAnyRequiredRole] = useState(false);

  useEffect(() => {
    setHasAnyRequiredRole(hasAnyRole(roles));
  }, [roles]);

  return hasAnyRequiredRole;
};

/**
 * Hook to get user role
 * @returns User role or null if not authenticated
 */
export const useUserRole = () => {
  const [role, setRole] = useState<"customer" | "employee" | "admin" | null>(
    null
  );

  useEffect(() => {
    setRole(getUserRole());
  }, []);

  return role;
};

/**
 * Hook to require authentication - redirects to login if not authenticated
 */
export const useRequireAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);
};

/**
 * Hook to require specific role - redirects if user doesn't have the role
 * @param requiredRole - Required role
 * @param redirectPath - Path to redirect if user doesn't have the role (optional)
 */
export const useRequireRole = (
  requiredRole: "customer" | "employee" | "admin",
  redirectPath?: string
) => {
  const navigate = useNavigate();
  const userRole = getUserRole();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login", { replace: true });
      return;
    }

    if (!hasRole(requiredRole)) {
      if (redirectPath) {
        navigate(redirectPath, { replace: true });
      } else {
        // Default redirect based on user's actual role
        switch (userRole) {
          case "customer":
            navigate("/customer-dashboard", { replace: true });
            break;
          case "employee":
            navigate("/employee-dashboard", { replace: true });
            break;
          case "admin":
            navigate("/admin-dashboard", { replace: true });
            break;
          default:
            navigate("/", { replace: true });
        }
      }
    }
  }, [requiredRole, redirectPath, navigate, userRole]);
};
