/**
 * API Configuration
 * Centralized API configuration using Nginx as reverse proxy
 */
import axios from "axios";

// Token storage keys
export const TOKEN_STORAGE_KEY = "access_token";
export const REFRESH_TOKEN_STORAGE_KEY = "refresh_token";

// Request timeout
export const REQUEST_TIMEOUT = 10000; // 10 seconds - reduced from 30 for faster failures

// Specific timeout for endpoints that may take longer
export const LONG_REQUEST_TIMEOUT = 30000; // 30 seconds for data-heavy endpoints

// 🌐 Base URL for Nginx API Gateway
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:80";

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for CORS
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
    PROFILE: "/api/v1/employees/profile/",
    UPDATE_PROFILE: "/api/v1/employees/profile/update/",
    CHANGE_PASSWORD: "/api/v1/employees/profile/password/",
    TASKS: {
      LIST: "/api/v1/employees/assigned-tasks/",
      DETAIL: (id: string) => `/api/v1/employees/assigned-tasks/${id}/`,
      UPDATE_STATUS: (id: string) =>
        `/api/v1/employees/assigned-tasks/${id}/status/`,
    },
    TIME_LOGS: {
      LIST: "/api/v1/employees/time-logs/",
      CREATE: "/api/v1/employees/time-logs/create/",
      UPDATE: (id: string) => `/api/v1/employees/time-logs/${id}/`,
    },
    SERVICE_REQUESTS: {
      LIST: "/api/v1/employees/service-requests/",
      DETAIL: (id: string) => `/api/v1/employees/service-requests/${id}/`,
      ACCEPT: (id: string) =>
        `/api/v1/employees/service-requests/${id}/accept/`,
      REJECT: (id: string) =>
        `/api/v1/employees/service-requests/${id}/reject/`,
    },
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
    COMPLETE: (logId: string) =>
      `/api/v1/employees/timelogs/${logId}/complete/`,

    // Employee logs and stats
    EMPLOYEE_LOGS: "/api/v1/employees/timelogs/logs/",
    STATS: "/api/v1/employees/timelogs/stats/",
    DAILY_TOTALS: "/api/v1/employees/timelogs/daily-totals/",
    FIX_DURATIONS: "/api/v1/employees/timelogs/fix-durations/",
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
    CREATE: "/api/v1/appointments/",
    UPDATE: (id: string) => `/api/v1/appointments/${id}/`,
    DELETE: (id: string) => `/api/v1/appointments/${id}/`,
    // Actions
    CONFIRM: (id: string) => `/api/v1/appointments/${id}/confirm/`,
    START: (id: string) => `/api/v1/appointments/${id}/start/`,
    COMPLETE: (id: string) => `/api/v1/appointments/${id}/complete/`,
    CANCEL: (id: string) => `/api/v1/appointments/${id}/cancel/`,
    RESCHEDULE: (id: string) => `/api/v1/appointments/${id}/reschedule/`,
    ASSIGN: (id: string) => `/api/v1/appointments/${id}/assign/`,
    // Queries
    AVAILABLE_SLOTS: "/api/v1/appointments/available_slots/",
    STATS: "/api/v1/appointments/stats/",
    HISTORY: (id: string) => `/api/v1/appointments/${id}/history/`,
    CUSTOMER_APPOINTMENTS: "/api/v1/appointments/customer_appointments/",
    EMPLOYEE_SCHEDULE: "/api/v1/appointments/employee_schedule/",
    VEHICLE_HISTORY: "/api/v1/appointments/vehicle_history/",
  },

  // TimeSlot endpoints
  TIMESLOTS: {
    LIST: "/api/v1/appointments/time-slots/",
    DETAIL: (id: string) => `/api/v1/appointments/time-slots/${id}/`,
    CREATE: "/api/v1/appointments/time-slots/",
    UPDATE: (id: string) => `/api/v1/appointments/time-slots/${id}/`,
    DELETE: (id: string) => `/api/v1/appointments/time-slots/${id}/`,
    BULK_CREATE: "/api/v1/appointments/time-slots/bulk_create/",
  },

  // Notification endpoints
  NOTIFICATIONS: {
    LIST: "/api/v1/notifications/",
    DETAIL: (id: string) => `/api/v1/notifications/${id}/`,
  },

  // Chatbot endpoints
  CHATBOT: {
    CHAT: "/api/v1/chatbot/chat/",
    SESSIONS: "/api/v1/chatbot/sessions/",
    SESSION_DETAIL: (sessionId: string) =>
      `/api/v1/chatbot/session/${sessionId}/`,
    DELETE_SESSION: (sessionId: string) =>
      `/api/v1/chatbot/session/${sessionId}/delete/`,
    CLEAR_SESSION: (sessionId: string) =>
      `/api/v1/chatbot/session/${sessionId}/clear/`,
  },

  // Admin endpoints
  ADMIN: {
    // Health & Stats
    HEALTH: "/api/v1/admin/health/",
    STATISTICS: "/api/v1/admin/statistics/",
    DASHBOARD_STATS: "/api/v1/admin/dashboard/stats/",

    // User Management
    USERS: "/api/v1/admin/users/",
    USER_DETAIL: (id: string) => `/api/v1/admin/users/${id}/`,
    CREATE_USER: "/api/v1/admin/users/create/",
    UPDATE_USER: (id: string) => `/api/v1/admin/users/${id}/update/`,
    DELETE_USER: (id: string) => `/api/v1/admin/users/${id}/delete/`,
    CHANGE_ROLE: (id: string) => `/api/v1/admin/users/${id}/change-role/`,
    TOGGLE_STATUS: (id: string) => `/api/v1/admin/users/${id}/toggle-status/`,

    // Appointment Management
    APPOINTMENTS: "/api/v1/admin/appointments/",
    PENDING_APPOINTMENTS: "/api/v1/admin/appointments/pending/",
    APPOINTMENT_DETAIL: (id: string) => `/api/v1/admin/appointments/${id}/`,
    APPROVE_APPOINTMENT: (id: string) =>
      `/api/v1/admin/appointments/${id}/approve/`,
    REJECT_APPOINTMENT: (id: string) =>
      `/api/v1/admin/appointments/${id}/reject/`,
    ASSIGN_APPOINTMENT: (id: string) =>
      `/api/v1/admin/appointments/${id}/assign/`,
    RESCHEDULE_APPOINTMENT: (id: string) =>
      `/api/v1/admin/appointments/${id}/reschedule/`,
    APPOINTMENT_TASKS: (id: string) =>
      `/api/v1/admin/appointments/${id}/tasks/`,
    CREATE_APPOINTMENT_TASK: (id: string) =>
      `/api/v1/admin/appointments/${id}/tasks/create/`,
    APPOINTMENT_STATISTICS: "/api/v1/admin/appointments/statistics/",

    // Project Management
    PROJECTS: "/api/v1/admin/projects/",
    PENDING_PROJECTS: "/api/v1/admin/projects/pending/",
    PROJECT_PROGRESS: "/api/v1/admin/projects/progress/",
    PROJECT_DETAIL: (id: string) => `/api/v1/admin/projects/${id}/`,
    APPROVE_PROJECT: (id: string) => `/api/v1/admin/projects/${id}/approve/`,
    REJECT_PROJECT: (id: string) => `/api/v1/admin/projects/${id}/reject/`,
    ASSIGN_PROJECT: (id: string) =>
      `/api/v1/admin/projects/${id}/assign-employee/`,
    PROJECT_TASKS: (id: string) => `/api/v1/admin/projects/${id}/tasks/`,

    // Task Management
    TASKS: "/api/v1/admin/tasks/",
    CREATE_TASK: "/api/v1/admin/tasks/create/",
    ASSIGN_TASK: "/api/v1/admin/tasks/assign/",
    UNASSIGN_TASK: "/api/v1/admin/tasks/unassign/",
    TASK_DETAIL: (id: string) => `/api/v1/admin/tasks/${id}/`,
    UPDATE_TASK: (id: string) => `/api/v1/admin/tasks/${id}/update/`,
    DELETE_TASK: (id: string) => `/api/v1/admin/tasks/${id}/delete/`,

    // Vehicle Management
    VEHICLES: "/api/v1/admin/vehicles/",
    VEHICLE_DETAIL: (id: string) => `/api/v1/admin/vehicles/${id}/`,
    VEHICLES_BY_EMPLOYEE: (id: string) =>
      `/api/v1/admin/vehicles/employee/${id}/`,
    VEHICLES_BY_SERVICE_TYPE: "/api/v1/admin/vehicles/by-service-type/",

    // Employee Workload
    EMPLOYEES_WORKLOAD: "/api/v1/admin/employees/workload/",
    EMPLOYEE_WORKLOAD: (id: string) =>
      `/api/v1/admin/employees/${id}/workload/`,
  },
};

// Export default apiClient for backward compatibility
export default apiClient;
