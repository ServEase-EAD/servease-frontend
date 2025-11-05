/**
 * Vehicle Service
 * Handles vehicle-related API operations
 */
import apiClient, { handleApiError } from "./apiService";
import { API_ENDPOINTS } from "../config/api.config";

/**
 * Vehicle interface based on backend model
 */
export interface Vehicle {
  vehicle_id: string;
  customer_id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  vin: string;
  plate_number: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  display_name: string;
  age?: number;
}

/**
 * Create Vehicle Data interface
 */
export interface CreateVehicleData {
  make: string;
  model: string;
  year: number;
  color: string;
  vin: string;
  plate_number: string;
}

/**
 * Update Vehicle Data interface
 */
export interface UpdateVehicleData {
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  plate_number?: string;
  is_active?: boolean;
}

/**
 * Get all vehicles for the current user
 */
export const getVehicles = async (): Promise<Vehicle[]> => {
  try {
    const response = await apiClient.get<Vehicle[]>(API_ENDPOINTS.VEHICLES.LIST);
    console.log("Vehicles API Response - Full response:", response);
    console.log("Vehicles API Response - Data:", response.data);
    console.log("Vehicles API Response - Data type:", typeof response.data);
    console.log("Vehicles API Response - Is Array:", Array.isArray(response.data));
    
    if (Array.isArray(response.data)) {
      console.log("Vehicles API Response - Array length:", response.data.length);
      if (response.data.length > 0) {
        console.log("Vehicles API Response - First vehicle:", response.data[0]);
      }
      return response.data;
    }
    
    console.warn("Vehicles API Response - Not an array, returning empty array");
    return [];
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Get a specific vehicle by ID
 */
export const getVehicleById = async (vehicleId: string): Promise<Vehicle> => {
  try {
    const response = await apiClient.get<Vehicle>(API_ENDPOINTS.VEHICLES.DETAIL(vehicleId));
    return response.data;
  } catch (error) {
    console.error(`Error fetching vehicle ${vehicleId}:`, error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Create a new vehicle
 */
export const createVehicle = async (data: CreateVehicleData): Promise<Vehicle> => {
  try {
    const response = await apiClient.post<Vehicle>(API_ENDPOINTS.VEHICLES.CREATE, data);
    return response.data;
  } catch (error) {
    console.error("Error creating vehicle:", error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Update an existing vehicle
 */
export const updateVehicle = async (vehicleId: string, data: UpdateVehicleData): Promise<Vehicle> => {
  try {
    const response = await apiClient.patch<Vehicle>(
      API_ENDPOINTS.VEHICLES.UPDATE(vehicleId),
      data
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating vehicle ${vehicleId}:`, error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Delete a vehicle
 */
export const deleteVehicle = async (vehicleId: string): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.VEHICLES.DELETE(vehicleId)
    );
    return response.data;
  } catch (error) {
    console.error(`Error deleting vehicle ${vehicleId}:`, error);
    throw new Error(handleApiError(error));
  }
};
