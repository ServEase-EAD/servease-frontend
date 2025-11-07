import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, Button, Chip, List, ListItem, Divider, CircularProgress } from "@mui/material";
import {
  Event as EventIcon,
  Build as BuildIcon,
  DirectionsCar as VehicleIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { getCustomerAppointments } from "../../services/appointmentService";
import type { Appointment } from "../../types";
import { formatDate, formatTime } from "../../utils/dateUtils";

interface Customer {
  id?: string;
  total_services?: number;
  completed_services?: number;
  pending_services?: number;
  upcoming_appointments?: number;
  preferred_contact_method?: string;
  last_service_date?: string;
}

interface DashboardSectionProps {
  customer: Customer | null;
  onNavigate: (tab: string) => void;
  onShowProfileData: () => void;
  onOpenAppointmentDialog?: () => void;
  onOpenProjectDialog?: () => void;
  onOpenVehicleDialog?: () => void;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({
  customer,
  onNavigate,
  onShowProfileData,
  onOpenAppointmentDialog,
  onOpenProjectDialog,
  onOpenVehicleDialog,
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // Fetch customer appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!customer?.id) return;

      setLoadingAppointments(true);
      try {
        const data = await getCustomerAppointments(customer.id);
        // Sort by date (most recent first) and take first 6
        const sortedAppointments = data
          .sort((a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime())
          .slice(0, 6);
        setAppointments(sortedAppointments);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      } finally {
        setLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, [customer?.id]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircleIcon color="success" />;
      case "pending":
      case "confirmed":
        return <PendingIcon color="warning" />;
      case "cancelled":
      case "no_show":
        return <CancelIcon color="error" />;
      default:
        return <ScheduleIcon color="info" />;
    }
  };

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success";
      case "pending":
      case "confirmed":
        return "warning";
      case "cancelled":
      case "no_show":
        return "error";
      case "in_progress":
        return "info";
      default:
        return "default";
    }
  };
  return (
    <Box
      sx={{
        display: "grid",
        gap: 3,
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      }}
    >
      {/* Quick Actions Card */}
      <Card elevation={3}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Quick Actions
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: 2,
            }}
          >
            <Button
              variant="contained"
              fullWidth
              startIcon={<EventIcon />}
              onClick={() => {
                onNavigate("appointments");
                onOpenAppointmentDialog?.();
              }}
              sx={{
                py: 1.5,
                textTransform: "none",
                background: "linear-gradient(135deg, #FF4D00 0%, #FF7433 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #E63900 0%, #FF5722 100%)",
                },
              }}
            >
              Add Appointment
            </Button>
            <Button
              variant="contained"
              fullWidth
              startIcon={<BuildIcon />}
              onClick={() => {
                onNavigate("projects");
                onOpenProjectDialog?.();
              }}
              sx={{
                py: 1.5,
                textTransform: "none",
                background: "linear-gradient(135deg, #FF4D00 0%, #FF7433 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #E63900 0%, #FF5722 100%)",
                },
              }}
            >
              Add New Request
            </Button>
            <Button
              variant="contained"
              fullWidth
              startIcon={<VehicleIcon />}
              onClick={() => {
                onNavigate("vehicles");
                onOpenVehicleDialog?.();
              }}
              sx={{
                py: 1.5,
                textTransform: "none",
                background: "linear-gradient(135deg, #FF4D00 0%, #FF7433 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #E63900 0%, #FF5722 100%)",
                },
              }}
            >
              Add New Vehicle
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<AssessmentIcon />}
              onClick={onShowProfileData}
              sx={{
                py: 1.5,
                textTransform: "none",
                color: "#FF4D00",
                borderColor: "#FF4D00",
                "&:hover": {
                  borderColor: "#E63900",
                  backgroundColor: "rgba(255, 77, 0, 0.05)",
                },
              }}
            >
              View Summary Data
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Service Summary Card */}
      <Card elevation={3}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Recent Services
          </Typography>
          
          {loadingAppointments ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : appointments.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No service history found
              </Typography>
            </Box>
          ) : (
            <List sx={{ width: "100%" }}>
              {appointments.map((appointment, index) => (
                <React.Fragment key={appointment.id}>
                  <ListItem sx={{ px: 0, py: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                      {getStatusIcon(appointment.status)}
                      <Box sx={{ ml: 2, flex: 1 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="medium">
                              {appointment.appointment_type.charAt(0).toUpperCase() + appointment.appointment_type.slice(1)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(appointment.scheduled_date)} at {formatTime(appointment.scheduled_time)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {typeof appointment.vehicle_details === "string" 
                                ? appointment.vehicle_details 
                                : appointment.vehicle_details?.make && appointment.vehicle_details?.model
                                  ? `${appointment.vehicle_details.make} ${appointment.vehicle_details.model}`
                                  : "Vehicle details not available"}
                            </Typography>
                          </Box>
                          <Chip
                            label={appointment.status.replace("_", " ")}
                            size="small"
                            color={getStatusColor(appointment.status)}
                            variant="outlined"
                          />
                        </Box>
                        {appointment.service_description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {appointment.service_description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </ListItem>
                  {index < appointments.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
          
          {appointments.length > 0 && (
            <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e0e0e0", textAlign: "center" }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => onNavigate("appointments")}
                sx={{ color: "#FF4D00", borderColor: "#FF4D00" }}
              >
                View All Services
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardSection;
