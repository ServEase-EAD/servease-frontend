/**
 * Project Service
 * Handles project/modification request-related API operations
 */
import apiClient, { handleApiError } from "./apiService";
import { API_ENDPOINTS } from "../config/api.config";

/**
 * Project interface based on backend model
 */
export interface Project {
  project_id: string;
  vehicle: string;
  customer_id: string;
  title: string;
  description: string;
  expected_completion_date: string;
  status: "accepted" | "cancelled" | "not_started" | "in_progress" | "completed" | "on_hold";
  created_at: string;
  updated_at: string;
}

/**
 * Create Project Data interface
 */
export interface CreateProjectData {
  vehicle: string;
  title: string;
  description: string;
  expected_completion_date: string;
}

/**
 * Update Project Data interface
 */
export interface UpdateProjectData {
  vehicle?: string;
  title?: string;
  description?: string;
  expected_completion_date?: string;
}

/**
 * Get all projects for the current user
 */
export const getProjects = async (): Promise<Project[]> => {
  try {
    const response = await apiClient.get<Project[]>(API_ENDPOINTS.PROJECTS.LIST);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Get a specific project by ID
 */
export const getProjectById = async (projectId: string): Promise<Project> => {
  try {
    const response = await apiClient.get<Project>(API_ENDPOINTS.PROJECTS.DETAIL(projectId));
    return response.data;
  } catch (error) {
    console.error(`Error fetching project ${projectId}:`, error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Create a new project
 */
export const createProject = async (data: CreateProjectData): Promise<Project> => {
  try {
    const response = await apiClient.post<Project>(API_ENDPOINTS.PROJECTS.CREATE, data);
    return response.data;
  } catch (error) {
    console.error("Error creating project:", error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Update an existing project
 */
export const updateProject = async (projectId: string, data: UpdateProjectData): Promise<Project> => {
  try {
    const response = await apiClient.patch<Project>(
      API_ENDPOINTS.PROJECTS.UPDATE(projectId),
      data
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating project ${projectId}:`, error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Delete a project
 */
export const deleteProject = async (projectId: string): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.PROJECTS.DELETE(projectId)
    );
    return response.data;
  } catch (error) {
    console.error(`Error deleting project ${projectId}:`, error);
    throw new Error(handleApiError(error));
  }
};
