import React, { useState, useEffect } from "react";
import axios from "axios";
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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Assignment,
  Add,
  Edit,
  Delete,
  Visibility,
} from "@mui/icons-material";
import {
  getAllProjects,
  getPendingProjects,
  approveProject,
  rejectProject,
  assignEmployeeToProject,
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  getAllUsers,
  getAllVehicles,
  type Project,
  type Task,
  type User,
  type Vehicle,
} from "../../services/adminService";

interface ProjectStats {
  total_projects: number;
  pending_projects: number;
  active_projects: number;
  completed_projects: number;
  rejected_projects: number;
}

const ProjectManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statistics, setStatistics] = useState<ProjectStats>({
    total_projects: 0,
    pending_projects: 0,
    active_projects: 0,
    completed_projects: 0,
    rejected_projects: 0,
  });
  const [employees, setEmployees] = useState<User[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dialog states
  const [approveDialog, setApproveDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [assignDialog, setAssignDialog] = useState(false);
  const [taskDialog, setTaskDialog] = useState(false);
  const [viewProjectDialog, setViewProjectDialog] = useState(false);
  const [manageTasksDialog, setManageTasksDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTaskInManage, setNewTaskInManage] = useState({
    title: "",
    description: "",
    assigned_employee_id: "",
    due_date: "",
  });

  // Form states
  const [rejectReason, setRejectReason] = useState("");
  const [assignedEmployeeId, setAssignedEmployeeId] = useState("");
  const [approvalTasks, setApprovalTasks] = useState<
    Array<{
      id: string;
      title: string;
      description: string;
      assigned_employee_id: string;
      due_date: string;
    }>
  >([]);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "not_started" as
      | "not_started"
      | "in_progress"
      | "completed"
      | "blocked",
    assigned_employee_id: "",
    due_date: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load projects, employees, customers, and vehicles
      const [allProjects, pendingProjs, employeesData, customersData, vehiclesData] =
        await Promise.all([
          getAllProjects(),
          getPendingProjects(),
          getAllUsers("employee"),
          getAllUsers("customer"),
          getAllVehicles(),
        ]);

      console.log(
        `[${new Date().toISOString()}] Loaded projects:`,
        allProjects.length,
        "Pending:",
        pendingProjs.length
      );
      console.log(
        "Pending projects:",
        pendingProjs.map((p) => ({
          title: p.title,
          approval_status: p.approval_status,
          status: p.status,
        }))
      );
      setProjects(allProjects);
      setPendingProjects(pendingProjs);
      setEmployees(employeesData);
      setCustomers(customersData);
      setVehicles(vehiclesData);
      
      console.log("Loaded vehicles:", vehiclesData.length);
      console.log("Sample vehicle:", vehiclesData[0]);
      console.log("Sample project vehicle_id:", allProjects[0]?.vehicle_id);

      // Try to load tasks, but don't fail if the endpoint is not available
      try {
        const allTasks = await getAllTasks();
        setTasks(allTasks);
      } catch (taskErr) {
        console.warn("Tasks endpoint not available:", taskErr);
        setTasks([]);
      }

      // Calculate statistics
      const stats: ProjectStats = {
        total_projects: allProjects.length,
        pending_projects: pendingProjs.length,
        active_projects: allProjects.filter(
          (p: Project) => p.status === "in_progress"
        ).length,
        completed_projects: allProjects.filter(
          (p: Project) => p.status === "completed"
        ).length,
        rejected_projects: allProjects.filter(
          (p: Project) => p.status === "cancelled"
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

  const getCustomerName = (customerId: string): string => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      return `${customer.first_name} ${customer.last_name}`;
    }
    return customerId; // Fallback to ID if customer not found
  };

  const getEmployeeName = (employeeId: string): string => {
    const employee = employees.find((e) => e.id === employeeId);
    if (employee) {
      return `${employee.first_name} ${employee.last_name}`;
    }
    return employeeId; // Fallback to ID if employee not found
  };

  const getVehicleName = (vehicleId: string): string => {
    const vehicle = vehicles.find((v) => v.id === vehicleId || v.vehicle_id === vehicleId);
    if (vehicle) {
      const plateNumber = vehicle.plate_number || "No Plate";
      return `${vehicle.make} ${vehicle.model} (${plateNumber})`;
    }
    // Fallback: return ID if vehicle not found
    return `Vehicle ID: ${vehicleId}`;
  };

  const handleApproveClick = (project: Project) => {
    console.log("Selected project for approval:", project);
    setSelectedProject(project);
    setApprovalTasks([
      {
        id: Date.now().toString(),
        title: "",
        description: "",
        assigned_employee_id: "",
        due_date: "",
      },
    ]);
    setApproveDialog(true);
  };

  const addApprovalTask = () => {
    setApprovalTasks([
      ...approvalTasks,
      {
        id: Date.now().toString(),
        title: "",
        description: "",
        assigned_employee_id: "",
        due_date: "",
      },
    ]);
  };

  const removeApprovalTask = (taskId: string) => {
    setApprovalTasks(approvalTasks.filter((t) => t.id !== taskId));
  };

  const updateApprovalTask = (taskId: string, field: string, value: string) => {
    setApprovalTasks(
      approvalTasks.map((t) => (t.id === taskId ? { ...t, [field]: value } : t))
    );
  };

  const handleApprove = async () => {
    if (!selectedProject) {
      setError("No project selected");
      return;
    }

    // Validate that at least one task has both title and assigned employee
    const validTasks = approvalTasks.filter(
      (t) => t.title.trim() !== "" && t.assigned_employee_id !== ""
    );

    if (validTasks.length === 0) {
      setError(
        "At least one task with a title and assigned employee is required to approve a project"
      );
      return;
    }

    // Validate each task
    for (let i = 0; i < approvalTasks.length; i++) {
      const task = approvalTasks[i];
      if (task.title.trim() !== "") {
        // If task has a title, it must have an assigned employee
        if (!task.assigned_employee_id) {
          setError(`Task ${i + 1}: Please assign an employee`);
          return;
        }
        if (task.title.trim().length < 3) {
          setError(`Task ${i + 1}: Title must be at least 3 characters`);
          return;
        }
      }
    }

    try {
      setLoading(true);

      const projectId = selectedProject.project_id || selectedProject.id;
      console.log("Approving project:", projectId);
      if (!projectId) {
        throw new Error("Project ID is missing");
      }

      // Prepare tasks for the API (only include tasks with titles)
      const tasksPayload = validTasks.map((task) => ({
        title: task.title,
        description: task.description || "",
        assigned_employee_id: task.assigned_employee_id,
        priority: "medium",
        ...(task.due_date && { due_date: task.due_date }),
      }));

      console.log("Approving with tasks:", tasksPayload);

      // Approve project with tasks in a single API call
      await approveProject(projectId, tasksPayload);

      setSuccess(
        `Project approved successfully with ${validTasks.length} task(s) created`
      );
      setApproveDialog(false);
      setApprovalTasks([]);
      await loadData();
    } catch (err) {
      console.error("Approve error:", err);

      let errorMsg = "Failed to approve project";

      if (axios.isAxiosError(err)) {
        console.error("Error response:", err.response?.data);
        console.error("Error status:", err.response?.status);
        console.error("Error headers:", err.response?.headers);

        if (err.response?.data?.error) {
          errorMsg = err.response.data.error;
        } else if (err.response?.data?.details) {
          // Handle detailed errors from task creation
          const details = err.response.data.details;
          if (typeof details === "object") {
            errorMsg = `Failed to approve project: ${JSON.stringify(details)}`;
          } else {
            errorMsg = `Failed to approve project: ${details}`;
          }
        } else if (err.response?.data?.detail) {
          errorMsg = err.response.data.detail;
        } else if (err.response?.status === 403) {
          errorMsg = "Access denied. You don't have admin permissions.";
        }
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectClick = (project: Project) => {
    setSelectedProject(project);
    setRejectReason("");
    setRejectDialog(true);
  };

  const handleReject = async () => {
    if (!selectedProject) return;

    try {
      setLoading(true);
      const projectId = selectedProject.project_id || selectedProject.id;
      if (!projectId) {
        throw new Error("Project ID is missing");
      }
      await rejectProject(projectId, rejectReason);
      setSuccess("Project rejected");
      setRejectDialog(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject project");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClick = (project: Project) => {
    setSelectedProject(project);
    setAssignedEmployeeId("");
    setAssignDialog(true);
  };

  const handleAssign = async () => {
    if (!selectedProject || !assignedEmployeeId) return;

    try {
      setLoading(true);
      const projectId = selectedProject.project_id || selectedProject.id;
      if (!projectId) {
        throw new Error("Project ID is missing");
      }
      await assignEmployeeToProject(projectId, assignedEmployeeId);
      setSuccess("Employee assigned successfully");
      setAssignDialog(false);
      loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to assign employee"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewProjectClick = (project: Project) => {
    setSelectedProject(project);
    setViewProjectDialog(true);
  };

  const handleManageTasksClick = (project: Project) => {
    setSelectedProject(project);
    setNewTaskInManage({
      title: "",
      description: "",
      assigned_employee_id: "",
      due_date: "",
    });
    setManageTasksDialog(true);
  };

  const handleAddTaskInManage = async () => {
    if (!selectedProject || !newTaskInManage.title) return;

    try {
      setLoading(true);
      const projectId = selectedProject.project_id || selectedProject.id;
      if (!projectId) {
        throw new Error("Project ID is missing");
      }
      await createTask({
        project: projectId,
        title: newTaskInManage.title,
        description: newTaskInManage.description,
        priority: "medium",
        due_date: newTaskInManage.due_date,
      });

      // If employee is assigned, assign them to the task
      if (newTaskInManage.assigned_employee_id) {
        // Note: You might need to implement task assignment after creation
        // For now, we'll reload the data
      }

      setSuccess("Task added successfully");
      setNewTaskInManage({
        title: "",
        description: "",
        assigned_employee_id: "",
        due_date: "",
      });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add task");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskForm({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "not_started",
      assigned_employee_id: task.assigned_employee_id || "",
      due_date: task.due_date || "",
    });
    setTaskDialog(true);
  };

  const handleUpdateTask = async () => {
    if (!selectedTask) return;

    try {
      setLoading(true);
      await updateTask(selectedTask.task_id || selectedTask.id!, taskForm);
      setSuccess("Task updated successfully");
      setTaskDialog(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      setLoading(true);
      await deleteTask(taskId);
      setSuccess("Task deleted successfully");
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
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
      case "in_progress":
        return "primary";
      case "completed":
        return "success";
      case "rejected":
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const renderProjectTable = (projectList: Project[]) => {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project Name</TableCell>
              <TableCell>Customer Name</TableCell>
              <TableCell>Vehicle</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projectList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No projects found
                </TableCell>
              </TableRow>
            ) : (
              projectList.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>{project.title}</TableCell>
                  <TableCell>{getCustomerName(project.customer_id)}</TableCell>
                  <TableCell>{getVehicleName(project.vehicle_id)}</TableCell>
                  <TableCell>
                    <Chip
                      label={project.status}
                      color={getStatusColor(project.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{project.created_at.split("T")[0]}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {project.status === "pending" ||
                      project.approval_status === "pending" ? (
                        <>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleApproveClick(project)}
                            title="Approve"
                          >
                            <CheckCircle />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRejectClick(project)}
                            title="Reject"
                          >
                            <Cancel />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleViewProjectClick(project)}
                            title="View Details"
                          >
                            <Visibility />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleViewProjectClick(project)}
                            title="View Details"
                          >
                            <Visibility />
                          </IconButton>
                          {project.status === "in_progress" && (
                            <>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleAssignClick(project)}
                                title="Assign Employee"
                              >
                                <Assignment />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => handleManageTasksClick(project)}
                                title="Manage Tasks"
                              >
                                <Add />
                              </IconButton>
                            </>
                          )}
                        </>
                      )}
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

  const renderTasksTable = () => {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Task Title</TableCell>
              <TableCell>Project/Appointment</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No tasks found
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>
                    {task.project || task.appointment || "N/A"}
                  </TableCell>
                  <TableCell>
                    {task.assigned_employee_id 
                      ? getEmployeeName(task.assigned_employee_id)
                      : "Unassigned"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.status.replace("_", " ")}
                      color={getStatusColor(task.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{task.due_date || "No deadline"}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditTaskClick(task)}
                        title="Edit"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() =>
                          handleDeleteTask(task.task_id || task.id!)
                        }
                        title="Delete"
                      >
                        <Delete />
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
        Project Management
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

      {/* Statistics Cards */}
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
            <Typography variant="h4">{statistics.total_projects}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: "warning.light" }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Pending
            </Typography>
            <Typography variant="h4">{statistics.pending_projects}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: "primary.light" }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Active
            </Typography>
            <Typography variant="h4">{statistics.active_projects}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: "success.light" }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Completed
            </Typography>
            <Typography variant="h4">
              {statistics.completed_projects}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: "error.light" }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Rejected
            </Typography>
            <Typography variant="h4">{statistics.rejected_projects}</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="All Projects" />
          <Tab label="Pending Approval" />
          <Tab label="All Tasks" />
        </Tabs>

        <CardContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {activeTab === 0 && renderProjectTable(projects)}
              {activeTab === 1 && renderProjectTable(pendingProjects)}
              {activeTab === 2 && renderTasksTable()}
            </>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog
        open={approveDialog}
        onClose={() => setApproveDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Approve Project & Add Tasks</DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Box sx={{ mt: 2 }}>
              {/* Project Details */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Project Details
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Project Name
                      </Typography>
                      <Typography variant="body1">
                        {selectedProject.title}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Customer
                      </Typography>
                      <Typography variant="body1">
                        {getCustomerName(selectedProject.customer_id)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Vehicle
                      </Typography>
                      <Typography variant="body1">
                        {getVehicleName(selectedProject.vehicle_id)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={selectedProject.status}
                        color={getStatusColor(selectedProject.status)}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ gridColumn: { xs: "1", md: "1 / -1" } }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Description
                      </Typography>
                      <Typography variant="body1">
                        {selectedProject.description}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Divider sx={{ my: 2 }} />

              {/* Tasks Section */}
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h6">
                      Create Tasks & Assign Employees
                    </Typography>
                    <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                      * At least one task with an assigned employee is required
                    </Typography>
                  </Box>
                  <Button
                    startIcon={<Add />}
                    onClick={addApprovalTask}
                    variant="outlined"
                    size="small"
                  >
                    Add Task
                  </Button>
                </Box>

                {approvalTasks.map((task, index) => (
                  <Card key={task.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography variant="subtitle1">
                          Task {index + 1}
                        </Typography>
                        {approvalTasks.length > 1 && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeApprovalTask(task.id)}
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </Box>
                      <TextField
                        fullWidth
                        label="Task Title"
                        value={task.title}
                        onChange={(e) =>
                          updateApprovalTask(task.id, "title", e.target.value)
                        }
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Description"
                        value={task.description}
                        onChange={(e) =>
                          updateApprovalTask(
                            task.id,
                            "description",
                            e.target.value
                          )
                        }
                        sx={{ mb: 2 }}
                      />
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                          gap: 2,
                        }}
                      >
                        <FormControl fullWidth required>
                          <InputLabel>Assign To Employee *</InputLabel>
                          <Select
                            value={task.assigned_employee_id}
                            onChange={(e) =>
                              updateApprovalTask(
                                task.id,
                                "assigned_employee_id",
                                e.target.value
                              )
                            }
                            label="Assign To Employee *"
                          >
                            <MenuItem value="">
                              <em>Select an employee</em>
                            </MenuItem>
                            {employees.map((emp) => (
                              <MenuItem key={emp.id} value={emp.id}>
                                {emp.first_name} {emp.last_name} ({emp.email})
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          fullWidth
                          type="date"
                          label="Due Date (Optional)"
                          value={task.due_date}
                          onChange={(e) =>
                            updateApprovalTask(
                              task.id,
                              "due_date",
                              e.target.value
                            )
                          }
                          InputLabelProps={{ shrink: true }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialog(false)}>Cancel</Button>
          <Button onClick={handleApprove} variant="contained" color="success">
            Approve Project
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialog}
        onClose={() => setRejectDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Project</DialogTitle>
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

      {/* Assign Employee Dialog */}
      <Dialog
        open={assignDialog}
        onClose={() => setAssignDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Employee to Project</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Employee</InputLabel>
            <Select
              value={assignedEmployeeId}
              onChange={(e) => setAssignedEmployeeId(e.target.value)}
              label="Select Employee"
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

      {/* View Project Dialog */}
      <Dialog
        open={viewProjectDialog}
        onClose={() => setViewProjectDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Project Details</DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Box sx={{ mt: 2 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Project Name
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedProject.title}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedProject.status}
                    color={getStatusColor(selectedProject.status)}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Customer Name
                  </Typography>
                  <Typography variant="body1">
                    {getCustomerName(selectedProject.customer_id)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Vehicle
                  </Typography>
                  <Typography variant="body1">
                    {getVehicleName(selectedProject.vehicle_id)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created Date
                  </Typography>
                  <Typography variant="body1">
                    {selectedProject.created_at.split("T")[0]}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Estimated Cost
                  </Typography>
                  <Typography variant="body1">
                    ${selectedProject.estimated_cost || 0}
                  </Typography>
                </Box>
                <Box sx={{ gridColumn: { xs: "1", md: "1 / -1" } }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {selectedProject.description}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Project Tasks
              </Typography>
              <List>
                {tasks.filter(
                  (t) =>
                    t.project ===
                    (selectedProject.project_id || selectedProject.id)
                ).length === 0 ? (
                  <Typography color="text.secondary">
                    No tasks created yet
                  </Typography>
                ) : (
                  tasks
                    .filter(
                      (t) =>
                        t.project ===
                        (selectedProject.project_id || selectedProject.id)
                    )
                    .map((task) => (
                      <ListItem key={task.task_id || task.id}>
                        <ListItemText
                          primary={task.title}
                          secondary={`Status: ${task.status} | Assigned: ${
                            task.assigned_employee_id 
                              ? getEmployeeName(task.assigned_employee_id)
                              : "Unassigned"
                          } | Due: ${task.due_date || "No deadline"}`}
                        />
                        <ListItemSecondaryAction>
                          <Chip
                            label={task.status.replace("_", " ")}
                            color={getStatusColor(task.status)}
                            size="small"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))
                )}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewProjectDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog
        open={taskDialog}
        onClose={() => setTaskDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Task Title"
              value={taskForm.title}
              onChange={(e) =>
                setTaskForm({ ...taskForm, title: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={taskForm.description}
              onChange={(e) =>
                setTaskForm({ ...taskForm, description: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={taskForm.status}
                onChange={(e) =>
                  setTaskForm({
                    ...taskForm,
                    status: e.target.value as
                      | "not_started"
                      | "in_progress"
                      | "completed"
                      | "blocked",
                  })
                }
                label="Status"
              >
                <MenuItem value="not_started">Not Started</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="date"
              label="Due Date"
              value={taskForm.due_date}
              onChange={(e) =>
                setTaskForm({ ...taskForm, due_date: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>Assign To Employee</InputLabel>
              <Select
                value={taskForm.assigned_employee_id}
                onChange={(e) =>
                  setTaskForm({
                    ...taskForm,
                    assigned_employee_id: e.target.value,
                  })
                }
                label="Assign To Employee"
              >
                <MenuItem value="">Unassigned</MenuItem>
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
          <Button onClick={() => setTaskDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateTask}
            variant="contained"
            color="primary"
          >
            Update Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Tasks Dialog */}
      <Dialog
        open={manageTasksDialog}
        onClose={() => setManageTasksDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Manage Tasks - {selectedProject?.title}</DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Box sx={{ mt: 2 }}>
              {/* Project Details Section */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Project Details
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Customer Name
                      </Typography>
                      <Typography variant="body1">
                        {getCustomerName(selectedProject.customer_id)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Vehicle
                      </Typography>
                      <Typography variant="body1">
                        {getVehicleName(selectedProject.vehicle_id)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={selectedProject.status}
                        color={getStatusColor(selectedProject.status)}
                        size="small"
                      />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Estimated Cost
                      </Typography>
                      <Typography variant="body1">
                        ${selectedProject.estimated_cost || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ gridColumn: { xs: "1", md: "1 / -1" } }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Description
                      </Typography>
                      <Typography variant="body1">
                        {selectedProject.description}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Divider sx={{ my: 3 }} />

              {/* Add New Task Section */}
              <Card
                sx={{
                  mb: 3,
                  bgcolor: "primary.light",
                  color: "primary.contrastText",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <Add /> Add New Task
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Task Title"
                      value={newTaskInManage.title}
                      onChange={(e) =>
                        setNewTaskInManage({
                          ...newTaskInManage,
                          title: e.target.value,
                        })
                      }
                      sx={{ mb: 2, bgcolor: "background.paper" }}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Description"
                      value={newTaskInManage.description}
                      onChange={(e) =>
                        setNewTaskInManage({
                          ...newTaskInManage,
                          description: e.target.value,
                        })
                      }
                      sx={{ mb: 2, bgcolor: "background.paper" }}
                    />
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        gap: 2,
                      }}
                    >
                      <FormControl
                        fullWidth
                        sx={{ bgcolor: "background.paper" }}
                      >
                        <InputLabel>Assign To Employee</InputLabel>
                        <Select
                          value={newTaskInManage.assigned_employee_id}
                          onChange={(e) =>
                            setNewTaskInManage({
                              ...newTaskInManage,
                              assigned_employee_id: e.target.value,
                            })
                          }
                          label="Assign To Employee"
                        >
                          <MenuItem value="">Unassigned</MenuItem>
                          {employees.map((emp) => (
                            <MenuItem key={emp.id} value={emp.id}>
                              {emp.first_name} {emp.last_name} ({emp.email})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        type="date"
                        label="Due Date"
                        value={newTaskInManage.due_date}
                        onChange={(e) =>
                          setNewTaskInManage({
                            ...newTaskInManage,
                            due_date: e.target.value,
                          })
                        }
                        InputLabelProps={{ shrink: true }}
                        sx={{ bgcolor: "background.paper" }}
                      />
                    </Box>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleAddTaskInManage}
                      disabled={!newTaskInManage.title}
                      sx={{ mt: 2 }}
                      startIcon={<Add />}
                    >
                      Add Task
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              <Divider sx={{ my: 3 }} />

              {/* Existing Tasks List */}
              <Typography variant="h6" gutterBottom>
                Existing Tasks
              </Typography>
              <List>
                {tasks.filter((t) => t.project === selectedProject.id)
                  .length === 0 ? (
                  <Typography color="text.secondary" sx={{ p: 2 }}>
                    No tasks created yet. Add your first task above!
                  </Typography>
                ) : (
                  tasks
                    .filter((t) => t.project === selectedProject.id)
                    .map((task) => (
                      <Card key={task.id} sx={{ mb: 2 }}>
                        <CardContent>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" gutterBottom>
                                {task.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                paragraph
                              >
                                {task.description}
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 2,
                                  flexWrap: "wrap",
                                  alignItems: "center",
                                }}
                              >
                                <Chip
                                  label={task.status.replace("_", " ")}
                                  color={getStatusColor(task.status)}
                                  size="small"
                                />
                                {task.assigned_employee_id && (
                                  <Typography variant="body2">
                                    👤 Assigned to: {getEmployeeName(task.assigned_employee_id)}
                                  </Typography>
                                )}
                                {task.due_date && (
                                  <Typography variant="body2">
                                    📅 Due: {task.due_date}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditTaskClick(task)}
                                title="Edit Task"
                              >
                                <Edit />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  handleDeleteTask(task.task_id || task.id!)
                                }
                                title="Delete Task"
                              >
                                <Delete />
                              </IconButton>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))
                )}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManageTasksDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectManagement;
