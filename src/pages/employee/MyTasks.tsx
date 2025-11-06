import React, { useState, useEffect } from "react";
import type { SelectChangeEvent } from "@mui/material";
import apiClient, { handleApiError } from "../../services/apiService";
import { API_ENDPOINTS } from "../../config/api.config";
import { getEmployeeTasks, type Task as ProjectTask } from "../../services/projectService";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FilterListIcon from "@mui/icons-material/FilterList";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BuildIcon from "@mui/icons-material/Build";
import DescriptionIcon from "@mui/icons-material/Description";

// ----------------- Types -----------------
interface AppointmentTask {
  id: string;
  appointment_type: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  customer_name: string;
  vehicle_details: string;
  customer_details?: Record<string, unknown>;
  service_description?: string;
  customer_notes?: string;
  internal_notes?: string;
  estimated_cost?: number;
  duration_minutes?: number;
  assigned_employee_id?: string;
  employee_name?: string;
}

interface UnifiedTask {
  id: string;
  type: "appointment" | "project";
  title: string;
  vehicle: string;
  dueDate: string;
  dueTime: string;
  status: string;
  originalData: AppointmentTask | ProjectTask;
}

// ----------------- Component -----------------
const MyTasks: React.FC = () => {
  const [appointmentTasks, setAppointmentTasks] = useState<AppointmentTask[]>([]);
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<UnifiedTask | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // ----------------- Fetch Data -----------------
  useEffect(() => {
    fetchAllTasks();
  }, []);

  const fetchAllTasks = async () => {
    setLoading(true);
    setError("");

    try {
      const [appointmentResponse, projectTasksData] = await Promise.all([
        apiClient.get(API_ENDPOINTS.APPOINTMENTS.LIST),
        getEmployeeTasks().catch(() => []),
      ]);

      const appointmentResults = appointmentResponse.data.results || [];
      const appointments: AppointmentTask[] = appointmentResults.map((task: Record<string, unknown>) => ({
        id: task.id as string,
        appointment_type: task.appointment_type as string,
        scheduled_date: task.scheduled_date as string,
        scheduled_time: task.scheduled_time as string,
        status: task.status as string,
        customer_name: (task.customer_name as string) || "Unknown Customer",
        vehicle_details: task.vehicle_details as string,
        customer_details: task.customer_details as Record<string, unknown>,
        service_description: task.service_description as string,
        customer_notes: task.customer_notes as string,
        internal_notes: task.internal_notes as string,
        estimated_cost: task.estimated_cost as number,
        duration_minutes: task.duration_minutes as number,
        assigned_employee_id: task.assigned_employee_id as string,
        employee_name: task.employee_name as string,
      }));

      setAppointmentTasks(appointments);
      setProjectTasks(projectTasksData);
    } catch (error) {
      console.error("⚠️ Error fetching tasks:", error);
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ----------------- Convert to Unified Format -----------------
  const unifiedTasks: UnifiedTask[] = [
    ...appointmentTasks.map((task) => ({
      id: task.id,
      type: "appointment" as const,
      title: task.appointment_type,
      vehicle: typeof task.vehicle_details === "string" ? task.vehicle_details : "Unknown Vehicle",
      dueDate: task.scheduled_date,
      dueTime: task.scheduled_time,
      status: task.status,
      originalData: task,
    })),
    ...projectTasks.map((task) => ({
      id: task.task_id,
      type: "project" as const,
      title: task.title,
      vehicle: task.vehicle || "Unknown Vehicle",
      dueDate: task.due_date || "No due date",
      dueTime: "",
      status: task.status,
      originalData: task,
    })),
  ];

  // ----------------- Update Status -----------------
  const updateAppointmentStatus = async (taskId: string, newStatus: string) => {
    try {
      await apiClient.patch(API_ENDPOINTS.APPOINTMENTS.DETAIL(taskId), {
        status: newStatus.toLowerCase(),
      });

      setAppointmentTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus.toLowerCase() } : task
        )
      );

      setSnackbar({
        open: true,
        message: `Status updated to ${formatStatus(newStatus)}`,
        severity: "success",
      });
    } catch (error) {
      const errorMessage = handleApiError(error);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  // ----------------- Status Helpers -----------------
  const handleStatusChange = (task: UnifiedTask) => {
    if (task.type === "appointment") {
      const nextStatus = getNextStatus(task.status);
      if (nextStatus) {
        updateAppointmentStatus(task.id, nextStatus);
      }
    }
  };

  const getNextStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "confirmed";
      case "confirmed":
        return "in_progress";
      case "in_progress":
        return "completed";
      case "not_started":
        return "in_progress";
      default:
        return "";
    }
  };

  const formatStatus = (status: string) => {
    const map: Record<string, string> = {
      pending: "Pending",
      confirmed: "Confirmed",
      in_progress: "In Progress",
      not_started: "Not Started",
      completed: "Completed",
      cancelled: "Cancelled",
      no_show: "No Show",
    };
    return map[status.toLowerCase()] || status;
  };

  const getStatusColor = (status: string): "default" | "error" | "warning" | "info" | "success" => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success";
      case "in_progress":
        return "warning";
      case "confirmed":
        return "info";
      case "pending":
      case "not_started":
        return "error";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "critical":
        return "#ff0000";
      case "high":
        return "#ff4444";
      case "medium":
        return "#ffbb33";
      case "low":
        return "#00C851";
      default:
        return "#333333";
    }
  };

  const handleFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };

  // ----------------- Calculate Stats -----------------
  const totalStats = {
    total: unifiedTasks.length,
    pending: unifiedTasks.filter((t) =>
      ["pending", "not_started"].includes(t.status.toLowerCase())
    ).length,
    in_progress: unifiedTasks.filter((t) => t.status.toLowerCase() === "in_progress")
      .length,
    completed: unifiedTasks.filter((t) => t.status.toLowerCase() === "completed")
      .length,
  };

  // ----------------- Filter Tasks -----------------
  const filteredTasks = unifiedTasks
    .filter((task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.status.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((task) => (statusFilter ? task.status === statusFilter : true))
    .sort((a, b) => {
      // Sort by date
      if (a.dueDate === "No due date") return 1;
      if (b.dueDate === "No due date") return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const getNextButtonLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: "Confirm",
      not_started: "Start",
      confirmed: "Start Work",
      in_progress: "Complete",
    };
    return map[status.toLowerCase()] || "";
  };

  // ----------------- Render -----------------
  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        My Assigned Tasks
      </Typography>

      {/* Summary Cards */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
        {[
          {
            label: "Total Tasks",
            value: totalStats.total.toString(),
            color: "primary.main",
          },
          {
            label: "Pending",
            value: totalStats.pending.toString(),
            color: "error.main",
          },
          {
            label: "In Progress",
            value: totalStats.in_progress.toString(),
            color: "warning.main",
          },
          {
            label: "Completed",
            value: totalStats.completed.toString(),
            color: "success.main",
          },
        ].map((stat, i) => (
          <Box
            key={i}
            sx={{
              flex: { xs: "0 0 calc(50% - 12px)", sm: "0 0 calc(25% - 18px)" },
            }}
          >
            <Card>
              <CardContent>
                <Typography
                  variant="h4"
                  sx={{
                    color: stat.color,
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ textAlign: "center", color: "text.secondary" }}
                >
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Search and Filter */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="status-filter-label">
            <FilterListIcon sx={{ mr: 1 }} />
            Status Filter
          </InputLabel>
          <Select
            labelId="status-filter-label"
            value={statusFilter}
            onChange={handleFilterChange}
            label="Status Filter"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="not_started">Not Started</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Loading & Error States */}
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Task Title</strong></TableCell>
                <TableCell><strong>Vehicle</strong></TableCell>
                <TableCell><strong>Due Date & Time</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No tasks assigned to you
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task) => {
                  const nextButtonLabel = getNextButtonLabel(task.status);

                  return (
                    <TableRow key={`${task.type}-${task.id}`}>
                      <TableCell>
                        <Typography variant="subtitle2">{task.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {task.type === "appointment" ? "Customer Appointment" : "Project Task"}
                        </Typography>
                      </TableCell>
                      <TableCell>{task.vehicle}</TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {task.dueDate === "No due date"
                            ? "No due date"
                            : new Date(task.dueDate).toLocaleDateString()}
                        </Typography>
                        {task.dueTime && (
                          <Typography variant="caption" color="text.secondary">
                            {task.dueTime}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={formatStatus(task.status)}
                          color={getStatusColor(task.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => {
                              setSelectedTask(task);
                              setDetailsDialogOpen(true);
                            }}
                          >
                            View
                          </Button>

                          {task.status !== "completed" && nextButtonLabel && (
                            <Button
                              variant="contained"
                              size="small"
                              color="success"
                              onClick={() => handleStatusChange(task)}
                            >
                              {nextButtonLabel}
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>

      {/* Task Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedTask && (
          <>
            <DialogTitle>
              <Typography variant="h6">Task Details</Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedTask.type === "appointment" ? "Customer Appointment" : "Project Task"}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                {selectedTask.type === "appointment" ? (
                  <>
                    {/* Appointment Details */}
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Service Type
                      </Typography>
                      <Typography>
                        {(selectedTask.originalData as AppointmentTask).appointment_type}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Customer
                      </Typography>
                      <Typography>
                        {(selectedTask.originalData as AppointmentTask).customer_name}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Vehicle
                      </Typography>
                      <Typography>{selectedTask.vehicle}</Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Scheduled Date & Time
                      </Typography>
                      <Typography>
                        {new Date(selectedTask.dueDate).toLocaleDateString()} at{" "}
                        {selectedTask.dueTime}
                      </Typography>
                    </Box>
                    <Divider />
                    {(selectedTask.originalData as AppointmentTask).service_description && (
                      <>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Service Description
                          </Typography>
                          <Typography>
                            {(selectedTask.originalData as AppointmentTask).service_description}
                          </Typography>
                        </Box>
                        <Divider />
                      </>
                    )}
                    {(selectedTask.originalData as AppointmentTask).customer_notes && (
                      <>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Customer Notes
                          </Typography>
                          <Typography>
                            {(selectedTask.originalData as AppointmentTask).customer_notes}
                          </Typography>
                        </Box>
                        <Divider />
                      </>
                    )}
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={formatStatus(selectedTask.status)}
                        color={getStatusColor(selectedTask.status)}
                        size="small"
                      />
                    </Box>
                  </>
                ) : (
                  <>
                    {/* Project Task Details */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <BuildIcon color="action" />
                      <Box>
                        <Typography variant="subtitle2">Task Title</Typography>
                        <Typography>{selectedTask.title}</Typography>
                      </Box>
                    </Box>
                    <Divider />
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                      <DescriptionIcon color="action" />
                      <Box>
                        <Typography variant="subtitle2">Description</Typography>
                        <Typography>
                          {(selectedTask.originalData as ProjectTask).description}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarTodayIcon color="action" />
                      <Box>
                        <Typography variant="subtitle2">Due Date</Typography>
                        <Typography>
                          {selectedTask.dueDate === "No due date"
                            ? "No due date set"
                            : new Date(selectedTask.dueDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2">Priority</Typography>
                      <Typography
                        sx={{
                          color: getPriorityColor(
                            (selectedTask.originalData as ProjectTask).priority
                          ),
                          fontWeight: "bold",
                        }}
                      >
                        {(selectedTask.originalData as ProjectTask).priority
                          .charAt(0)
                          .toUpperCase() +
                          (selectedTask.originalData as ProjectTask).priority.slice(1)}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2">Status</Typography>
                      <Chip
                        label={formatStatus(selectedTask.status)}
                        color={getStatusColor(selectedTask.status)}
                        size="small"
                      />
                    </Box>
                    <Divider />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccessTimeIcon color="action" />
                      <Box>
                        <Typography variant="subtitle2">Created</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(
                            (selectedTask.originalData as ProjectTask).created_at
                          ).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              {selectedTask.status !== "completed" && getNextButtonLabel(selectedTask.status) && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => {
                    handleStatusChange(selectedTask);
                    setDetailsDialogOpen(false);
                  }}
                >
                  {getNextButtonLabel(selectedTask.status)}
                </Button>
              )}
              <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default MyTasks;
