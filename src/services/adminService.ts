/**
 * Admin Service
 * Handles all admin-related API calls for user management
 */
import { apiClient } from "../config/api.config";

// Types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_role: "customer" | "employee" | "admin";
  phone_number?: string;
  is_active: boolean;
  created_at: string;
}

export interface UserStats {
  total_users: number;
  total_customers: number;
  total_employees: number;
  total_admins: number;
  active_users: number;
  inactive_users: number;
}

export interface CreateUserData {
  email: string;
  first_name: string;
  last_name: string;
  password1: string;
  password2: string;
  user_role: "customer" | "employee" | "admin";
  phone_number?: string;
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  is_active?: boolean;
}

export interface ChangeRoleData {
  user_role: "customer" | "employee" | "admin";
}

/**
 * Get all users with optional role filtering
 */
export const getAllUsers = async (
  role?: "customer" | "employee" | "admin"
): Promise<User[]> => {
  const params = role ? { role } : {};
  const response = await apiClient.get("/api/v1/admin/users/", { params });
  return response.data;
};

/**
 * Get specific user details
 */
export const getUserById = async (userId: string): Promise<User> => {
  const response = await apiClient.get(`/api/v1/admin/users/${userId}/`);
  return response.data;
};

/**
 * Create a new user
 */
export const createUser = async (userData: CreateUserData): Promise<User> => {
  const response = await apiClient.post(
    "/api/v1/admin/users/create/",
    userData
  );
  return response.data;
};

/**
 * Update user information
 */
export const updateUser = async (
  userId: string,
  userData: UpdateUserData
): Promise<User> => {
  const response = await apiClient.patch(
    `/api/v1/admin/users/${userId}/update/`,
    userData
  );
  return response.data;
};

/**
 * Change user role
 */
export const changeUserRole = async (
  userId: string,
  roleData: ChangeRoleData
): Promise<{ message: string; user: User }> => {
  const response = await apiClient.patch(
    `/api/v1/admin/users/${userId}/change-role/`,
    roleData
  );
  return response.data;
};

/**
 * Delete a user
 */
export const deleteUser = async (userId: string): Promise<void> => {
  await apiClient.delete(`/api/v1/admin/users/${userId}/delete/`);
};

/**
 * Toggle user active/inactive status
 */
export const toggleUserStatus = async (
  userId: string
): Promise<{ message: string; is_active: boolean }> => {
  const response = await apiClient.post(
    `/api/v1/admin/users/${userId}/toggle-status/`
  );
  return response.data;
};

/**
 * Get user statistics
 */
export const getUserStatistics = async (): Promise<UserStats> => {
  const response = await apiClient.get("/api/v1/admin/statistics/");
  return response.data;
};

/**
 * Health check for admin service
 */
export const healthCheck = async (): Promise<{
  status: string;
  service: string;
}> => {
  const response = await apiClient.get("/api/v1/admin/health/");
  return response.data;
};
