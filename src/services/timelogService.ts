/**
 * TimeLog Service
 * Handles all API calls related to time logs and shifts
 */

import axios from "axios";
import { API_ENDPOINTS } from "../config/api.config";
import type {
  TimeLog,
  CreateTimeLogRequest,
  UpdateTimeLogRequest,
  TimeLogStats,
  EmployeeLogsResponse,
  DailyTotalsResponse,
  TimeFilterOption,
} from "../types";

// Create axios instance with base URL and auth
const createAuthenticatedAxios = () => {
  const token = localStorage.getItem("access_token");
  return axios.create({
    baseURL: "http://localhost", // Through Nginx
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
};

/**
 * TimeLog API Service
 * All endpoints use JWT token for employee identification
 */
export const timelogService = {
  /**
   * Get all time logs for logged-in employee
   */
  getAllTimeLogs: async (): Promise<TimeLog[]> => {
    const api = createAuthenticatedAxios();
    const response = await api.get(API_ENDPOINTS.TIMELOGS.LIST);
    return response.data;
  },

  /**
   * Get a specific time log by ID
   */
  getTimeLog: async (logId: string): Promise<TimeLog> => {
    const api = createAuthenticatedAxios();
    const response = await api.get(API_ENDPOINTS.TIMELOGS.DETAIL(logId));
    return response.data;
  },

  /**
   * Get time logs for logged-in employee with filtering
   */
  getEmployeeLogs: async (
    filter: TimeFilterOption = "all_time"
  ): Promise<EmployeeLogsResponse> => {
    const api = createAuthenticatedAxios();
    const response = await api.get(API_ENDPOINTS.TIMELOGS.EMPLOYEE_LOGS, {
      params: {
        filter: filter,
      },
    });
    return response.data;
  },

  /**
   * Get statistics for logged-in employee time logs
   */
  getTimeLogStats: async (
    filter: TimeFilterOption = "all_time"
  ): Promise<TimeLogStats> => {
    const api = createAuthenticatedAxios();
    const response = await api.get(API_ENDPOINTS.TIMELOGS.STATS, {
      params: {
        filter: filter,
      },
    });
    return response.data;
  },

  /**
   * Get daily totals for logged-in employee
   */
  getDailyTotals: async (
    startDate?: string,
    endDate?: string
  ): Promise<DailyTotalsResponse> => {
    const api = createAuthenticatedAxios();
    const response = await api.get(API_ENDPOINTS.TIMELOGS.DAILY_TOTALS, {
      params: {
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate }),
      },
    });
    return response.data;
  },

  /**
   * Create a new time log
   */
  createTimeLog: async (data: CreateTimeLogRequest): Promise<TimeLog> => {
    const api = createAuthenticatedAxios();
    const response = await api.post(API_ENDPOINTS.TIMELOGS.CREATE, data);
    return response.data;
  },

  /**
   * Update an existing time log
   */
  updateTimeLog: async (
    logId: string,
    data: UpdateTimeLogRequest
  ): Promise<TimeLog> => {
    const api = createAuthenticatedAxios();
    const response = await api.patch(
      API_ENDPOINTS.TIMELOGS.UPDATE(logId),
      data
    );
    return response.data;
  },

  /**
   * Delete a time log
   */
  deleteTimeLog: async (logId: string): Promise<void> => {
    const api = createAuthenticatedAxios();
    await api.delete(API_ENDPOINTS.TIMELOGS.DELETE(logId));
  },

  /**
   * Start or resume a time log
   */
  startTimeLog: async (logId: string): Promise<TimeLog> => {
    const api = createAuthenticatedAxios();
    const response = await api.post(API_ENDPOINTS.TIMELOGS.START(logId));
    return response.data;
  },

  /**
   * Pause a time log
   */
  pauseTimeLog: async (logId: string): Promise<TimeLog> => {
    const api = createAuthenticatedAxios();
    const response = await api.post(API_ENDPOINTS.TIMELOGS.PAUSE(logId));
    return response.data;
  },

  /**
   * Complete a time log
   */
  completeTimeLog: async (logId: string): Promise<TimeLog> => {
    const api = createAuthenticatedAxios();
    const response = await api.post(API_ENDPOINTS.TIMELOGS.COMPLETE(logId));
    return response.data;
  },
};

/**
 * Helper functions for time formatting
 */
export const timeLogHelpers = {
  /**
   * Format seconds to HH:MM:SS
   */
  formatDuration: (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  },

  /**
   * Parse duration string (e.g., "2.5h") to seconds
   */
  parseDurationToSeconds: (duration: string): number => {
    const hours = parseFloat(duration.replace("h", ""));
    return Math.round(hours * 3600);
  },

  /**
   * Format ISO date to readable format
   */
  formatDate: (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },

  /**
   * Get current ISO timestamp
   */
  getCurrentTimestamp: (): string => {
    return new Date().toISOString();
  },

  /**
   * Map frontend filter to backend filter
   */
  mapFilterToBackend: (filter: string): TimeFilterOption => {
    const filterMap: { [key: string]: TimeFilterOption } = {
      "All Time": "all_time",
      Today: "today",
      "This Week": "this_week",
      "This Month": "this_month",
      "Last Month": "last_month",
    };
    return filterMap[filter] || "all_time";
  },

  /**
   * Format date to YYYY-MM-DD for API
   */
  formatDateForAPI: (date: Date): string => {
    return date.toISOString().split('T')[0];
  },

  /**
   * Get date range for filter
   */
  getDateRangeForFilter: (filter: TimeFilterOption): { startDate?: string; endDate?: string } => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    switch (filter) {
      case 'today':
        return { startDate: formatDate(today), endDate: formatDate(today) };
      case 'this_week': {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return { startDate: formatDate(startOfWeek), endDate: formatDate(today) };
      }
      case 'this_month': {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return { startDate: formatDate(startOfMonth), endDate: formatDate(today) };
      }
      case 'last_month': {
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        return { startDate: formatDate(startOfLastMonth), endDate: formatDate(endOfLastMonth) };
      }
      default:
        return {};
    }
  },
};

export default timelogService;
