import React, { useState, useEffect } from "react";
import type { SelectChangeEvent } from "@mui/material";
import apiClient, { handleApiError } from "../../services/apiService";
import { API_ENDPOINTS } from "../../config/api.config";
import {
  getEmployeeTasks,
  type Task as ProjectTask,
} from "../../services/projectService";
import { getUserFromToken } from "../../services/authService";
import { timelogService } from "../../services/timelogService";
import type { TimeLog } from "../../types";
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
  const [appointmentTasks, setAppointmentTasks] = useState<AppointmentTask[]>(
    []
  );
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
  
  // Time log tracking
  const [activeTimeLogs, setActiveTimeLogs] = useState<Map<string, TimeLog>>(new Map());
  const [timerSeconds, setTimerSeconds] = useState<Map<string, number>>(new Map());

  // Format time display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  // Timer effect - increments timer for in-progress tasks
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        const updated = new Map(prev);
        let hasChanges = false;

        for (const [taskKey, log] of activeTimeLogs) {
          if (log.status === 'inprogress') {
            const currentSeconds = updated.get(taskKey) || 0;
            updated.set(taskKey, currentSeconds + 1);
            hasChanges = true;
          }
        }

        return hasChanges ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimeLogs]);

  // ----------------- Fetch Data -----------------
  useEffect(() => {
    fetchAllTasks();
    fetchActiveTimeLogs();
  }, []);

  const fetchAllTasks = async () => {
    setLoading(true);
    setError("");

    try {
      // Get logged-in employee ID
      const user = getUserFromToken();
      const employeeId = user?.id;

      if (!employeeId) {
        setError("Unable to identify logged-in employee");
        setLoading(false);
        return;
      }

      // Fetch appointments assigned to this employee with retry logic
      let appointmentResponse;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount <= maxRetries) {
        try {
          appointmentResponse = await apiClient.get(
            `${API_ENDPOINTS.APPOINTMENTS.LIST}?employee_id=${employeeId}`,
            {
              timeout: retryCount === 0 ? 10000 : 20000 + (retryCount * 10000) // Increase timeout with retries
            }
          );
          break; // Success, exit retry loop
        } catch (error) {
          retryCount++;
          console.warn(`⚠️ Appointment fetch attempt ${retryCount} failed:`, error);
          
          if (retryCount > maxRetries) {
            // If all retries failed, continue with empty appointments
            console.error("⚠️ All appointment fetch retries failed, continuing with empty appointments");
            appointmentResponse = { data: { results: [] } };
            break;
          }
          
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }

      // Fetch project tasks (already filtered by backend for logged-in employee)
      const projectTasksData = await getEmployeeTasks().catch(() => []);

      const appointmentResults = appointmentResponse?.data?.results || [];
      const appointments: AppointmentTask[] = appointmentResults.map(
        (task: Record<string, unknown>) => ({
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
        })
      );

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
  
  const fetchActiveTimeLogs = async () => {
    try {
      const logs = await timelogService.getAllTimeLogs();
      const activeLogsMap = new Map<string, TimeLog>();
      const timerSecondsMap = new Map<string, number>();
      
      logs.forEach((log) => {
        if (log.status === 'inprogress' || log.status === 'paused' || log.status === 'completed') {
          const taskKey = `${log.task_type}-${log.task_type === 'appointment' ? log.appointment_id : log.project_id}`;
          activeLogsMap.set(taskKey, log);
          
          // Initialize timer seconds based on status
          if (log.status === 'inprogress' && log.start_time) {
            // For in-progress: accumulated duration + current session time
            const startTime = new Date(log.start_time).getTime();
            const currentTime = new Date().getTime();
            const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
            const totalSeconds = (log.duration_seconds || 0) + elapsedSeconds;
            timerSecondsMap.set(taskKey, totalSeconds);
          } else if (log.status === 'paused' || log.status === 'completed') {
            // For paused/completed: just use the accumulated duration
            timerSecondsMap.set(taskKey, log.duration_seconds || 0);
          }
        }
      });
      
      setActiveTimeLogs(activeLogsMap);
      setTimerSeconds(timerSecondsMap);
    } catch (error) {
      console.error("Error fetching active time logs:", error);
    }
  };

  // ----------------- Convert to Unified Format -----------------
  const unifiedTasks: UnifiedTask[] = [
    ...appointmentTasks.map((task) => ({
      id: task.id,
      type: "appointment" as const,
      title: task.appointment_type,
      vehicle:
        typeof task.vehicle_details === "string"
          ? task.vehicle_details
          : "Unknown Vehicle",
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
      const errorMessage = handleApiError(error);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const updateProjectTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await apiClient.patch(`/api/v1/projects/tasks/${taskId}/`, {
        status: newStatus.toLowerCase(),
      });

      setProjectTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.task_id === taskId
            ? { 
                ...task, 
                status: newStatus.toLowerCase() as "not_started" | "in_progress" | "completed" | "blocked"
              }
            : task
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

    // ----------------- Complete Task Function -----------------
  
  const completeTask = async (task: UnifiedTask) => {
    try {
      const taskKey = `${task.type}-${task.id}`;
      const log = activeTimeLogs.get(taskKey);
      
      if (log) {
        // Complete the time log
        await timelogService.completeTimeLog(log.log_id);
        
        // Remove from active logs
        setActiveTimeLogs((prev) => {
          const updated = new Map(prev);
          updated.delete(taskKey);
          return updated;
        });
        
        // Remove timer seconds
        setTimerSeconds((prev) => {
          const updated = new Map(prev);
          updated.delete(taskKey);
          return updated;
        });
      }
      
      // Update task status to completed
      if (task.type === 'appointment') {
        await updateAppointmentStatus(task.id, 'completed');
      } else {
        await updateProjectTaskStatus(task.id, 'completed');
      }
      
      setSnackbar({
        open: true,
        message: "Task completed successfully!",
        severity: "success",
      });
      
      // Refresh tasks to show the completed task
      await fetchAllTasks();
    } catch (error) {
      const errorMessage = handleApiError(error);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };
  
  const getTaskKey = (task: UnifiedTask): string => {
    return `${task.type}-${task.id}`;
  };

  // Helper function to get active time logs as array
  const getActiveTimeLogsArray = (): TimeLog[] => {
    const logs: TimeLog[] = [];
    activeTimeLogs.forEach((log) => {
      logs.push(log);
    });
    return logs;
  };

  // Helper function to check if any tasks have active or paused timers
  const hasActiveOrPausedTimers = (): boolean => {
    const logs = getActiveTimeLogsArray();
    return logs.some(log => log.status === 'inprogress' || log.status === 'paused');
  };

  // ----------------- Status Helpers -----------------
  const handleStatusChange = async (task: UnifiedTask) => {
    try {
      if (task.type === "appointment") {
        const nextStatus = getNextStatus(task.status);
        if (nextStatus) {
          // If moving to in_progress, create a time log entry
          if (nextStatus === "in_progress") {
            // Create new time log entry to copy task to TimeLogs
            const newLog = await timelogService.createTimeLog({
              task_type: task.type,
              appointment_id: task.id,
              description: task.title,
              vehicle: task.vehicle,
              service: (task.originalData as AppointmentTask).appointment_type,
              start_time: new Date().toISOString(),
              status: 'inprogress',
            });
            
            const taskKey = `${task.type}-${task.id}`;
            setActiveTimeLogs((prev) => new Map(prev).set(taskKey, newLog));
            setTimerSeconds((prev) => new Map(prev).set(taskKey, 0));
            
            setSnackbar({
              open: true,
              message: "Task started and copied to Time Logs page!",
              severity: "success",
            });
          }
          
          // Update appointment status
          await updateAppointmentStatus(task.id, nextStatus);
          await fetchAllTasks(); // Refresh to show updated status
        }
      } else if (task.type === "project") {
        // Handle project tasks if needed
        const nextStatus = getNextStatus(task.status);
        if (nextStatus && nextStatus === "in_progress") {
          // Create new time log entry to copy task to TimeLogs
          const newLog = await timelogService.createTimeLog({
            task_type: task.type,
            project_id: task.id,
            description: task.title,
            vehicle: task.vehicle,
            start_time: new Date().toISOString(),
            status: 'inprogress',
          });
          
          const taskKey = `${task.type}-${task.id}`;
          setActiveTimeLogs((prev) => new Map(prev).set(taskKey, newLog));
          setTimerSeconds((prev) => new Map(prev).set(taskKey, 0));
          
          setSnackbar({
            open: true,
            message: "Task started and copied to Time Logs page!",
            severity: "success",
          });
          
          // Update project task status
          await updateProjectTaskStatus(task.id, nextStatus);
          await fetchAllTasks(); // Refresh to show updated status
        }
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
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
      not_started: "Confirmed",
      in_progress: "In Progress",
      completed: "Completed",
      cancelled: "Cancelled",
      no_show: "No Show",
    };
    return map[status.toLowerCase()] || status;
  };

  const getStatusColor = (
    status: string
  ): "default" | "error" | "warning" | "info" | "success" | "secondary" => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success";
      case "in_progress":
        return "warning";
      case "confirmed":
      case "not_started":
        return "info";
      case "no_show":
        return "secondary";
      case "pending":
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
  // Filter out tasks that have completed time logs (they shouldn't count as in_progress)
  const tasksToCount = unifiedTasks.filter((task) => {
    const taskKey = getTaskKey(task);
    const log = activeTimeLogs.get(taskKey);
    // If there's a completed time log, the task should be counted as completed regardless of its status
    if (log && log.status === 'completed') {
      return false; // Don't count this task in its original status
    }
    return true;
  });

  const totalStats = {
    total: unifiedTasks.length,
    pending: tasksToCount.filter((t) =>
      ["pending", "not_started"].includes(t.status.toLowerCase())
    ).length,
    in_progress: tasksToCount.filter(
      (t) => t.status.toLowerCase() === "in_progress"
    ).length,
    completed: unifiedTasks.filter(
      (t) => {
        const taskKey = getTaskKey(t);
        const log = activeTimeLogs.get(taskKey);
        // Count as completed if status is completed OR if there's a completed time log
        return t.status.toLowerCase() === "completed" || (log && log.status === 'completed');
      }
    ).length,
  };

  // Debug: Log tasks with in_progress status
  useEffect(() => {
    const inProgressTasks = unifiedTasks.filter(
      (t) => t.status.toLowerCase() === "in_progress"
    );
    if (inProgressTasks.length > 0) {
      console.log("Tasks with 'in_progress' status:", inProgressTasks);
      console.log("Active time logs:", Array.from(activeTimeLogs.entries()));
    }
  }, [unifiedTasks, activeTimeLogs]);

  // Helper function to parse due date and time for sorting
  const parseDueDateTime = (task: UnifiedTask): number => {
    if (task.dueDate === "No due date") return Infinity; // Push to end
    try {
      const dateStr = task.dueDate; // Format: "11/7/2025" or similar
      const timeStr = task.dueTime || "00:00"; // Format: "HH:MM"
      const dateTimeParts = dateStr.split('/');
      const month = parseInt(dateTimeParts[0]) - 1; // JS months are 0-indexed
      const day = parseInt(dateTimeParts[1]);
      const year = parseInt(dateTimeParts[2]);
      const timeParts = timeStr.split(':');
      const hours = parseInt(timeParts[0]);
      const minutes = parseInt(timeParts[1]) || 0;
      return new Date(year, month, day, hours, minutes).getTime();
    } catch {
      return Infinity;
    }
  };

  // ----------------- Filter Tasks -----------------
  const filteredTasks = unifiedTasks
    .filter(
      (task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.status.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((task) => (statusFilter ? task.status === statusFilter : true))
    // Sort by due date and time - earliest due first
    .sort((a, b) => {
      const timeA = parseDueDateTime(a);
      const timeB = parseDueDateTime(b);
      return timeA - timeB;
    });

  const getNextButtonLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: "Confirm",
      not_started: "Start Work",
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
              flex: { xs: "0 0 calc(50% - 12px)", sm: "0 0 calc(33.333% - 16px)" },
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
                <TableCell>
                  <strong>Task Title</strong>
                </TableCell>
                <TableCell>
                  <strong>Vehicle</strong>
                </TableCell>
                <TableCell>
                  <strong>Due Date & Time</strong>
                </TableCell>
                <TableCell>
                  <strong>Status</strong>
                </TableCell>
                {/* Only show Timer column if there are any active or paused tasks */}
                {hasActiveOrPausedTimers() && (
                  <TableCell>
                    <strong>Timer</strong>
                  </TableCell>
                )}
                <TableCell>
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={hasActiveOrPausedTimers() ? 6 : 5} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No tasks assigned to you
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task) => {
                  const nextButtonLabel = getNextButtonLabel(task.status);
                  const taskKey = getTaskKey(task);
                  const activeLog = activeTimeLogs.get(taskKey);
                  
                  // Check if THIS task is the one in progress
                  const isThisTaskInProgress = activeLog?.status === 'inprogress';
                  
                  // Check if THIS task is paused
                  const isThisTaskPaused = activeLog?.status === 'paused';

                  return (
                    <TableRow 
                      key={`${task.type}-${task.id}`}
                      sx={{
                        backgroundColor: isThisTaskInProgress ? 'rgba(76, 175, 80, 0.08)' : 'inherit',
                        '&:hover': {
                          backgroundColor: isThisTaskInProgress ? 'rgba(76, 175, 80, 0.12)' : 'inherit',
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box>
                            <Typography variant="subtitle2">
                              {task.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {task.type === "appointment"
                                ? "Customer Appointment"
                                : "Project Task"}
                            </Typography>
                          </Box>
                          {isThisTaskInProgress && (
                            <Chip 
                              label="IN PROGRESS" 
                              size="small" 
                              color="success" 
                              sx={{ ml: 1, fontWeight: 'bold' }}
                            />
                          )}
                          {isThisTaskPaused && (
                            <Chip 
                              label="PAUSED" 
                              size="small" 
                              color="warning" 
                              sx={{ ml: 1, fontWeight: 'bold' }}
                            />
                          )}
                        </Box>
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
                        {/* Display status based on time log status if exists */}
                        {activeLog?.status === 'completed' ? (
                          <Chip
                            label="Completed"
                            color="success" 
                            size="small"
                            icon={<CheckCircleIcon />}
                          />
                        ) : activeLog?.status === 'inprogress' ? (
                          <Chip
                            label="In Progress"
                            color="warning"
                            size="small"
                            icon={<BuildIcon />}
                          />
                        ) : activeLog?.status === 'paused' ? (
                          <Chip
                            label="Paused"
                            color="warning"
                            size="small"
                            icon={<AccessTimeIcon />}
                          />
                        ) : (
                          <Chip
                            label={formatStatus(task.status)}
                            color={getStatusColor(task.status)}
                            size="small"
                          />
                        )}
                      </TableCell>
                      {/* Only show Timer column if there are any active or paused tasks */}
                      {hasActiveOrPausedTimers() && (
                        <TableCell>
                          {activeLog && isThisTaskInProgress ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AccessTimeIcon color="success" />
                              <Typography variant="body2" color="success.main">
                                {formatTime(timerSeconds.get(taskKey) || 0)}
                              </Typography>
                            </Box>
                          ) : activeLog && isThisTaskPaused ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AccessTimeIcon color="warning" />
                              <Typography variant="body2" color="warning.main">
                                {formatTime(timerSeconds.get(taskKey) || 0)} (Paused)
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              --
                            </Typography>
                          )}
                        </TableCell>
                      )}
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

                          {/* Show Complete button for in-progress tasks */}
                          {activeLog?.status === 'inprogress' ? (
                            <Button
                              variant="contained"
                              size="small"
                              color="success"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => completeTask(task)}
                            >
                              Complete
                            </Button>
                          ) : (
                            /* Show action buttons only for non-completed tasks */
                            activeLog?.status !== 'completed' && 
                            task.status !== "completed" && 
                            nextButtonLabel && (
                              <Button
                                variant="contained"
                                size="small"
                                color="success"
                                onClick={() => handleStatusChange(task)}
                              >
                                {nextButtonLabel}
                              </Button>
                            )
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
        maxWidth="sm"
        fullWidth
      >
        {selectedTask && (
          <>
            <DialogTitle>
              <Typography variant="h6">Task Details</Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedTask.type === "appointment"
                  ? "Customer Appointment"
                  : "Project Task"}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                {/* Task Title */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <BuildIcon color="action" />
                  <Box>
                    <Typography variant="subtitle2">
                      {selectedTask.type === "appointment" ? "Service Type" : "Task Title"}
                    </Typography>
                    <Typography>{selectedTask.title}</Typography>
                  </Box>
                </Box>
                <Divider />

                {/* Description */}
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                  <DescriptionIcon color="action" />
                  <Box>
                    <Typography variant="subtitle2">Description</Typography>
                    <Typography>
                      {selectedTask.type === "appointment"
                        ? (selectedTask.originalData as AppointmentTask).service_description || 
                          (selectedTask.originalData as AppointmentTask).customer_notes || 
                          "No description available"
                        : (selectedTask.originalData as ProjectTask).description || "No description available"}
                    </Typography>
                  </Box>
                </Box>
                <Divider />

                {/* Due Date */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarTodayIcon color="action" />
                  <Box>
                    <Typography variant="subtitle2">
                      {selectedTask.type === "appointment" ? "Scheduled Date & Time" : "Due Date"}
                    </Typography>
                    <Typography>
                      {selectedTask.type === "appointment"
                        ? `${new Date(selectedTask.dueDate).toLocaleDateString()} at ${selectedTask.dueTime}`
                        : selectedTask.dueDate === "No due date"
                        ? "No due date set"
                        : new Date(selectedTask.dueDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
                <Divider />

                {/* Priority (only for project tasks) */}
                {selectedTask.type === "project" && (
                  <>
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
                  </>
                )}

                {/* Status */}
                <Box>
                  <Typography variant="subtitle2">Status</Typography>
                  <Chip
                    label={formatStatus(selectedTask.status)}
                    color={getStatusColor(selectedTask.status)}
                    size="small"
                  />
                </Box>
                <Divider />

                {/* Created Date */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AccessTimeIcon color="action" />
                  <Box>
                    <Typography variant="subtitle2">Created</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedTask.type === "appointment"
                        ? new Date((selectedTask.originalData as AppointmentTask).scheduled_date).toLocaleString()
                        : new Date((selectedTask.originalData as ProjectTask).created_at).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              {/* Get active log for this task */}
              {(() => {
                const taskKey = getTaskKey(selectedTask);
                const activeLog = activeTimeLogs.get(taskKey);
                
                return (
                  <>
                    {/* Show action buttons only for non-completed tasks */}
                    {activeLog?.status !== 'completed' &&
                      selectedTask.status !== "completed" &&
                      selectedTask.status !== "no_show" &&
                      getNextButtonLabel(selectedTask.status) && (
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
                    {/* Show No Show button only for non-completed tasks */}
                    {activeLog?.status !== 'completed' &&
                      (selectedTask.status === "confirmed" || selectedTask.status === "not_started") && (
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={async () => {
                            try {
                              if (selectedTask.type === "appointment") {
                                await updateAppointmentStatus(selectedTask.id, "no_show");
                              } else {
                                await updateProjectTaskStatus(selectedTask.id, "no_show");
                              }
                              setDetailsDialogOpen(false);
                            } catch (error) {
                              console.error("Error marking as no show:", error);
                            }
                          }}
                        >
                          Mark as No Show
                        </Button>
                      )}
                  </>
                );
              })()}
              <Button color="error" onClick={() => setDetailsDialogOpen(false)}>
                CLOSE
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default MyTasks;
