import React, { useState, useEffect } from "react";
import type { SelectChangeEvent } from "@mui/material";
import apiClient, { handleApiError } from "../../services/apiService";
import { API_ENDPOINTS } from "../../config/api.config";
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
} from "@mui/material";
import TaskDetailsDialog from "./TaskDetailsDialog";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FilterListIcon from "@mui/icons-material/FilterList";
import type { VehicleDetails } from "../../types";

// ----------------- Types -----------------
interface Task {
  id: string;
  appointment_type: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  customer_name: string;
  vehicle_details: VehicleDetails;
  customer_details?: any;
  service_description?: string;
  customer_notes?: string;
  internal_notes?: string;
  estimated_cost?: number;
  duration_minutes?: number;
  assigned_employee_id?: string;
  employee_name?: string;
}

// ----------------- Component -----------------
const CustomerRequests: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
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
    const fetchAssignedTasks = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await apiClient.get(API_ENDPOINTS.APPOINTMENTS.LIST);
        console.log("✅ Appointments response:", response.data);

        // Convert EnhancedTask to Task format
        const appointmentResults = response.data.results || [];
        const tasks: Task[] = appointmentResults.map((task: any) => ({
          id: task.id,
          appointment_type: task.appointment_type,
          scheduled_date: task.scheduled_date,
          scheduled_time: task.scheduled_time,
          status: task.status,
          customer_name: task.customer_name || "Unknown Customer",
          vehicle_details: task.vehicle_details,
          customer_details: task.customer_details,
          service_description: task.service_description,
          customer_notes: task.customer_notes,
          internal_notes: task.internal_notes,
          estimated_cost: task.estimated_cost,
          duration_minutes: task.duration_minutes,
          assigned_employee_id: task.assigned_employee_id,
          employee_name: task.employee_name,
        }));

        setTasks(tasks);
      } catch (error) {
        console.error("⚠️ Error fetching assigned tasks:", error);
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

    fetchAssignedTasks();
  }, []);

  // ----------------- Update Status via Enhanced Service -----------------
  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      console.log(`🔄 Updating task ${taskId} status to ${newStatus}`);

      const response = await apiClient.patch(
        API_ENDPOINTS.APPOINTMENTS.DETAIL(taskId),
        { status: newStatus.toLowerCase() }
      );

      console.log("✅ Status update response:", response.data);

      // Update frontend immediately
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? { ...task, status: newStatus.toLowerCase() }
            : task
        )
      );

      setSnackbar({
        open: true,
        message: `Status updated to ${formatStatus(newStatus)}`,
        severity: "success",
      });
    } catch (error) {
      console.error("❌ Error updating status:", error);
      const errorMessage = handleApiError(error);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  // ----------------- Status Helpers -----------------
  const handleStatusChange = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const nextStatus = getNextStatus(task.status);
    if (!nextStatus) return;

    updateTaskStatus(taskId, nextStatus);
  };

  // ✅ Backend-compatible status flow
  const getNextStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "confirmed";
      case "confirmed":
        return "in_progress";
      case "in_progress":
        return "completed";
      default:
        return "";
    }
  };

  const formatStatus = (status: string) => {
    const map: Record<string, string> = {
      pending: "Pending Confirmation",
      confirmed: "Confirmed",
      in_progress: "In Progress",
      completed: "Completed",
      cancelled: "Cancelled",
      no_show: "No Show",
    };
    return map[status.toLowerCase()] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success";
      case "in_progress":
        return "warning";
      case "confirmed":
        return "info";
      case "pending":
        return "error";
      default:
        return "default";
    }
  };

  const handleFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };

  // ----------------- Totals + Filter -----------------
  const getTotalsByStatus = () => {
    return tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const totals = getTotalsByStatus();

  const filteredTasks = tasks
    .filter((task) =>
      Object.values(task).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .filter((task) => (statusFilter ? task.status === statusFilter : true));

  // ----------------- Render -----------------
  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Summary Cards */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
        {[
          {
            label: "Total",
            value: tasks.length.toString(),
            color: "primary.main",
          },
          {
            label: "Pending",
            value: (totals["pending"] || 0).toString(),
            color: "error.main",
          },
          {
            label: "Confirmed",
            value: (totals["confirmed"] || 0).toString(),
            color: "info.main",
          },
          {
            label: "In Progress",
            value: (totals["in_progress"] || 0).toString(),
            color: "warning.main",
          },
          {
            label: "Completed",
            value: (totals["completed"] || 0).toString(),
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
                <TableCell>Service Type</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTasks.map((task) => {
                const nextStatusLabelMap: Record<string, string> = {
                  pending: "Confirm",
                  confirmed: "Start Work",
                  in_progress: "Complete",
                };
                const nextButtonLabel =
                  nextStatusLabelMap[task.status.toLowerCase()] || "";

                return (
                  <TableRow key={task.id}>
                    <TableCell>{task.appointment_type}</TableCell>
                    <TableCell>{task.customer_name}</TableCell>
                    <TableCell>
                      {typeof task.vehicle_details === "string"
                        ? task.vehicle_details
                        : "Unknown Vehicle"}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {task.scheduled_date}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {task.scheduled_time}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={formatStatus(task.status)}
                        color={getStatusColor(task.status) as any}
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

                        {/* ✅ Dynamic Next-Status Button */}
                        {task.status !== "completed" && nextButtonLabel && (
                          <Button
                            variant="contained"
                            size="small"
                            color="success"
                            onClick={() => handleStatusChange(task.id)}
                          >
                            {nextButtonLabel}
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
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
      <TaskDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        task={selectedTask}
      />
    </Box>
  );
};

export default CustomerRequests;
