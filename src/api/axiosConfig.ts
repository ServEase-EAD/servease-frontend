import axios from "axios";

export const BASE_URL = "http://localhost/api/v1"; // 🔹 through Nginx Gateway

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
