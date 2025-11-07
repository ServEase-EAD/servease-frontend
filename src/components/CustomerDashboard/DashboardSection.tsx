import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Event as EventIcon,
  DirectionsCar as CarIcon,
  Build as ProjectIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
} from "@mui/icons-material";
import type { Appointment, Vehicle, Project, Customer } from "../../types";
import apiClient from "../../services/apiService";
import { API_ENDPOINTS } from "../../config/api.config";
import { getCustomerAppointments } from "../../services/appointmentService";

interface DashboardSectionProps {
  customer: Customer | null;
  onNavigate: (tab: string) => void;
  onShowProfileData: () => void;
  onOpenAppointmentDialog?: () => void;
  onOpenProjectDialog?: () => void;
  onOpenVehicleDialog?: () => void;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({ customer }) => {
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug: Log customer data on mount and changes
  useEffect(() => {
    console.log("DashboardSection - Customer prop:", customer);
  }, [customer]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Wait for customer data to be available
      if (!customer) {
        console.log("Waiting for customer data...");
        setLoading(false);
        return;
      }

      const customerId = customer.user_id || customer.id;
      if (!customerId) {
        console.log("No customer ID available");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log("Fetching dashboard data for user:", customerId);

        // Fetch recent appointments (last 3)
        try {
          const appointmentsData = await getCustomerAppointments(customerId);

          const sortedAppointments = [...appointmentsData].sort((a, b) => {
            const dateA = new Date(`${a.scheduled_date}T${a.scheduled_time}`);
            const dateB = new Date(`${b.scheduled_date}T${b.scheduled_time}`);
            return dateB.getTime() - dateA.getTime();
          });

          setRecentAppointments(sortedAppointments.slice(0, 3));
        } catch (err) {
          console.error("Error fetching appointments:", err);
          setRecentAppointments([]);
        }

        // Fetch vehicles
        try {
          const vehiclesResponse = await apiClient.get(
            `${API_ENDPOINTS.VEHICLES.LIST}?owner_id=${customerId}`
          );
          console.log("Vehicles response:", vehiclesResponse.data);
          
          // Handle both paginated and non-paginated responses
          const vehiclesData = Array.isArray(vehiclesResponse.data)
            ? vehiclesResponse.data
            : (vehiclesResponse.data?.results || []);
          
          setVehicles(vehiclesData);
        } catch (err) {
          console.error("Error fetching vehicles:", err);
          setVehicles([]);
        }

        // Fetch projects
        try {
          const projectsResponse = await apiClient.get(
            `${API_ENDPOINTS.PROJECTS.LIST}?customer_id=${customerId}&ordering=-startDate&limit=3`
          );
          console.log("Projects response:", projectsResponse.data);
          
          // Handle both paginated and non-paginated responses
          const projectsData = Array.isArray(projectsResponse.data)
            ? projectsResponse.data
            : (projectsResponse.data?.results || []);
          
          setProjects(projectsData.slice(0, 3));
        } catch (err) {
          console.error("Projects not available:", err);
          setProjects([]);
        }
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError("Unable to load dashboard data. Some services may be unavailable.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [customer]); // Re-run when customer object changes

  const getStatusColor = (status: string) => {
    const colors: Record<string, "success" | "warning" | "info" | "error" | "default"> = {
      completed: "success",
      confirmed: "info",
      pending: "warning",
      cancelled: "error",
      in_progress: "info",
    };
    return colors[status] || "default";
  };

  const getStatusIcon = (status: string) => {
    if (status === "completed") return <CheckCircleIcon sx={{ fontSize: 16 }} />;
    if (status === "pending" || status === "confirmed") return <PendingIcon sx={{ fontSize: 16 }} />;
    return <ScheduleIcon sx={{ fontSize: 16 }} />;
  };

  // If no customer data available yet, show simple message
  if (!customer) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 8 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading your dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))" }}>
      {/* Account Overview */}
      <Card elevation={3}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EventIcon color="primary" />
            Account Overview
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Box sx={{ textAlign: "center", flex: 1 }}>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography variant="h3" color="primary" fontWeight="bold">
                  {customer?.total_services || 0}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Total Services
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
            <Box sx={{ textAlign: "center", flex: 1 }}>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography variant="h3" color="primary" fontWeight="bold">
                  {vehicles.length}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Vehicles
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
            <Box sx={{ textAlign: "center", flex: 1 }}>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography variant="h3" color="primary" fontWeight="bold">
                  {recentAppointments.length}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Appointments
              </Typography>
            </Box>
          </Box>

          {customer?.last_service_date && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "rgba(255, 77, 0, 0.05)", borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Last Service: <strong>{new Date(customer.last_service_date).toLocaleDateString()}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Member Since: <strong>{new Date(customer.customer_since).toLocaleDateString()}</strong>
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Recent Appointments */}
      <Card elevation={3}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ScheduleIcon color="primary" />
            Recent Appointments
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : recentAppointments.length > 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {recentAppointments.map((appointment) => (
                <Box
                  key={appointment.id}
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {appointment.appointment_type.charAt(0).toUpperCase() + appointment.appointment_type.slice(1)}
                    </Typography>
                    <Chip
                      label={appointment.status.replace("_", " ")}
                      color={getStatusColor(appointment.status)}
                      size="small"
                      icon={getStatusIcon(appointment.status)}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    📅 {new Date(appointment.scheduled_date).toLocaleDateString()} at {appointment.scheduled_time}
                  </Typography>
                  {appointment.service_description && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {appointment.service_description}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <ScheduleIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No appointments scheduled yet
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* My Vehicles */}
      <Card elevation={3}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CarIcon color="primary" />
            My Vehicles
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : vehicles.length > 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {vehicles.slice(0, 3).map((vehicle: any) => (
                <Box
                  key={vehicle.id}
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {vehicle.color} • {vehicle.license_plate || vehicle.licensePlate || vehicle.plate_number}
                      </Typography>
                    </Box>
                    <Chip
                      label={vehicle.is_active ? "Active" : "Inactive"}
                      color={vehicle.is_active ? "success" : "default"}
                      size="small"
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CarIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No vehicles registered yet
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Active Projects */}
      {projects.length > 0 && (
        <Card elevation={3}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ProjectIcon color="primary" />
              Active Projects
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {projects.map((project: any) => (
                <Box
                  key={project.id}
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {project.title || project.name}
                    </Typography>
                    <Chip
                      label={project.status.replace("-", " ")}
                      color={getStatusColor(project.status)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {project.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Started: {new Date(project.startDate || project.start_date).toLocaleDateString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card elevation={3}>
          <CardContent>
            <Alert severity="warning">{error}</Alert>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default DashboardSection;
