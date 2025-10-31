/**
 * Customer Service
 * Handles customer-related API operations
 */
import apiClient, { handleApiError } from "./apiService";
import { API_ENDPOINTS } from "../config/api.config";
import type { Customer, CustomerCreateRequest, CustomerUpdateRequest } from "../types";

/**
 * Get current customer profile
 */
export const getCurrentCustomerProfile = async (): Promise<Customer> => {
  try {
    const response = await apiClient.get<Customer>(API_ENDPOINTS.CUSTOMERS.PROFILE);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Create customer profile
 */
export const createCustomerProfile = async (data: CustomerCreateRequest): Promise<Customer> => {
  try {
    const response = await apiClient.post<Customer>(API_ENDPOINTS.CUSTOMERS.CREATE_PROFILE, data);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Update customer profile
 */
export const updateCustomerProfile = async (data: CustomerUpdateRequest): Promise<Customer> => {
  try {
    const response = await apiClient.patch<Customer>(API_ENDPOINTS.CUSTOMERS.UPDATE_PROFILE, data);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Delete customer profile
 */
export const deleteCustomerProfile = async (): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete<{ message: string }>(API_ENDPOINTS.CUSTOMERS.DELETE_PROFILE);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get customer dashboard data
 */
export const getCustomerDashboard = async (customerId: string): Promise<Customer> => {
  try {
    const response = await apiClient.get<Customer>(API_ENDPOINTS.CUSTOMERS.DASHBOARD(customerId));
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get customer by user ID
 */
export const getCustomerByUserId = async (userId: string): Promise<Customer> => {
  try {
    const response = await apiClient.get<Customer>(API_ENDPOINTS.CUSTOMERS.BY_USER_ID, {
      params: { user_id: userId }
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Check if customer profile exists for user
 */
export const checkCustomerProfileExists = async (userId: string): Promise<{
  user_id: string;
  profile_exists: boolean;
  customer_id?: string;
}> => {
  try {
    const response = await apiClient.post<{
      user_id: string;
      profile_exists: boolean;
      customer_id?: string;
    }>(API_ENDPOINTS.CUSTOMERS.CHECK_PROFILE, { user_id: userId });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get customer service health
 */
export const getCustomerServiceHealth = async (): Promise<{
  status: string;
  service: string;
  timestamp: string;
  version: string;
  description: string;
}> => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.CUSTOMERS.HEALTH);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * List customers (for admin/employee views)
 */
export const getCustomers = async (params?: {
  is_verified?: boolean;
  city?: string;
  state?: string;
  search?: string;
  ordering?: string;
}): Promise<Customer[]> => {
  try {
    const response = await apiClient.get<Customer[]>(API_ENDPOINTS.CUSTOMERS.LIST, { params });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get customer by ID
 */
export const getCustomerById = async (customerId: string): Promise<Customer> => {
  try {
    const response = await apiClient.get<Customer>(API_ENDPOINTS.CUSTOMERS.DETAIL(customerId));
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};