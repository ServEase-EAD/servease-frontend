import axios from "axios";

// Constants
export const REQUEST_TIMEOUT = 30000; // 30 seconds
export const TOKEN_STORAGE_KEY = "accessToken";
export const REFRESH_TOKEN_STORAGE_KEY = "refreshToken";

// 🌐 Base URL for Nginx API Gateway
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:80";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for CORS
});

// 🔄 Automatically add access token if available
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

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
    PROFILE: "/api/v1/employees/profile/",
    UPDATE_PROFILE: "/api/v1/employees/profile/update/",
    CHANGE_PASSWORD: "/api/v1/employees/profile/password/",
    TASKS: {
      LIST: "/api/v1/employees/assigned-tasks/",
      DETAIL: (id: string) => `/api/v1/employees/assigned-tasks/${id}/`,
      UPDATE_STATUS: (id: string) => `/api/v1/employees/assigned-tasks/${id}/status/`,
    },
    TIME_LOGS: {
      LIST: "/api/v1/employees/time-logs/",
      CREATE: "/api/v1/employees/time-logs/create/",
      UPDATE: (id: string) => `/api/v1/employees/time-logs/${id}/`,
    },
    SERVICE_REQUESTS: {
      LIST: "/api/v1/employees/service-requests/",
      DETAIL: (id: string) => `/api/v1/employees/service-requests/${id}/`,
      ACCEPT: (id: string) => `/api/v1/employees/service-requests/${id}/accept/`,
      REJECT: (id: string) => `/api/v1/employees/service-requests/${id}/reject/`,
    }
  },

  // TimeLog endpoints - Uses JWT token for employee identification
  TIMELOGS: {
    // Employee-specific endpoints (employee_id from JWT token)
    LIST: "/api/v1/employees/timelogs/",
    DETAIL: (logId: string) => `/api/v1/employees/timelogs/${logId}/`,
    CREATE: "/api/v1/employees/timelogs/",
    UPDATE: (logId: string) => `/api/v1/employees/timelogs/${logId}/`,
    DELETE: (logId: string) => `/api/v1/employees/timelogs/${logId}/`,
    
    // Actions on time logs
    START: (logId: string) => `/api/v1/employees/timelogs/${logId}/start/`,
    PAUSE: (logId: string) => `/api/v1/employees/timelogs/${logId}/pause/`,
    COMPLETE: (logId: string) => `/api/v1/employees/timelogs/${logId}/complete/`,
    
    // Employee logs and stats
    EMPLOYEE_LOGS: "/api/v1/employees/timelogs/logs/",
    STATS: "/api/v1/employees/timelogs/stats/",
    DAILY_TOTALS: "/api/v1/employees/timelogs/daily-totals/",
  },

  // Vehicle endpoints
  VEHICLES: {
    LIST: "/api/v1/vehicles/",
    DETAIL: (id: string) => `/api/v1/vehicles/${id}/`,
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

export default api;