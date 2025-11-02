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
  },

  // Employee endpoints
  EMPLOYEES: {
    LIST: "/api/v1/employees/",
    DETAIL: (id: string) => `/api/v1/employees/${id}/`,
    TASKS: {
      LIST: "/api/v1/employees/tasks/",
      DETAIL: (id: string) => `/api/v1/employees/tasks/${id}/`,
      UPDATE_STATUS: (id: string) => `/api/v1/employees/tasks/${id}/status/`,
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