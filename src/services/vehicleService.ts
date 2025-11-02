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
  display_name: string;
  plate_number: string;
  color: string;
  vin: string;
  is_active: boolean;
  created_at: string;
}

/**
 * Create Vehicle Data interface
 */
export interface CreateVehicleData {
  display_name: string;
  plate_number: string;
  color: string;
  vin: string;
}

/**
 * Update Vehicle Data interface
 */
export interface UpdateVehicleData {
  display_name?: string;
  plate_number?: string;
  color?: string;
  vin?: string;
  is_active?: boolean;
}

/**
 * Get all vehicles for the current user
 */
export const getVehicles = async (): Promise<Vehicle[]> => {
  try {
    const response = await apiClient.get<Vehicle[]>(API_ENDPOINTS.VEHICLES.LIST);
    return Array.isArray(response.data) ? response.data : [];
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
