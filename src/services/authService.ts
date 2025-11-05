/**
 * Authentication Service
 * Handles user authentication, token management, and user role extraction
 */
import { jwtDecode } from "jwt-decode";
import {
  TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
} from "../config/api.config";

// Types
export interface JWTPayload {
  user_id: string;
  email: string;
  user_role: "customer" | "employee" | "admin";
  first_name: string;
  last_name: string;
  exp: number;
  iat: number;
  jti: string;
  token_type: string;
}

export interface UserInfo {
  id: string;
  email: string;
  role: "customer" | "employee" | "admin";
  firstName: string;
  lastName: string;
  fullName: string;
}

/**
 * Save authentication tokens to localStorage
 */
export const saveTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
};

/**
 * Get access token from localStorage
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
};

/**
 * Remove all tokens from localStorage
 */
export const clearTokens = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  // Remove legacy storage items if they exist
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
};

/**
 * Decode JWT token and extract payload
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwtDecode<JWTPayload>(token);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return true;

  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

/**
 * Get user information from token
 */
export const getUserFromToken = (token?: string): UserInfo | null => {
  const accessToken = token || getAccessToken();
  console.log("getUserFromToken - accessToken:", accessToken ? "exists" : "null");
  
  if (!accessToken) {
    console.log("No access token found");
    return null;
  }

  const decoded = decodeToken(accessToken);
  console.log("getUserFromToken - decoded:", decoded ? "success" : "failed");
  
  if (!decoded) {
    console.log("Failed to decode token");
    return null;
  }

  const user = {
    id: decoded.user_id,
    email: decoded.email,
    role: decoded.user_role,
    firstName: decoded.first_name,
    lastName: decoded.last_name,
    fullName: `${decoded.first_name} ${decoded.last_name}`,
  };
  
  console.log("getUserFromToken - user:", user);
  return user;
};

/**
 * Get user role from token
 */
export const getUserRole = (): "customer" | "employee" | "admin" | null => {
  const user = getUserFromToken();
  return user ? user.role : null;
};

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  if (!token) return false;

  return !isTokenExpired(token);
};

/**
 * Check if user has specific role
 */
export const hasRole = (
  requiredRole: "customer" | "employee" | "admin"
): boolean => {
  const userRole = getUserRole();
  return userRole === requiredRole;
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (
  roles: Array<"customer" | "employee" | "admin">
): boolean => {
  const userRole = getUserRole();
  return userRole ? roles.includes(userRole) : false;
};

/**
 * Get user profile from auth service
 */
export const getUserProfile = async (): Promise<any> => {
  const API_BASE_URL = "http://localhost:80"; // Using nginx gateway
  const token = getAccessToken();
  
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/profile/`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Auth profile data fetched:", data);
    return data;
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    throw error;
  }
};

/**
 * Logout user by clearing tokens
 */
export const logout = (): void => {
  clearTokens();
};
