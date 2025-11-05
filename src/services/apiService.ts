/**
 * API Service
 * Centralized API client with axios interceptors for authentication
 */
import axios, { AxiosError } from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import {
  API_BASE_URL,
  API_ENDPOINTS,
  REQUEST_TIMEOUT,
} from "../config/api.config";
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
  isTokenExpired,
} from "./authService";

/**
 * Create axios instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor to add authentication token
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    console.log("API Request interceptor - token exists:", token ? "yes" : "no");
    console.log("API Request interceptor - URL:", config.url);

    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("API Request interceptor - Authorization header set");
    } else {
      console.log("API Request interceptor - No valid token, skipping auth header");
      if (token) {
        console.log("API Request interceptor - Token is expired");
      }
    }

    console.log("API Request interceptor - Final headers:", config.headers);
    return config;
  },
  (error: AxiosError) => {
    console.error("API Request interceptor - Error:", error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle token refresh
 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    console.log("API Response interceptor - Success:", response.status, response.config.url);
    return response;
  },
  async (error: AxiosError) => {
    console.error("API Response interceptor - Error:", error.response?.status, error.config?.url);
    console.error("API Response interceptor - Error details:", error.message);
    
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        // No refresh token available, logout
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Try to refresh the token
        const response = await axios.post(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
          {
            refresh: refreshToken,
          }
        );

        const { access, refresh } = response.data;
        saveTokens(access, refresh);

        // Update authorization header
        originalRequest.headers.Authorization = `Bearer ${access}`;

        // Process queued requests
        processQueue(null, access);

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        processQueue(refreshError as AxiosError, null);
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

/**
 * Helper function to handle API errors
 */
export const handleApiError = (error: unknown): string => {
  console.error("API Error:", error);
  
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with error
      const data = error.response.data;
      console.error("Server error response:", error.response.status, data);

      if (typeof data === "string") {
        return data;
      }

      if (data.error) {
        return data.error;
      }

      if (data.detail) {
        return data.detail;
      }

      if (data.message) {
        return data.message;
      }

      // Handle validation errors
      if (typeof data === "object") {
        const messages = Object.values(data).flat();
        if (messages.length > 0) {
          return messages[0] as string;
        }
      }

      return `Error: ${error.response.status} ${error.response.statusText}`;
    } else if (error.request) {
      // Request made but no response
      console.error("No response received:", error.request);
      console.error("Request config:", error.config);
      return "No response from server. Please check your connection and ensure the backend services are running.";
    } else {
      // Error setting up request
      console.error("Request setup error:", error.message);
      return error.message;
    }
  }

  if (error instanceof Error) {
    console.error("Generic error:", error.message);
    return error.message;
  }

  console.error("Unknown error:", error);
  return "An unexpected error occurred";
};
