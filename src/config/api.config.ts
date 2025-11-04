/**
 * API Configuration
 * Centralized API configuration using Nginx as reverse proxy
 */
import axios from "axios";

// API Base URL - uses Nginx reverse proxy
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:80";

// Token storage keys
export const TOKEN_STORAGE_KEY = "access_token";
export const REFRESH_TOKEN_STORAGE_KEY = "refresh_token";

// Request timeout
export const REQUEST_TIMEOUT = 30000; // 30 seconds

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: "/api/v1/auth/login/",
    REGISTER: "/api/v1/auth/register/",
    LOGOUT: "/api/v1/auth/logout/",
    REFRESH: "/api/v1/auth/token/refresh/",
    PROFILE: "/api/v1/auth/profile/",
    UPDATE_PROFILE: "/api/v1/auth/profile/update/",
  },

  // Customer endpoints
  CUSTOMERS: {
    LIST: "/api/v1/customers/",
    DETAIL: (id: string) => `/api/v1/customers/${id}/`,
    // New logical ID endpoints (use user_id from auth service)
    LOGICAL_DETAIL: (userId: string) => `/api/v1/customers/logical/${userId}/`,
    LOGICAL_UPDATE: (userId: string) => `/api/v1/customers/logical/${userId}/`,
    LOGICAL_DELETE: (userId: string) => `/api/v1/customers/logical/${userId}/`,
    // Legacy profile endpoints
    PROFILE: "/api/v1/customers/profile/",
    CREATE_PROFILE: "/api/v1/customers/profile/create/",
    UPDATE_PROFILE: "/api/v1/customers/profile/update/",
    DELETE_PROFILE: "/api/v1/customers/profile/delete/",
    DASHBOARD: (id: string) => `/api/v1/customers/${id}/dashboard/`,
    BY_USER_ID: "/api/v1/customers/by_user_id/",
    CHECK_PROFILE: "/api/v1/customers/check_profile_exists/",
    HEALTH: "/api/v1/customers/health/",
  },

  // Employee endpoints
  EMPLOYEES: {
    LIST: "/api/v1/employees/",
    DETAIL: (id: string) => `/api/v1/employees/${id}/`,
  },

  // Vehicle endpoints
  VEHICLES: {
    LIST: "/api/v1/vehicles/",
    DETAIL: (id: string) => `/api/v1/vehicles/${id}/`,
    CREATE: "/api/v1/vehicles/",
    UPDATE: (id: string) => `/api/v1/vehicles/${id}/`,
    DELETE: (id: string) => `/api/v1/vehicles/${id}/`,
  },

  // Project endpoints (Modification Requests)
  PROJECTS: {
    LIST: "/api/v1/projects/",
    DETAIL: (id: string) => `/api/v1/projects/${id}/`,
    CREATE: "/api/v1/projects/",
    UPDATE: (id: string) => `/api/v1/projects/${id}/`,
    DELETE: (id: string) => `/api/v1/projects/${id}/`,
  },

  // Appointment endpoints
  APPOINTMENTS: {
    LIST: "/api/v1/appointments/",
    DETAIL: (id: string) => `/api/v1/appointments/${id}/`,
  },

  // Notification endpoints
  NOTIFICATIONS: {
    LIST: "/api/v1/notifications/",
    DETAIL: (id: string) => `/api/v1/notifications/${id}/`,
  },

  // Chatbot endpoints
  CHATBOT: {
    SEND_MESSAGE: "/api/v1/chatbot/message/",
  },

  // Admin endpoints
  ADMIN: {
    USERS: "/api/v1/admin/users/",
    USER_DETAIL: (id: string) => `/api/v1/admin/users/${id}/`,
    CREATE_USER: "/api/v1/admin/users/create/",
    UPDATE_USER: (id: string) => `/api/v1/admin/users/${id}/update/`,
    DELETE_USER: (id: string) => `/api/v1/admin/users/${id}/delete/`,
    CHANGE_ROLE: (id: string) => `/api/v1/admin/users/${id}/change-role/`,
    TOGGLE_STATUS: (id: string) => `/api/v1/admin/users/${id}/toggle-status/`,
    STATISTICS: "/api/v1/admin/statistics/",
    HEALTH: "/api/v1/admin/health/",
  },
};
