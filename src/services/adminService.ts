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

// ==================== APPOINTMENT MANAGEMENT ====================

export interface Appointment {
  id: string;
  customer_id: string;
  vehicle_id: string;
  service_type: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  scheduled_date?: string;
  scheduled_time?: string;
  description: string;
  category?: string;
  assigned_employees?: string[];
  assigned_employee_id?: string; // Single employee ID from backend
  employee_name?: string; // Employee name from backend
  created_at: string;
}

export interface AppointmentStats {
  total_appointments: number;
  pending_appointments: number;
  confirmed_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
}

/**
 * Get all appointments with filtering
 */
export const getAllAppointments = async (params?: {
  status?: string;
  approval_status?: string;
  customer_id?: string;
  employee_id?: string;
  category?: string;
  date_from?: string;
  date_to?: string;
}): Promise<Appointment[]> => {
  const response = await apiClient.get("/api/v1/admin/appointments/", {
    params,
  });
  // Handle paginated response from Django REST Framework
  return response.data.results || response.data;
};

/**
 * Get pending appointments
 */
export const getPendingAppointments = async (): Promise<Appointment[]> => {
  const response = await apiClient.get("/api/v1/admin/appointments/pending/");
  // Handle paginated response from Django REST Framework
  return response.data.results || response.data;
};

/**
 * Get appointment details
 */
export const getAppointmentDetail = async (
  appointmentId: string
): Promise<Appointment> => {
  const response = await apiClient.get(
    `/api/v1/admin/appointments/${appointmentId}/`
  );
  return response.data;
};

/**
 * Approve an appointment
 */
export const approveAppointment = async (
  appointmentId: string,
  data: {
    scheduled_date: string;
    scheduled_time: string;
    assigned_employees?: string[];
  }
): Promise<{ message: string; data: Appointment }> => {
  const response = await apiClient.post(
    `/api/v1/admin/appointments/${appointmentId}/approve/`,
    data
  );
  return response.data;
};

/**
 * Reject an appointment
 */
export const rejectAppointment = async (
  appointmentId: string,
  reason?: string
): Promise<{ message: string }> => {
  const response = await apiClient.post(
    `/api/v1/admin/appointments/${appointmentId}/reject/`,
    { cancellation_reason: reason }
  );
  return response.data;
};

/**
 * Assign employees to appointment
 */
export const assignEmployeesToAppointment = async (
  appointmentId: string,
  employeeIds: string[]
): Promise<{ message: string }> => {
  const response = await apiClient.post(
    `/api/v1/admin/appointments/${appointmentId}/assign/`,
    { employee_ids: employeeIds }
  );
  return response.data;
};

/**
 * Reschedule appointment
 */
export const rescheduleAppointment = async (
  appointmentId: string,
  data: {
    scheduled_date: string;
    scheduled_time: string;
    reason?: string;
  }
): Promise<{ message: string }> => {
  const response = await apiClient.post(
    `/api/v1/admin/appointments/${appointmentId}/reschedule/`,
    data
  );
  return response.data;
};

/**
 * Get appointment statistics
 */
export const getAppointmentStatistics = async (): Promise<AppointmentStats> => {
  const response = await apiClient.get(
    "/api/v1/admin/appointments/statistics/"
  );
  return response.data;
};

// ==================== PROJECT MANAGEMENT ====================

export interface Project {
  project_id: string; // Backend uses project_id as primary key
  id?: string; // Alias for compatibility
  customer_id: string;
  vehicle_id: string;
  title: string;
  description: string;
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  approval_status?: "pending" | "approved" | "rejected";
  assigned_employee_id?: string;
  estimated_cost?: number;
  created_at: string;
}

/**
 * Get all projects with filtering
 */
export const getAllProjects = async (params?: {
  status?: string;
  approval_status?: string;
  customer_id?: string;
  assigned_employee_id?: string;
}): Promise<Project[]> => {
  const response = await apiClient.get("/api/v1/admin/projects/", {
    params: { ...params, _t: Date.now() }, // Cache busting
  });
  // Handle paginated response from Django REST Framework
  return response.data.results || response.data;
};

/**
 * Get pending projects
 */
export const getPendingProjects = async (): Promise<Project[]> => {
  const response = await apiClient.get("/api/v1/admin/projects/pending/", {
    params: { _t: Date.now() }, // Cache busting
  });
  // Handle paginated response from Django REST Framework
  return response.data.results || response.data;
};

/**
 * Get project progress summary
 */
export const getProjectProgress = async (): Promise<Project[]> => {
  const response = await apiClient.get("/api/v1/admin/projects/progress/");
  // Handle paginated response from Django REST Framework
  return response.data.results || response.data;
};

/**
 * Approve a project with tasks and employee assignments
 */
export const approveProject = async (
  projectId: string,
  tasks: Array<{
    title: string;
    description?: string;
    assigned_employee_id: string;
    priority?: string;
    due_date?: string;
  }>
): Promise<{ message: string; data: { project: Project; tasks: Task[] } }> => {
  const response = await apiClient.post(
    `/api/v1/admin/projects/${projectId}/approve/`,
    { tasks }
  );
  return response.data;
};

/**
 * Reject a project
 */
export const rejectProject = async (
  projectId: string,
  reason?: string
): Promise<{ message: string }> => {
  const response = await apiClient.post(
    `/api/v1/admin/projects/${projectId}/reject/`,
    { rejection_reason: reason }
  );
  return response.data;
};

/**
 * Assign employee to project
 */
export const assignEmployeeToProject = async (
  projectId: string,
  employeeId: string
): Promise<{ message: string }> => {
  const response = await apiClient.post(
    `/api/v1/admin/projects/${projectId}/assign-employee/`,
    { assigned_employee_id: employeeId }
  );
  return response.data;
};

// ==================== TASK MANAGEMENT ====================

export interface Task {
  task_id: string;
  id?: string; // For backward compatibility
  project?: string;
  appointment?: string;
  title: string;
  description: string;
  status: "not_started" | "in_progress" | "completed" | "blocked";
  priority: "low" | "medium" | "high" | "critical";
  assigned_employee_id?: string;
  due_date?: string;
  created_at: string;
}

/**
 * Get all tasks
 * Calling vehicleandproject-service directly since admin-service endpoint has issues
 */
export const getAllTasks = async (params?: {
  project?: string;
  status?: string;
  priority?: string;
}): Promise<Task[]> => {
  const response = await apiClient.get("/api/v1/projects/tasks/", { params });
  // Handle paginated response from Django REST Framework
  return response.data.results || response.data;
};

/**
 * Create a task
 * Bypassing admin-service due to 405 error, calling vehicleandproject-service directly
 */
export const createTask = async (taskData: {
  project: string;
  title: string;
  description: string;
  priority?: string;
  due_date?: string;
  assigned_employee_id?: string;
}): Promise<Task> => {
  const response = await apiClient.post("/api/v1/projects/tasks/", taskData);
  return response.data;
};

/**
 * Assign employee to task
 */
export const assignEmployeeToTask = async (
  taskId: string,
  employeeId: string,
  taskType: "project_task" | "appointment_task"
): Promise<{ message: string }> => {
  const response = await apiClient.post("/api/v1/admin/tasks/assign/", {
    task_id: taskId,
    employee_id: employeeId,
    task_type: taskType,
  });
  return response.data;
};

/**
 * Update task
 */
export const updateTask = async (
  taskId: string,
  taskData: Partial<Task>
): Promise<Task> => {
  const response = await apiClient.patch(
    `/api/v1/admin/tasks/${taskId}/update/`,
    taskData
  );
  return response.data;
};

/**
 * Delete task
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  await apiClient.delete(`/api/v1/admin/tasks/${taskId}/delete/`);
};

// ==================== VEHICLE MANAGEMENT ====================

export interface Vehicle {
  id: string;
  registration_number: string;
  make: string;
  model: string;
  year: number;
  customer_id: string;
  active_projects?: Project[];
  active_appointments?: Appointment[];
}

/**
 * Get all vehicles
 */
export const getAllVehicles = async (params?: {
  customer_id?: string;
  assigned_employee_id?: string;
  has_active_projects?: boolean;
  has_active_appointments?: boolean;
}): Promise<Vehicle[]> => {
  const response = await apiClient.get("/api/v1/admin/vehicles/", { params });
  return response.data;
};

/**
 * Get vehicle detail
 */
export const getVehicleDetail = async (vehicleId: string): Promise<Vehicle> => {
  const response = await apiClient.get(`/api/v1/admin/vehicles/${vehicleId}/`);
  return response.data;
};

/**
 * Get vehicles by employee
 */
export const getVehiclesByEmployee = async (
  employeeId: string
): Promise<Vehicle[]> => {
  const response = await apiClient.get(
    `/api/v1/admin/vehicles/employee/${employeeId}/`
  );
  return response.data;
};

// ==================== EMPLOYEE WORKLOAD ====================

export interface EmployeeWorkload {
  employee_id: string;
  tasks: Task[];
  time_stats: {
    total_hours_this_month: number;
    tasks_completed_this_month: number;
    average_task_duration: number;
  };
}

/**
 * Get all employees workload
 */
export const getAllEmployeesWorkload = async (): Promise<any[]> => {
  const response = await apiClient.get("/api/v1/admin/employees/workload/");
  return response.data;
};

/**
 * Get employee workload detail
 */
export const getEmployeeWorkload = async (
  employeeId: string
): Promise<EmployeeWorkload> => {
  const response = await apiClient.get(
    `/api/v1/admin/employees/${employeeId}/workload/`
  );
  return response.data;
};

// ==================== DASHBOARD STATISTICS ====================

export interface DashboardStats {
  total_vehicles: number;
  total_projects: number;
  pending_projects: number;
  active_projects: number;
  appointment_stats: AppointmentStats;
  total_employees: number;
}

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get("/api/v1/admin/dashboard/stats/");
  return response.data;
};
