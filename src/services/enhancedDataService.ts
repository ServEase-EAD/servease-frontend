/**
 * Enhanced Data Service
 * Handles fetching and enriching appointment data with customer, vehicle, and employee details
 */

import { apiClient, API_ENDPOINTS } from '../config/api.config';

// Enhanced interfaces
export interface VehicleDetails {
  vehicle_id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  vin: string;
  plate_number: string;
  display_name: string;
  age: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerDetails {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  company_name?: string;
  business_type?: string;
  is_verified: boolean;
  total_services: number;
  last_service_date?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export interface AppointmentDetails {
  id: string;
  customer_id: string;
  vehicle_id: string;
  assigned_employee_id?: string;
  appointment_type: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  status: string;
  service_description: string;
  customer_notes: string;
  internal_notes: string;
  estimated_cost?: number;
  created_at: string;
  updated_at: string;
  cancelled_at?: string;
  completed_at?: string;
  // Enriched fields
  customer_name?: string;
  customer_details?: CustomerDetails;
  vehicle_details?: VehicleDetails;
  employee_name?: string;
}

export interface EnhancedTask extends AppointmentDetails {
  // Legacy compatibility
  appointment_type: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  customer_name: string;
  vehicle_details: VehicleDetails;
}

/**
 * Fetch detailed vehicle information by vehicle ID
 */
export const getVehicleDetails = async (vehicleId: string): Promise<VehicleDetails> => {
  try {
    console.log(`🚗 Fetching vehicle details for ID: ${vehicleId}`);
    const response = await apiClient.get(API_ENDPOINTS.VEHICLES.DETAIL(vehicleId));
    
    const vehicle = response.data;
    console.log(`✅ Vehicle details fetched:`, vehicle);
    
    return {
      vehicle_id: vehicle.vehicle_id,
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year || 0,
      color: vehicle.color || '',
      vin: vehicle.vin || '',
      plate_number: vehicle.plate_number || '',
      display_name: vehicle.display_name || `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      age: vehicle.age || 0,
      is_active: vehicle.is_active || true,
      created_at: vehicle.created_at || '',
      updated_at: vehicle.updated_at || ''
    };
  } catch (error) {
    console.error(`❌ Error fetching vehicle details for ${vehicleId}:`, error);
    return {
      vehicle_id: vehicleId,
      make: 'Unknown',
      model: 'Vehicle',
      year: 0,
      color: 'Unknown',
      vin: 'Unknown',
      plate_number: 'Unknown',
      display_name: 'Unknown Vehicle',
      age: 0,
      is_active: true,
      created_at: '',
      updated_at: ''
    };
  }
};

/**
 * Fetch detailed customer information by customer ID
 */
export const getCustomerDetails = async (customerId: string): Promise<CustomerDetails> => {
  try {
    console.log(`👤 Fetching customer details for ID: ${customerId}`);
    const response = await apiClient.get(API_ENDPOINTS.CUSTOMERS.DETAIL(customerId));
    
    const customer = response.data;
    console.log(`✅ Customer details fetched:`, customer);
    
    return {
      id: customer.id,
      user_id: customer.user_id || customer.id,
      email: customer.email || '',
      first_name: customer.first_name || '',
      last_name: customer.last_name || '',
      full_name: customer.full_name || `${customer.first_name} ${customer.last_name}`.trim() || 'Unknown Customer',
      phone_number: customer.phone_number || '',
      street_address: customer.street_address || '',
      city: customer.city || '',
      state: customer.state || '',
      postal_code: customer.postal_code || '',
      country: customer.country || '',
      company_name: customer.company_name || '',
      business_type: customer.business_type || '',
      is_verified: customer.is_verified || false,
      total_services: customer.total_services || 0,
      last_service_date: customer.last_service_date,
      emergency_contact_name: customer.emergency_contact_name,
      emergency_contact_phone: customer.emergency_contact_phone
    };
  } catch (error) {
    console.error(`❌ Error fetching customer details for ${customerId}:`, error);
    return {
      id: customerId,
      user_id: customerId,
      email: '',
      first_name: 'Unknown',
      last_name: 'Customer',
      full_name: 'Unknown Customer',
      phone_number: '',
      street_address: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      is_verified: false,
      total_services: 0
    };
  }
};

/**
 * Fetch enriched appointment/task data with customer, vehicle, and employee details
 * IMPORTANT: The backend appointment serializer now provides customer_name and full vehicle_details objects
 */
export const getEnhancedAppointments = async (): Promise<EnhancedTask[]> => {
  try {
    console.log('� Fetching appointments with enriched data from backend...');
    const appointmentsResponse = await apiClient.get(API_ENDPOINTS.APPOINTMENTS.LIST);
    
    const appointments = Array.isArray(appointmentsResponse.data) 
      ? appointmentsResponse.data 
      : appointmentsResponse.data.results || [];
    
    console.log(`✅ Received ${appointments.length} appointments from backend`);
    
    // Log first appointment to verify backend is providing enriched data
    if (appointments.length > 0) {
      console.log('� First appointment structure (backend enriched):', {
        id: appointments[0].id,
        customer_name: appointments[0].customer_name,
        vehicle_details: appointments[0].vehicle_details,
        employee_name: appointments[0].employee_name,
      });
    }
    
    // Map appointments directly to EnhancedTask format
    // Backend serializer already provides customer_name and vehicle_details
    const enhancedTasks: EnhancedTask[] = appointments.map((appointment: any) => {
      // Use backend-provided vehicle_details or create fallback
      let vehicleDetails = appointment.vehicle_details;
      if (!vehicleDetails || (typeof vehicleDetails === 'string')) {
        // Fallback if vehicle_details is a string or missing
        vehicleDetails = {
          vehicle_id: appointment.vehicle_id,
          make: 'Unknown',
          model: 'Vehicle',
          year: 0,
          color: 'Unknown',
          vin: 'Unknown',
          plate_number: 'Unknown',
          display_name: 'Unknown Vehicle',
          age: 0,
          is_active: true,
          created_at: '',
          updated_at: ''
        };
      }
      
      return {
        // Core appointment data
        id: appointment.id,
        customer_id: appointment.customer_id,
        vehicle_id: appointment.vehicle_id,
        assigned_employee_id: appointment.assigned_employee_id,
        appointment_type: appointment.appointment_type || 'maintenance',
        scheduled_date: appointment.scheduled_date,
        scheduled_time: appointment.scheduled_time,
        duration_minutes: appointment.duration_minutes || 60,
        status: appointment.status || 'pending',
        service_description: appointment.service_description || '',
        customer_notes: appointment.customer_notes || '',
        internal_notes: appointment.internal_notes || '',
        estimated_cost: appointment.estimated_cost,
        created_at: appointment.created_at,
        updated_at: appointment.updated_at,
        cancelled_at: appointment.cancelled_at,
        completed_at: appointment.completed_at,
        
        // Enriched data from backend serializer
        customer_name: appointment.customer_name || 'Unknown Customer',
        customer_details: appointment.customer_details,
        vehicle_details: vehicleDetails,
        employee_name: appointment.employee_name || 'Unassigned'
      };
    });
    
    console.log(`✨ Successfully mapped ${enhancedTasks.length} appointments`);
    return enhancedTasks;
    
  } catch (error) {
    console.error('❌ Error fetching enhanced appointments:', error);
    return [];
  }
};

/**
 * Get a single enhanced appointment by ID
 */
export const getEnhancedAppointment = async (appointmentId: string): Promise<EnhancedTask> => {
  try {
    console.log(`📅 Fetching appointment details for ID: ${appointmentId}`);
    const response = await apiClient.get(API_ENDPOINTS.APPOINTMENTS.DETAIL(appointmentId));
    const appointment = response.data;
    
    // Fetch related details
    const [customer, vehicle] = await Promise.all([
      getCustomerDetails(appointment.customer_id),
      getVehicleDetails(appointment.vehicle_id)
    ]);
    
    return {
      // Core appointment data
      id: appointment.id,
      customer_id: appointment.customer_id,
      vehicle_id: appointment.vehicle_id,
      assigned_employee_id: appointment.assigned_employee_id,
      appointment_type: appointment.appointment_type || 'maintenance',
      scheduled_date: appointment.scheduled_date,
      scheduled_time: appointment.scheduled_time,
      duration_minutes: appointment.duration_minutes || 60,
      status: appointment.status || 'pending',
      service_description: appointment.service_description || '',
      customer_notes: appointment.customer_notes || '',
      internal_notes: appointment.internal_notes || '',
      estimated_cost: appointment.estimated_cost,
      created_at: appointment.created_at,
      updated_at: appointment.updated_at,
      cancelled_at: appointment.cancelled_at,
      completed_at: appointment.completed_at,
      
      // Enriched data
      customer_name: customer.full_name,
      customer_details: customer,
      vehicle_details: vehicle,
      employee_name: appointment.employee_name || 'Unassigned'
    };
  } catch (error) {
    console.error(`❌ Error fetching enhanced appointment ${appointmentId}:`, error);
    throw error;
  }
};

/**
 * Update appointment status
 */
export const updateAppointmentStatus = async (appointmentId: string, newStatus: string): Promise<void> => {
  try {
    console.log(`🔄 Updating appointment ${appointmentId} status to ${newStatus}`);
    await apiClient.patch(API_ENDPOINTS.APPOINTMENTS.DETAIL(appointmentId), {
      status: newStatus.toLowerCase()
    });
    console.log(`✅ Status updated successfully`);
  } catch (error) {
    console.error(`❌ Error updating appointment status:`, error);
    throw error;
  }
};

/**
 * Error handling helper
 */
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data?.detail || 
                   error.response.data?.message || 
                   error.response.data?.error ||
                   `Server error (${status})`;
    return message;
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection.';
  } else {
    // Other error
    return error.message || 'An unexpected error occurred.';
  }
};