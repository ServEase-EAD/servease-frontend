/**
 * Type definitions for the ServEase application
 */

// Vehicle details interface (used by enriched appointment data)
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

// User related types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  userRole: "customer" | "employee" | "admin";
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Auth related types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password1: string;
  password2: string;
  phone_number: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_role: "customer" | "employee" | "admin";
  phone_number: string;
  created_at: string;
  is_active: boolean;
  tokens: AuthTokens;
}

export type RegisterResponse = LoginResponse;

// API Error types
export interface ApiError {
  error?: string;
  detail?: string;
  message?: string;
  [key: string]: string | string[] | undefined;
}

// Customer related types
export interface Customer {
  id: string; // Customer service internal ID (should be same as user_id)
  user_id: string; // Primary ID from authentication service (the real unique identifier)
  // User data from auth service
  email?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  full_name?: string;
  // Address fields
  street_address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  full_address?: string;
  // Business fields
  company_name?: string;
  business_type?: string;
  tax_id?: string;
  is_business_customer?: boolean;
  // Emergency contact
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  // Status & history
  is_verified: boolean;
  customer_since: string;
  last_service_date?: string;
  total_services: number;
  // Preferences
  preferred_contact_method: "email" | "phone" | "sms";
  notification_preferences: Record<string, unknown>;
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CustomerCreateRequest {
  street_address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  company_name?: string;
  business_type?: string;
  tax_id?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  preferred_contact_method?: "email" | "phone" | "sms";
  notification_preferences?: Record<string, unknown>;
}

export interface CustomerUpdateRequest {
  street_address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  company_name?: string;
  business_type?: string;
  tax_id?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  preferred_contact_method?: "email" | "phone" | "sms";
  notification_preferences?: Record<string, unknown>;
}

// Employee related types
export interface Employee {
  id: string;
  userId: string;
  department?: string;
  position?: string;
  // Add other employee fields
}

// Vehicle related types
export interface Vehicle {
  id: string;
  ownerId: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin?: string;
  // Add other vehicle fields
}

// Appointment related types
export type AppointmentType =
  | "maintenance"
  | "repair"
  | "inspection"
  | "diagnostic"
  | "emergency";
export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export interface Appointment {
  id: string;
  customer_id: string;
  vehicle_id: string;
  assigned_employee_id?: string | null;
  appointment_type: AppointmentType;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  status: AppointmentStatus;
  service_description?: string;
  customer_notes?: string;
  internal_notes?: string;
  estimated_cost?: number | null;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
  cancelled_at?: string | null;
  completed_at?: string | null;
  // Computed fields from backend
  customer_name?: string;
  vehicle_details?: string | VehicleDetails; // Can be string (legacy) or object (enriched)
  employee_name?: string;
  time_until_appointment?: string;
}

export interface CreateAppointmentData {
  customer_id: string;
  vehicle_id: string;
  appointment_type: AppointmentType;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes?: number;
  service_description?: string;
  customer_notes?: string;
  estimated_cost?: number;
  created_by_user_id?: string; // Added automatically from JWT token
}

export interface UpdateAppointmentData {
  appointment_type?: AppointmentType;
  scheduled_date?: string;
  scheduled_time?: string;
  duration_minutes?: number;
  service_description?: string;
  customer_notes?: string;
  internal_notes?: string;
  estimated_cost?: number;
}

export interface RescheduleAppointmentData {
  new_date: string;
  new_time: string;
  reason?: string;
}

export interface AssignEmployeeData {
  employee_id: string;
}

export interface StatusUpdateData {
  reason?: string;
}

export interface TimeSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  max_concurrent_appointments: number;
  available_capacity?: number;
}

export interface AppointmentHistory {
  id: string;
  appointment_id: string;
  changed_by_user_id: string;
  previous_status: string;
  new_status: string;
  change_reason?: string;
  changed_at: string;
}

export interface AppointmentStats {
  total_appointments: number;
  pending: number;
  confirmed: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  today: number;
  completed_today: number;
  upcoming: number;
  by_type: Record<AppointmentType, number>;
}

export interface AvailableSlot {
  date: string;
  time: string;
  available: boolean;
}

export interface AvailableSlotsResponse {
  count: number;
  slots: AvailableSlot[];
}

// Notification related types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  isRead: boolean;
  createdAt: string;
}

// Project related types
export interface Project {
  id: string;
  vehicleId: string;
  employeeId: string;
  title: string;
  description: string;
  status: "not-started" | "in-progress" | "completed";
  startDate: string;
  endDate?: string;
  // Add other project fields
}

// TimeLog related types
export type TimeLogStatus = "inprogress" | "completed" | "paused";
export type TaskType = "project" | "appointment";

export interface TimeLog {
  log_id: string;
  employee_id: number;
  shift?: string | null;
  task_type: TaskType;
  project_id?: string | null;
  appointment_id?: string | null;
  description: string;
  vehicle?: string;
  service?: string;
  log_date: string;
  start_time: string;
  end_time?: string | null;
  duration_seconds: number;
  duration: string;
  status: TimeLogStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateTimeLogRequest {
  task_type: TaskType;
  project_id?: string;
  appointment_id?: string;
  description: string;
  vehicle?: string;
  service?: string;
  start_time: string;
  status?: TimeLogStatus;
}

export interface UpdateTimeLogRequest {
  task_type?: TaskType;
  project_id?: string;
  appointment_id?: string;
  description?: string;
  vehicle?: string;
  service?: string;
  start_time?: string;
  end_time?: string;
  duration_seconds?: number;
  status?: TimeLogStatus;
}

export interface DailyTimeTotal {
  id: string;
  employee_id: number;
  log_date: string;
  total_hours: number;
  total_hours_formatted: string;
  total_seconds: number;
  total_tasks: number;
  project_tasks_count: number;
  appointment_tasks_count: number;
  project_hours: number;
  appointment_hours: number;
  created_at: string;
  updated_at: string;
}

export interface TimeLogStats {
  employee_id: number;
  total_hours: string;
  total_entries: number;
  avg_hours_per_day: string;
  days_worked: number;
  breakdown: {
    project_tasks: number;
    appointment_tasks: number;
  };
  filter: string;
}

export interface EmployeeLogsResponse {
  message?: string;
  employee_id?: number;
  filter: string;
  data: {
    [date: string]: TimeLog[];
  };
}

export interface DailyTotalsResponse {
  employee_id: number;
  date_range: {
    start_date?: string;
    end_date?: string;
  };
  summary: {
    total_hours: string;
    total_tasks: number;
    days_worked: number;
  };
  daily_totals: DailyTimeTotal[];
}

export type TimeFilterOption =
  | "all_time"
  | "today"
  | "this_week"
  | "this_month"
  | "last_month";
