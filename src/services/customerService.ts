/**
 * Customer Service
 * Handles customer-related API operations
 */
import axios from "axios";
import apiClient, { handleApiError } from "./apiService";
import { API_ENDPOINTS } from "../config/api.config";
import { getUserProfile } from "./authService";
import type { Customer, CustomerCreateRequest, CustomerUpdateRequest } from "../types";

/**
 * Get current customer profile with auth data merged
 */
export const getCurrentCustomerProfile = async (): Promise<Customer> => {
  try {
    // Fetch customer profile from customer service
    const customerResponse = await apiClient.get<Customer>(API_ENDPOINTS.CUSTOMERS.PROFILE);
    const customerData = customerResponse.data;

    // Fetch auth profile data to get fresh user details
    try {
      const authProfile = await getUserProfile();
      
      // Merge auth data with customer data
      const mergedProfile = {
        ...customerData,
        // Override with fresh auth service data
        email: authProfile.email || customerData.email,
        first_name: authProfile.first_name || customerData.first_name,
        last_name: authProfile.last_name || customerData.last_name,
        phone_number: authProfile.phone_number || customerData.phone_number,
        full_name: authProfile.first_name && authProfile.last_name 
          ? `${authProfile.first_name} ${authProfile.last_name}`.trim()
          : customerData.full_name,
      };

      console.log("Customer profile merged with auth data:", {
        customer_id: customerData.id,
        auth_email: authProfile.email,
        auth_first_name: authProfile.first_name,
        auth_last_name: authProfile.last_name,
        merged_full_name: mergedProfile.full_name
      });

      return mergedProfile;
    } catch (authError) {
      console.warn("Failed to fetch auth profile, using customer data only:", authError);
      return customerData;
    }
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
    // Use logical ID endpoint for consistency - this updates by user_id internally
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
    // Use logical ID endpoint for consistency - this deletes by user_id internally
    const response = await apiClient.delete<{ message: string }>(API_ENDPOINTS.CUSTOMERS.DELETE_PROFILE);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get customer dashboard data using logical ID with auth data merged
 */
export const getCustomerDashboard = async (logicalId: string): Promise<Customer> => {
  try {
    // Use logical ID endpoint - logicalId should be the user_id
    const customerResponse = await apiClient.get<Customer>(API_ENDPOINTS.CUSTOMERS.LOGICAL_DETAIL(logicalId));
    const customerData = customerResponse.data;

    // Fetch auth profile data to get fresh user details
    try {
      const authProfile = await getUserProfile();
      
      // Merge auth data with customer data
      const mergedProfile = {
        ...customerData,
        // Override with fresh auth service data
        email: authProfile.email || customerData.email,
        first_name: authProfile.first_name || customerData.first_name,
        last_name: authProfile.last_name || customerData.last_name,
        phone_number: authProfile.phone_number || customerData.phone_number,
        full_name: authProfile.first_name && authProfile.last_name 
          ? `${authProfile.first_name} ${authProfile.last_name}`.trim()
          : customerData.full_name,
      };

      console.log("Customer dashboard data merged with auth data:", {
        logical_id: logicalId,
        customer_id: customerData.id,
        auth_email: authProfile.email,
        auth_first_name: authProfile.first_name,
        auth_last_name: authProfile.last_name,
        merged_full_name: mergedProfile.full_name
      });

      return mergedProfile;
    } catch (authError) {
      console.warn("Failed to fetch auth profile for dashboard, using customer data only:", authError);
      return customerData;
    }
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Update customer profile by logical ID
 */
export const updateCustomerByLogicalId = async (logicalId: string, data: CustomerUpdateRequest): Promise<Customer> => {
  try {
    const response = await apiClient.patch<Customer>(API_ENDPOINTS.CUSTOMERS.LOGICAL_UPDATE(logicalId), data);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Delete customer profile by logical ID
 */
export const deleteCustomerByLogicalId = async (logicalId: string): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete<{ message: string }>(API_ENDPOINTS.CUSTOMERS.LOGICAL_DELETE(logicalId));
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
    console.log("checkCustomerProfileExists - Making request for userId:", userId);
    console.log("checkCustomerProfileExists - API endpoint:", API_ENDPOINTS.CUSTOMERS.CHECK_PROFILE);
    console.log("checkCustomerProfileExists - Request data:", { user_id: userId });
    
    const response = await apiClient.post<{
      user_id: string;
      profile_exists: boolean;
      customer_id?: string;
    }>(API_ENDPOINTS.CUSTOMERS.CHECK_PROFILE, { user_id: userId });
    
    console.log("checkCustomerProfileExists - Success response:", response.data);
    return response.data;
  } catch (error) {
    console.error("checkCustomerProfileExists - Error:", error);
    if (axios.isAxiosError(error)) {
      console.error("checkCustomerProfileExists - Axios error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        }
      });
    }
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