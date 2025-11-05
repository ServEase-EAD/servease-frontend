import React, { useState, useEffect } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { CheckCircle, Cancel, Assignment, Schedule } from "@mui/icons-material";
import {
  getAllAppointments,
  approveAppointment,
  rejectAppointment,
  assignEmployeesToAppointment,
  rescheduleAppointment,
  getAllUsers,
  type Appointment,
  type AppointmentStats,
  type User,
} from "../../services/adminService";

const AppointmentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>(
    []
  );
  const [statistics, setStatistics] = useState<AppointmentStats>({
    total_appointments: 0,
    pending_appointments: 0,
    confirmed_appointments: 0,
    completed_appointments: 0,
    cancelled_appointments: 0,
  });
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [approveDialog, setApproveDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [assignDialog, setAssignDialog] = useState(false);
  const [rescheduleDialog, setRescheduleDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [approveForm, setApproveForm] = useState({
    scheduled_date: "",
    scheduled_time: "",
    assigned_employees: [] as string[],
  });
  const [rejectReason, setRejectReason] = useState("");
  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<string[]>([]);
  const [rescheduleForm, setRescheduleForm] = useState({
    scheduled_date: "",
    scheduled_time: "",
    reason: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allData, employeesData] = await Promise.all([
        getAllAppointments(),
        getAllUsers("employee"),
      ]);

      const pending = allData.filter(
        (a: Appointment) => a.status === "pending"
      );

      setAppointments(allData);
      setPendingAppointments(pending);
      setEmployees(employeesData);

      const stats: AppointmentStats = {
        total_appointments: allData.length,
        pending_appointments: pending.length,
        confirmed_appointments: allData.filter(
          (a: Appointment) => a.status === "confirmed"
        ).length,
        completed_appointments: allData.filter(
          (a: Appointment) => a.status === "completed"
        ).length,
        cancelled_appointments: allData.filter(
          (a: Appointment) => a.status === "cancelled"
        ).length,
      };
      setStatistics(stats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setApproveForm({
      scheduled_date: appointment.scheduled_date || "",
      scheduled_time: appointment.scheduled_time || "",
      assigned_employees: [],
    });
    setApproveDialog(true);
  };

  const handleApprove = async () => {
    if (!selectedAppointment) return;

    try {
      setLoading(true);
      await approveAppointment(selectedAppointment.id, {
        scheduled_date: approveForm.scheduled_date,
        scheduled_time: approveForm.scheduled_time,
        assigned_employees: approveForm.assigned_employees,
      });

      setSuccess("Appointment approved successfully");
      setApproveDialog(false);
      loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to approve appointment"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRejectClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setRejectReason("");
    setRejectDialog(true);
  };

  const handleReject = async () => {
    if (!selectedAppointment) return;

    try {
      setLoading(true);
      await rejectAppointment(selectedAppointment.id, rejectReason);

      setSuccess("Appointment rejected");
      setRejectDialog(false);
      loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reject appointment"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setAssignedEmployeeIds([]);
    setAssignDialog(true);
  };

  const handleAssign = async () => {
    if (!selectedAppointment) return;

    try {
      setLoading(true);
      await assignEmployeesToAppointment(
        selectedAppointment.id,
        assignedEmployeeIds
      );

      setSuccess("Employees assigned successfully");
      setAssignDialog(false);
      loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to assign employees"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRescheduleClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleForm({
      scheduled_date: appointment.scheduled_date || "",
      scheduled_time: appointment.scheduled_time || "",
      reason: "",
    });
    setRescheduleDialog(true);
  };

  const handleReschedule = async () => {
    if (!selectedAppointment) return;

    try {
      setLoading(true);
      await rescheduleAppointment(selectedAppointment.id, {
        scheduled_date: rescheduleForm.scheduled_date,
        scheduled_time: rescheduleForm.scheduled_time,
        reason: rescheduleForm.reason,
      });

      setSuccess("Appointment rescheduled successfully");
      setRescheduleDialog(false);
      loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reschedule appointment"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (
    status: string
  ): "warning" | "info" | "primary" | "success" | "error" | "default" => {
    switch (status) {
      case "pending":
        return "warning";
      case "confirmed":
        return "info";
      case "in_progress":
        return "primary";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const renderAppointmentTable = (appointmentList: Appointment[]) => {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date & Time</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Vehicle</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned Employee</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointmentList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No appointments found
                </TableCell>
              </TableRow>
            ) : (
              appointmentList.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    {appointment.scheduled_date} at {appointment.scheduled_time}
                  </TableCell>
                  <TableCell>{appointment.customer_id}</TableCell>
                  <TableCell>{appointment.service_type || "N/A"}</TableCell>
                  <TableCell>{appointment.vehicle_id}</TableCell>
                  <TableCell>
                    <Chip
                      label={appointment.status}
                      color={getStatusColor(appointment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {appointment.assigned_employees &&
                    appointment.assigned_employees.length > 0
                      ? appointment.assigned_employees.join(", ")
                      : "Not assigned"}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {appointment.status === "pending" && (
                        <>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleApproveClick(appointment)}
                            title="Approve"
                          >
                            <CheckCircle />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRejectClick(appointment)}
                            title="Reject"
                          >
                            <Cancel />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleAssignClick(appointment)}
                            title="Assign Employee"
                          >
                            <Assignment />
                          </IconButton>
                        </>
                      )}
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleRescheduleClick(appointment)}
                        title="Reschedule"
                      >
                        <Schedule />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Appointment Management
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess(null)}
          sx={{ mb: 2 }}
        >
          {success}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(5, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Total
            </Typography>
            <Typography variant="h4">
              {statistics.total_appointments}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: "warning.light" }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Pending
            </Typography>
            <Typography variant="h4">
              {statistics.pending_appointments}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: "info.light" }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Confirmed
            </Typography>
            <Typography variant="h4">
              {statistics.confirmed_appointments}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: "success.light" }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Completed
            </Typography>
            <Typography variant="h4">
              {statistics.completed_appointments}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: "error.light" }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Cancelled
            </Typography>
            <Typography variant="h4">
              {statistics.cancelled_appointments}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Card>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="All Appointments" />
          <Tab label="Pending Approval" />
        </Tabs>

        <CardContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {activeTab === 0 && renderAppointmentTable(appointments)}
              {activeTab === 1 && renderAppointmentTable(pendingAppointments)}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={approveDialog}
        onClose={() => setApproveDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approve Appointment</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Scheduled Date"
              type="date"
              value={approveForm.scheduled_date}
              onChange={(e) =>
                setApproveForm({
                  ...approveForm,
                  scheduled_date: e.target.value,
                })
              }
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Scheduled Time"
              type="time"
              value={approveForm.scheduled_time}
              onChange={(e) =>
                setApproveForm({
                  ...approveForm,
                  scheduled_time: e.target.value,
                })
              }
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>Assign Employees (Optional)</InputLabel>
              <Select
                multiple
                value={approveForm.assigned_employees}
                onChange={(e) =>
                  setApproveForm({
                    ...approveForm,
                    assigned_employees: e.target.value as string[],
                  })
                }
                label="Assign Employees (Optional)"
              >
                {employees.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} ({emp.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialog(false)}>Cancel</Button>
          <Button onClick={handleApprove} variant="contained" color="success">
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={rejectDialog}
        onClose={() => setRejectDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Appointment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(false)}>Cancel</Button>
          <Button onClick={handleReject} variant="contained" color="error">
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={assignDialog}
        onClose={() => setAssignDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Employees</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Employees</InputLabel>
            <Select
              multiple
              value={assignedEmployeeIds}
              onChange={(e) =>
                setAssignedEmployeeIds(e.target.value as string[])
              }
              label="Select Employees"
            >
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name} ({emp.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(false)}>Cancel</Button>
          <Button onClick={handleAssign} variant="contained" color="primary">
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={rescheduleDialog}
        onClose={() => setRescheduleDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reschedule Appointment</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="New Date"
              type="date"
              value={rescheduleForm.scheduled_date}
              onChange={(e) =>
                setRescheduleForm({
                  ...rescheduleForm,
                  scheduled_date: e.target.value,
                })
              }
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="New Time"
              type="time"
              value={rescheduleForm.scheduled_time}
              onChange={(e) =>
                setRescheduleForm({
                  ...rescheduleForm,
                  scheduled_time: e.target.value,
                })
              }
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason (Optional)"
              value={rescheduleForm.reason}
              onChange={(e) =>
                setRescheduleForm({ ...rescheduleForm, reason: e.target.value })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRescheduleDialog(false)}>Cancel</Button>
          <Button onClick={handleReschedule} variant="contained" color="info">
            Reschedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppointmentManagement;
