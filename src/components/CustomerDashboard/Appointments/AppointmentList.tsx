import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
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
  Dialog,
  TextField,
  CircularProgress,
  Alert,
  Select,
  FormControl,
  InputLabel,
  Stack,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Event as EventIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import {
  getAppointments,
  cancelAppointment,
} from "../../../services/appointmentService";
import type { Appointment, AppointmentStatus } from "../../../types";
import { formatDate, formatTime } from "../../../utils/dateUtils";

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

const AppointmentList: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.appointment_type = typeFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const data = await getAppointments(params);
      setAppointments(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load appointments"
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, startDate, endDate]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

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

  const handleCancelClick = () => {
    handleMenuClose();
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedAppointment) return;

    try {
      await cancelAppointment(selectedAppointment.id, { reason: cancelReason });
      setCancelDialogOpen(false);
      setCancelReason("");
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to cancel appointment"
      );
    }
  };

  const clearFilters = () => {
    setStatusFilter("");
    setTypeFilter("");
    setStartDate("");
    setEndDate("");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Card elevation={3}>
        <CardContent>
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
                Appointments
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
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

          {/* Filters */}
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
              <FormControl sx={{ minWidth: 200 }} size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 200 }} size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  label="Type"
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="repair">Repair</MenuItem>
                  <MenuItem value="inspection">Inspection</MenuItem>
                  <MenuItem value="diagnostic">Diagnostic</MenuItem>
                  <MenuItem value="emergency">Emergency</MenuItem>
                </Select>
              </FormControl>
              <TextField
                size="small"
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 160 }}
              />
              <TextField
                size="small"
                type="date"
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 160 }}
              />
              <Button
                variant="outlined"
                onClick={clearFilters}
                startIcon={<FilterIcon />}
              >
                Clear Filters
              </Button>
            </Stack>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ py: 4 }}
                      >
                        No appointments found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  appointments.map((appointment) => (
                    <TableRow key={appointment.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {formatDate(appointment.scheduled_date)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(appointment.scheduled_time)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {appointment.customer_name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {typeof appointment.vehicle_details === "string"
                          ? appointment.vehicle_details || "N/A"
                          : "N/A"}
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
                      <TableCell>
                        {appointment.employee_name || "Unassigned"}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, appointment)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
        <MenuItem onClick={handleMenuClose}>Edit</MenuItem>
        <MenuItem onClick={handleMenuClose}>Reschedule</MenuItem>
        <MenuItem onClick={handleCancelClick}>Cancel</MenuItem>
      </Menu>

      {/* Cancel Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <Box sx={{ p: 3, minWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            Cancel Appointment
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Are you sure you want to cancel this appointment?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason (Optional)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button onClick={() => setCancelDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleCancelConfirm}
            >
              Confirm Cancellation
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default AppointmentList;
