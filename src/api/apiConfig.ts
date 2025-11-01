import axios from "axios";

// ✅ Base URL for Nginx API Gateway
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:80';

const api = axios.create({
  baseURL: `${baseURL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔄 Automatically add access token if available
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default api;
