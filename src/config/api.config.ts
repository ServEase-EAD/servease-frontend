/**
 * API Configuration
 * Centralized API configuration using Nginx as reverse proxy
 */

// API Base URL - uses Nginx reverse proxy
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:80";

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
  },

  // Project endpoints
  PROJECTS: {
    LIST: "/api/v1/projects/",
    DETAIL: (id: string) => `/api/v1/projects/${id}/`,
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
};

// Request timeout
export const REQUEST_TIMEOUT = 30000; // 30 seconds

// Token storage keys
export const TOKEN_STORAGE_KEY = "access_token";
export const REFRESH_TOKEN_STORAGE_KEY = "refresh_token";
