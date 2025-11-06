import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from "@mui/material";
import {
  Event as EventIcon,
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import {
  getAppointmentById,
  getAppointmentHistory,
} from "../../../services/appointmentService";
import type {
  Appointment,
  AppointmentStatus,
  AppointmentHistory,
} from "../../../types";
import {
  formatDate,
  formatTime,
  formatDateTime,
  formatDuration,
} from "../../../utils/dateUtils";

interface AppointmentDetailsProps {
  open: boolean;
  onClose: () => void;
  appointmentId: string;
}

const statusColors: Record<
  AppointmentStatus,
  "default" | "primary" | "warning" | "success" | "error"
> = {
  pending: "warning",
  confirmed: "primary",
  in_progress: "default",
  completed: "success",
  cancelled: "error",
  no_show: "error",
};

const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({
  open,
  onClose,
  appointmentId,
}) => {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [history, setHistory] = useState<AppointmentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAppointmentById(appointmentId);
      setAppointment(data);

      // Load history
      const historyData = await getAppointmentHistory(appointmentId);
      setHistory(historyData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load appointment details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && appointmentId) {
      fetchAppointmentDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, appointmentId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Appointment Details</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : appointment ? (
          <Box>
            {/* Status */}
            <Box
              sx={{
                mb: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h6">Status</Typography>
              <Chip
                label={appointment.status.replace("_", " ")}
                color={statusColors[appointment.status]}
                size="medium"
              />
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Main Information */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <CalendarIcon sx={{ mr: 1, color: "text.secondary" }} />
                <Typography variant="body1">
                  <strong>Date:</strong>{" "}
                  {formatDate(appointment.scheduled_date)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TimeIcon sx={{ mr: 1, color: "text.secondary" }} />
                <Typography variant="body1">
                  <strong>Time:</strong>{" "}
                  {formatTime(appointment.scheduled_time)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <EventIcon sx={{ mr: 1, color: "text.secondary" }} />
                <Typography variant="body1">
                  <strong>Type:</strong> {appointment.appointment_type}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TimeIcon sx={{ mr: 1, color: "text.secondary" }} />
                <Typography variant="body1">
                  <strong>Duration:</strong>{" "}
                  {formatDuration(appointment.duration_minutes)}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Customer & Vehicle */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />
                <Typography variant="body1">
                  <strong>Customer:</strong>{" "}
                  {appointment.customer_name || "N/A"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <CarIcon sx={{ mr: 1, color: "text.secondary" }} />
                <Typography variant="body1">
                  <strong>Vehicle:</strong>{" "}
                  {typeof appointment.vehicle_details === "string"
                    ? appointment.vehicle_details || "N/A"
                    : "N/A"}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Description & Notes */}
            {appointment.service_description && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <DescriptionIcon sx={{ mr: 1, color: "text.secondary" }} />
                  <Typography variant="body1">
                    <strong>Service Description:</strong>
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ pl: 4 }}
                >
                  {appointment.service_description}
                </Typography>
              </Box>
            )}

            {appointment.customer_notes && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1">
                  <strong>Customer Notes:</strong>
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ pl: 2 }}
                >
                  {appointment.customer_notes}
                </Typography>
              </Box>
            )}

            {appointment.internal_notes && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1">
                  <strong>Internal Notes:</strong>
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ pl: 2 }}
                >
                  {appointment.internal_notes}
                </Typography>
              </Box>
            )}

            {appointment.estimated_cost && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1">
                  <strong>Estimated Cost:</strong> ${appointment.estimated_cost}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* History */}
            <Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowHistory(!showHistory)}
                sx={{ mb: 2 }}
              >
                {showHistory ? "Hide History" : "Show History"}
              </Button>

              {showHistory && history.length > 0 && (
                <Paper
                  variant="outlined"
                  sx={{ maxHeight: 300, overflow: "auto" }}
                >
                  <Table size="small">
                    <TableBody>
                      {history.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>
                            <Typography variant="caption">
                              {formatDateTime(entry.changed_at)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {entry.previous_status} → {entry.new_status}
                            </Typography>
                            {entry.change_reason && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {entry.change_reason}
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              )}
            </Box>
          </Box>
        ) : (
          <Typography>No appointment data available</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentDetails;
