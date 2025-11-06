import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  Event as EventIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import {
  getCustomerAppointments,
  cancelAppointment,
  rescheduleAppointment,
  getAppointmentById,
} from "../../services/appointmentService";
import { getCurrentCustomerProfile } from "../../services/customerService";
import { getVehicles, type Vehicle } from "../../services/vehicleService";
import type {
  Appointment,
  AppointmentStatus,
  AppointmentType,
  RescheduleAppointmentData,
  CreateAppointmentData,
} from "../../types";
import { formatDate, formatTime, getTodayDate } from "../../utils/dateUtils";
import CreateAppointmentForm from "./Appointments/CreateAppointmentForm";
import AppointmentDetails from "./Appointments/AppointmentDetails";

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

const AppointmentsSection: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Snackbar states
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  // Cancel confirmation state
  const [cancelConfirmation, setCancelConfirmation] = useState<{
    open: boolean;
    appointmentId: string | null;
  }>({
    open: false,
    appointmentId: null,
  });

  // Reschedule form state
  const [rescheduleData, setRescheduleData] = useState<{
    scheduled_date: string;
    scheduled_time: string;
    reason: string;
  }>({
    scheduled_date: getTodayDate(),
    scheduled_time: "09:00",
    reason: "",
  });

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "warning" | "info"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchCustomerProfile = async () => {
    try {
      const profile = await getCurrentCustomerProfile();
      setCustomerId(profile.id);
    } catch {
      showSnackbar("Failed to load customer profile", "error");
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    if (!customerId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getCustomerAppointments(customerId);
      setAppointments(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load appointments";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const vehicleList = await getVehicles();
      setVehicles(vehicleList);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      showSnackbar("Failed to load vehicles", "error");
    }
  };

  useEffect(() => {
    fetchCustomerProfile();
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (customerId) {
      fetchAppointments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    appointment: Appointment
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedAppointment(appointment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewDetails = () => {
    if (!selectedAppointment) return;
    setViewDetailsOpen(true);
    handleMenuClose();
  };

  const handleOpenReschedule = async () => {
    if (!selectedAppointment) return;

    // Check if appointment is pending
    if (selectedAppointment.status !== "pending") {
      showSnackbar(
        selectedAppointment.status === "confirmed"
          ? "Cannot reschedule approved appointments"
          : "Only pending appointments can be rescheduled",
        "warning"
      );
      handleMenuClose();
      return;
    }

    // Load full appointment details
    try {
      const appointment = await getAppointmentById(selectedAppointment.id);
      setRescheduleData({
        scheduled_date: appointment.scheduled_date,
        scheduled_time: appointment.scheduled_time,
        reason: "",
      });
      setRescheduleDialogOpen(true);
      handleMenuClose();
    } catch (err) {
      showSnackbar("Failed to load appointment details", "error");
      handleMenuClose();
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedAppointment) return;

    try {
      await rescheduleAppointment(selectedAppointment.id, {
        new_date: rescheduleData.scheduled_date,
        new_time: rescheduleData.scheduled_time,
        reason: rescheduleData.reason,
      });
      setRescheduleDialogOpen(false);
      fetchAppointments();
      showSnackbar("Appointment rescheduled successfully!", "success");
    } catch (err) {
      showSnackbar(
        err instanceof Error ? err.message : "Failed to reschedule appointment",
        "error"
      );
    }
  };

  const openCancelConfirmation = () => {
    if (!selectedAppointment) return;

    // Check if appointment is already cancelled
    if (selectedAppointment.status === "cancelled") {
      showSnackbar("This appointment has already been cancelled", "warning");
      handleMenuClose();
      return;
    }

    setCancelConfirmation({
      open: true,
      appointmentId: selectedAppointment.id,
    });
    handleMenuClose();
  };

  const handleCancelAppointment = async () => {
    if (!cancelConfirmation.appointmentId) return;

    try {
      await cancelAppointment(cancelConfirmation.appointmentId);
      setCancelConfirmation({ open: false, appointmentId: null });
      fetchAppointments();
      showSnackbar("Appointment cancelled successfully", "success");
    } catch (err) {
      showSnackbar(
        err instanceof Error ? err.message : "Failed to cancel appointment",
        "error"
      );
      setCancelConfirmation({ open: false, appointmentId: null });
    }
  };

  if (loading) {
    return (
      <Card elevation={3}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card elevation={3}>
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <EventIcon color="primary" sx={{ mr: 2, fontSize: 30 }} />
              <Typography variant="h5" component="h2">
                My Appointments
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{
                background: "linear-gradient(135deg, #FF4D00 0%, #FF7433 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #E63900 0%, #FF5722 100%)",
                },
              }}
            >
              New Appointment
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Appointments List */}
          {appointments.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <EventIcon
                sx={{ fontSize: 80, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No appointments scheduled
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Schedule your first appointment to get started with our
                services.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Vehicle</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow
                      key={appointment.id}
                      hover
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setViewDetailsOpen(true);
                      }}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {formatDate(appointment.scheduled_date)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(appointment.scheduled_time)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {typeof appointment.vehicle_details === 'object' 
                          ? appointment.vehicle_details?.display_name || "N/A"
                          : appointment.vehicle_details || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={appointment.appointment_type}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={appointment.status}
                          size="small"
                          color={statusColors[appointment.status]}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuOpen(e, appointment);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>View Details</MenuItem>
        <MenuItem onClick={handleOpenReschedule}>Reschedule</MenuItem>
        <MenuItem onClick={openCancelConfirmation}>Cancel</MenuItem>
      </Menu>

      {/* View Details Dialog */}
      {selectedAppointment && (
        <AppointmentDetails
          open={viewDetailsOpen}
          onClose={() => setViewDetailsOpen(false)}
          appointmentId={selectedAppointment.id}
        />
      )}

      {/* Reschedule Dialog */}
      <Dialog
        open={rescheduleDialogOpen}
        onClose={() => setRescheduleDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          },
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>
              Reschedule Appointment
            </Typography>
            <IconButton
              onClick={() => setRescheduleDialogOpen(false)}
              size="small"
              sx={{ color: "#999" }}
            >
              <WarningIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2 }}>
          <br />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              fullWidth
              required
              type="date"
              label="New Date"
              value={rescheduleData.scheduled_date}
              onChange={(e) =>
                setRescheduleData({
                  ...rescheduleData,
                  scheduled_date: e.target.value,
                })
              }
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: getTodayDate() }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "#FF4D00",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#FF4D00",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#FF4D00",
                },
              }}
            />

            <TextField
              fullWidth
              required
              type="time"
              label="New Time"
              value={rescheduleData.scheduled_time}
              onChange={(e) =>
                setRescheduleData({
                  ...rescheduleData,
                  scheduled_time: e.target.value,
                })
              }
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "#FF4D00",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#FF4D00",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#FF4D00",
                },
              }}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason for Rescheduling"
              value={rescheduleData.reason}
              onChange={(e) =>
                setRescheduleData({ ...rescheduleData, reason: e.target.value })
              }
              placeholder="Please provide a reason for rescheduling..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "#FF4D00",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#FF4D00",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#FF4D00",
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={() => setRescheduleDialogOpen(false)}
            variant="outlined"
            sx={{
              borderColor: "#ddd",
              color: "#666",
              px: 3,
              py: 1,
              borderRadius: 1,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRescheduleSubmit}
            variant="contained"
            disabled={
              !rescheduleData.scheduled_date || !rescheduleData.scheduled_time
            }
            sx={{
              backgroundColor: "#FF4D00",
              color: "white",
              px: 3,
              py: 1,
              borderRadius: 1,
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#E63900",
              },
              "&:disabled": {
                backgroundColor: "#ccc",
              },
            }}
          >
            Reschedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelConfirmation.open}
        onClose={() =>
          setCancelConfirmation({ open: false, appointmentId: null })
        }
        maxWidth="sm"
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WarningIcon sx={{ color: "#ff9800" }} />
            <Typography variant="h6">Confirm Cancellation</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this appointment? This action cannot
            be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() =>
              setCancelConfirmation({ open: false, appointmentId: null })
            }
            variant="outlined"
            sx={{ borderColor: "#ddd", color: "#666" }}
          >
            No, Keep It
          </Button>
          <Button
            onClick={handleCancelAppointment}
            variant="contained"
            color="error"
            sx={{ backgroundColor: "#d32f2f" }}
          >
            Yes, Cancel Appointment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Create Appointment Dialog */}
      {customerId && (
        <CreateAppointmentForm
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onSuccess={fetchAppointments}
          customerId={customerId}
        />
      )}
    </>
  );
};

export default AppointmentsSection;
