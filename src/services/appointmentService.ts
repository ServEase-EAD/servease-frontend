/**
 * Appointment Service
 * Handles appointment-related API operations
 */
import apiClient, { handleApiError } from "./apiService";
import { API_ENDPOINTS } from "../config/api.config";
import type {
  Appointment,
  CreateAppointmentData,
  UpdateAppointmentData,
  RescheduleAppointmentData,
  AssignEmployeeData,
  StatusUpdateData,
  AppointmentStats,
  AppointmentHistory,
  AvailableSlotsResponse,
  TimeSlot,
} from "../types";

/**
 * Get all appointments with optional filters
 */
export const getAppointments = async (params?: {
  status?: string;
  start_date?: string;
  end_date?: string;
  appointment_type?: string;
  customer_id?: string;
  employee_id?: string;
}): Promise<Appointment[]> => {
  try {
    const response = await apiClient.get<Appointment[]>(
      API_ENDPOINTS.APPOINTMENTS.LIST,
      {
        params,
        timeout: 60000, // Increase timeout to 60 seconds
      }
    );
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching appointments:", error);
    // Return empty array on timeout to allow UI to render
    return [];
  }
};

/**
 * Get a specific appointment by ID
 */
export const getAppointmentById = async (
  appointmentId: string
): Promise<Appointment> => {
  try {
    const response = await apiClient.get<Appointment>(
      API_ENDPOINTS.APPOINTMENTS.DETAIL(appointmentId)
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching appointment ${appointmentId}:`, error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Create a new appointment
 */
export const createAppointment = async (
  data: CreateAppointmentData
): Promise<Appointment> => {
  try {
    console.debug("[appointmentService] createAppointment request", data);
    const response = await apiClient.post<Appointment>(
      API_ENDPOINTS.APPOINTMENTS.CREATE,
      data
    );
    console.debug(
      "[appointmentService] createAppointment response",
      response.status,
      response.data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Update an existing appointment
 */
export const updateAppointment = async (
  appointmentId: string,
  data: UpdateAppointmentData
): Promise<Appointment> => {
  try {
    const response = await apiClient.patch<Appointment>(
      API_ENDPOINTS.APPOINTMENTS.UPDATE(appointmentId),
      data
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating appointment ${appointmentId}:`, error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Delete an appointment
 */
export const deleteAppointment = async (
  appointmentId: string
): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.APPOINTMENTS.DELETE(appointmentId)
    );
    return response.data;
  } catch (error) {
    console.error(`Error deleting appointment ${appointmentId}:`, error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Confirm an appointment (Employee/Admin only)
 */
export const confirmAppointment = async (
  appointmentId: string,
  data?: StatusUpdateData
): Promise<{ status: string; message: string; appointment: Appointment }> => {
  try {
    const response = await apiClient.post(
      API_ENDPOINTS.APPOINTMENTS.CONFIRM(appointmentId),
      data || {}
    );
    return response.data;
  } catch (error) {
    console.error(`Error confirming appointment ${appointmentId}:`, error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Start an appointment (Employee/Admin only)
 */
export const startAppointment = async (
  appointmentId: string,
  data?: StatusUpdateData
): Promise<{ status: string; message: string; appointment: Appointment }> => {
  try {
    const response = await apiClient.post(
      API_ENDPOINTS.APPOINTMENTS.START(appointmentId),
      data || {}
    );
    return response.data;
  } catch (error) {
    console.error(`Error starting appointment ${appointmentId}:`, error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Complete an appointment (Employee/Admin only)
 */
export const completeAppointment = async (
  appointmentId: string,
  data?: StatusUpdateData
): Promise<{ status: string; message: string; appointment: Appointment }> => {
  try {
    const response = await apiClient.post(
      API_ENDPOINTS.APPOINTMENTS.COMPLETE(appointmentId),
      data || {}
    );
    return response.data;
  } catch (error) {
    console.error(`Error completing appointment ${appointmentId}:`, error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Cancel an appointment
 */
export const cancelAppointment = async (
  appointmentId: string,
  data?: StatusUpdateData
): Promise<{ status: string; message: string; appointment: Appointment }> => {
  try {
    const response = await apiClient.post(
      API_ENDPOINTS.APPOINTMENTS.CANCEL(appointmentId),
      data || {}
    );
    return response.data;
  } catch (error) {
    console.error(`Error cancelling appointment ${appointmentId}:`, error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Reschedule an appointment
 */
export const rescheduleAppointment = async (
  appointmentId: string,
  data: RescheduleAppointmentData
): Promise<{ status: string; message: string; appointment: Appointment }> => {
  try {
    const response = await apiClient.post(
      API_ENDPOINTS.APPOINTMENTS.RESCHEDULE(appointmentId),
      data
    );
    return response.data;
  } catch (error) {
    console.error(`Error rescheduling appointment ${appointmentId}:`, error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Assign an employee to an appointment (Employee/Admin only)
 */
export const assignEmployee = async (
  appointmentId: string,
  data: AssignEmployeeData
): Promise<{ status: string; message: string; appointment: Appointment }> => {
  try {
    const response = await apiClient.post(
      API_ENDPOINTS.APPOINTMENTS.ASSIGN(appointmentId),
      data
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error assigning employee to appointment ${appointmentId}:`,
      error
    );
    throw new Error(handleApiError(error));
  }
};

/**
 * Get available time slots
 */
export const getAvailableSlots = async (
  startDate: string,
  endDate: string,
  durationMinutes: number = 60
): Promise<AvailableSlotsResponse> => {
  try {
    const response = await apiClient.get<AvailableSlotsResponse>(
      API_ENDPOINTS.APPOINTMENTS.AVAILABLE_SLOTS,
      {
        params: {
          start_date: startDate,
          end_date: endDate,
          duration_minutes: durationMinutes,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching available slots:", error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Get appointment statistics
 */
export const getAppointmentStats = async (): Promise<AppointmentStats> => {
  try {
    const response = await apiClient.get<AppointmentStats>(
      API_ENDPOINTS.APPOINTMENTS.STATS
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching appointment statistics:", error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Get appointment history
 */
export const getAppointmentHistory = async (
  appointmentId: string
): Promise<AppointmentHistory[]> => {
  try {
    const response = await apiClient.get<AppointmentHistory[]>(
      API_ENDPOINTS.APPOINTMENTS.HISTORY(appointmentId)
    );
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(
      `Error fetching appointment history for ${appointmentId}:`,
      error
    );
    throw new Error(handleApiError(error));
  }
};

/**
 * Get appointments for a specific customer
 */
export const getCustomerAppointments = async (
  customerId: string
): Promise<Appointment[]> => {
  try {
    const response = await apiClient.get<Appointment[]>(
      API_ENDPOINTS.APPOINTMENTS.CUSTOMER_APPOINTMENTS,
      {
        params: { customer_id: customerId },
        timeout: 60000, // Increase timeout to 60 seconds for this endpoint
      }
    );
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(
      `Error fetching appointments for customer ${customerId}:`,
      error
    );
    // Return empty array instead of throwing to allow the UI to render
    return [];
  }
};

/**
 * Get employee schedule
 */
export const getEmployeeSchedule = async (
  employeeId: string
): Promise<Appointment[]> => {
  try {
    const response = await apiClient.get<Appointment[]>(
      API_ENDPOINTS.APPOINTMENTS.EMPLOYEE_SCHEDULE,
      {
        params: { employee_id: employeeId },
      }
    );
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(`Error fetching schedule for employee ${employeeId}:`, error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Get vehicle service history
 */
export const getVehicleHistory = async (
  vehicleId: string
): Promise<Appointment[]> => {
  try {
    const response = await apiClient.get<Appointment[]>(
      API_ENDPOINTS.APPOINTMENTS.VEHICLE_HISTORY,
      {
        params: { vehicle_id: vehicleId },
      }
    );
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(`Error fetching history for vehicle ${vehicleId}:`, error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Get all time slots with optional filters
 */
export const getTimeSlots = async (params?: {
  start_date?: string;
  end_date?: string;
}): Promise<TimeSlot[]> => {
  try {
    const response = await apiClient.get<TimeSlot[]>(
      API_ENDPOINTS.TIMESLOTS.LIST,
      {
        params,
      }
    );
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching time slots:", error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Create time slots in bulk (Employee/Admin only)
 */
export const bulkCreateTimeSlots = async (
  startDate: string,
  endDate: string
): Promise<{ message: string; count: number }> => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.TIMESLOTS.BULK_CREATE, {
      start_date: startDate,
      end_date: endDate,
    });
    return response.data;
  } catch (error) {
    console.error("Error bulk creating time slots:", error);
    throw new Error(handleApiError(error));
  }
};
