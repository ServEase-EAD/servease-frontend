/**
 * Type definitions for the ServEase application
 */

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
  id: string;
  userId: string;
  address?: string;
  // Add other customer fields
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
export interface Appointment {
  id: string;
  customerId: string;
  vehicleId: string;
  employeeId?: string;
  scheduledDate: string;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  serviceType: string;
  notes?: string;
  // Add other appointment fields
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
