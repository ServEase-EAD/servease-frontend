import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Tooltip,
  Paper,
  Divider,
  Snackbar,
} from "@mui/material";
import {
  Build as BuildIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CalendarToday as CalendarIcon,
  DirectionsCar as VehicleIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { 
  getProjects, 
  createProject, 
  updateProject, 
  deleteProject,
  type Project,
  type CreateProjectData
} from "../../services/projectService";
import { 
  getVehicles, 
  type Vehicle 
} from "../../services/vehicleService";

const ProjectsSection: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleMap, setVehicleMap] = useState<Map<string, Vehicle>>(new Map());
  
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
  
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    projectId: string | null;
  }>({
    open: false,
    projectId: null,
  });

  // Form state
  const [formData, setFormData] = useState<CreateProjectData>({
    vehicle: "",
    title: "",
    description: "",
    expected_completion_date: "",
  });

  useEffect(() => {
    // Load both projects and vehicles in parallel for better performance
    Promise.all([fetchProjects(), fetchVehicles()]);
  }, []);

  const showSnackbar = (message: string, severity: "success" | "error" | "warning" | "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const validateForm = (): boolean => {
    // Check title length
    if (formData.title.length < 3) {
      showSnackbar("Request title must be at least 3 characters long", "warning");
      return false;
    }

    // Check description length
    if (formData.description.length < 10) {
      showSnackbar("Modification details must be at least 10 characters long", "warning");
      return false;
    }

    if (formData.description.length > 1000) {
      showSnackbar("Modification details cannot exceed 1000 characters", "warning");
      return false;
    }

    // Check date is not more than 1 year (365 days) in the future
    const selectedDate = new Date(formData.expected_completion_date);
    const today = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setDate(today.getDate() + 365);

    if (selectedDate > oneYearFromNow) {
      showSnackbar("Expected completion date cannot be more than 1 year (365 days) from today", "warning");
      return false;
    }

    // Check date is not in the past
    if (selectedDate < today) {
      showSnackbar("Expected completion date cannot be in the past", "warning");
      return false;
    }

    return true;
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjects();
      setProjects(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching modification requests:", err);
      setError(err instanceof Error ? err.message : "Failed to load modification requests");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const vehicleList = await getVehicles();
      setVehicles(vehicleList);
      
      // Create vehicle map for easy lookup
      const map = new Map<string, Vehicle>();
      vehicleList.forEach((vehicle: Vehicle) => {
        map.set(vehicle.vehicle_id, vehicle);
      });
      setVehicleMap(map);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  };

  const getVehicleDisplay = (vehicleId: string): string => {
    const vehicle = vehicleMap.get(vehicleId);
    if (vehicle) {
      return `${vehicle.display_name} - ${vehicle.plate_number}`;
    }
    return vehicleId;
  };

  const handleCreateProject = async () => {
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    try {
      await createProject(formData);
      await fetchProjects();
      setOpenCreateDialog(false);
      resetForm();
      setError(null);
      showSnackbar("Modification request created successfully!", "success");
    } catch (err) {
      console.error("Error creating modification request:", err);
      setError(err instanceof Error ? err.message : "Failed to create modification request");
    }
  };

  const handleUpdateProject = async () => {
    if (!selectedProject) return;

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    try {
      await updateProject(selectedProject.project_id, {
        vehicle: formData.vehicle,
        title: formData.title,
        description: formData.description,
        expected_completion_date: formData.expected_completion_date,
      });
      
      await fetchProjects();
      setOpenEditDialog(false);
      resetForm();
      setSelectedProject(null);
      setError(null);
      showSnackbar("Modification request updated successfully!", "success");
    } catch (err) {
      console.error("Error updating modification request:", err);
      setError(err instanceof Error ? err.message : "Failed to update modification request");
    }
  };

  const openDeleteConfirmation = (projectId: string) => {
    setDeleteConfirmation({ open: true, projectId });
  };

  const handleDeleteProject = async () => {
    if (!deleteConfirmation.projectId) return;

    try {
      await deleteProject(deleteConfirmation.projectId);
      await fetchProjects();
      setError(null);
      setDeleteConfirmation({ open: false, projectId: null });
      showSnackbar("Modification request deleted successfully!", "success");
    } catch (err) {
      console.error("Error deleting modification request:", err);
      setError(err instanceof Error ? err.message : "Failed to delete modification request");
      setDeleteConfirmation({ open: false, projectId: null });
    }
  };

  const resetForm = () => {
    setFormData({
      vehicle: "",
      title: "",
      description: "",
      expected_completion_date: "",
    });
  };

  const openCreateForm = () => {
    resetForm();
    setOpenCreateDialog(true);
  };

  const openEditForm = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      vehicle: project.vehicle,
      title: project.title,
      description: project.description,
      expected_completion_date: project.expected_completion_date,
    });
    setOpenEditDialog(true);
  };

  const openViewForm = (project: Project) => {
    setSelectedProject(project);
    setOpenViewDialog(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, "default" | "primary" | "secondary" | "error" | "warning" | "info" | "success"> = {
      accepted: "info",
      cancelled: "error",
      not_started: "default",
      in_progress: "warning",
      completed: "success",
      on_hold: "secondary",
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      accepted: "Accepted",
      cancelled: "Cancelled",
      not_started: "Not Started",
      in_progress: "In Progress",
      completed: "Completed",
      on_hold: "On Hold",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header Section */}
      <Box sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        mb: 3,
        p: 3,
        backgroundColor: "white",
        borderRadius: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        border: "1px solid #e0e0e0"
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <BuildIcon sx={{ fontSize: 40, color: "#FF4D00" }} />
          <Box>
            <Typography variant="h6" component="h2" sx={{ color: "#333", fontWeight: 600 }}>
              My Modification Requests
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track and manage your vehicle modification requests
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateForm}
          sx={{
            backgroundColor: "#FF4D00",
            color: "white",
            px: 3,
            py: 1.5,
            borderRadius: 1,
            fontWeight: 600,
            boxShadow: "0 2px 4px rgba(255, 77, 0, 0.3)",
            "&:hover": {
              backgroundColor: "#E63900",
              boxShadow: "0 4px 8px rgba(255, 77, 0, 0.4)",
            },
          }}
        >
          New Request
        </Button>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            backgroundColor: "white",
            border: "1px solid #ffcdd2",
            borderRadius: 1,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }} 
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Main Content */}
      {projects.length === 0 ? (
        <Box sx={{
          backgroundColor: "white",
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          border: "1px solid #e0e0e0",
          p: 6,
          textAlign: "center"
        }}>
          <BuildIcon sx={{ fontSize: 80, color: "#ccc", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No modification requests yet
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Create your first vehicle modification request to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateForm}
            sx={{
              backgroundColor: "#FF4D00",
              color: "white",
              px: 3,
              py: 1.5,
              borderRadius: 1,
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#E63900",
              },
            }}
          >
            Create Request
          </Button>
        </Box>
      ) : (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: 3 
        }}>
          {projects.map((project) => (
            <Card
              key={project.project_id}
              elevation={0}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "white",
                border: "1px solid #e0e0e0",
                borderRadius: 2,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  transform: "translateY(-2px)",
                  borderColor: "#FF4D00",
                },
              }}
            >
                <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Typography
                        variant="subtitle2"
                        component="h4"
                        sx={{
                            flexGrow: 1,
                            pr: 1,
                            fontSize: "1rem", // Custom size for "h7"
                            fontWeight: 600,
                            letterSpacing: 0.1,
                            color: "#222",
                        }}
                    >
                        {project.title}
                    </Typography>
                    <Chip
                      label={getStatusLabel(project.status)}
                      color={getStatusColor(project.status)}
                      size="small"
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      minHeight: "60px",
                    }}
                  >
                    {project.description}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <VehicleIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary">
                        {getVehicleDisplay(project.vehicle)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary">
                        Due: {new Date(project.expected_completion_date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>

                <Divider />

                <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end", gap: 1, backgroundColor: "#f9f9f9" }}>
                  <Tooltip title="View Details">
                    <IconButton 
                      size="small" 
                      onClick={() => openViewForm(project)}
                      sx={{ 
                        color: "#666",
                        "&:hover": { color: "#FF4D00", backgroundColor: "rgba(255, 77, 0, 0.08)" }
                      }}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {project.status !== "in_progress" && (
                    <Tooltip title="Edit Request">
                      <IconButton 
                        size="small" 
                        onClick={() => openEditForm(project)}
                        sx={{ 
                          color: "#666",
                          "&:hover": { color: "#FF4D00", backgroundColor: "rgba(255, 77, 0, 0.08)" }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {["not_started", "cancelled", "on_hold"].includes(project.status) && (
                    <Tooltip title="Delete Request">
                      <IconButton
                        size="small"
                        onClick={() => openDeleteConfirmation(project.project_id)}
                        sx={{ 
                          color: "#666",
                          "&:hover": { color: "#d32f2f", backgroundColor: "rgba(211, 47, 47, 0.08)" }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Card>
          ))}
        </Box>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmation.open}
        onClose={() => setDeleteConfirmation({ open: false, projectId: null })}
        maxWidth="sm"
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WarningIcon sx={{ color: "#ff9800" }} />
            <Typography variant="h6">Confirm Deletion</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this modification request? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteConfirmation({ open: false, projectId: null })}
            variant="outlined"
            sx={{ borderColor: "#ddd", color: "#666" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteProject}
            variant="contained"
            color="error"
            sx={{ backgroundColor: "#d32f2f" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Modification Request Dialog */}
      <Dialog 
        open={openCreateDialog} 
        onClose={() => setOpenCreateDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>Create New Modification Request</Typography>
            <IconButton onClick={() => setOpenCreateDialog(false)} size="small" sx={{ color: "#999" }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2 }}>
            <br />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              select
              label="Vehicle"
              value={formData.vehicle}
              onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
              fullWidth
              required
              helperText="Select the vehicle for this modification request"
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
            >
              {vehicles.length === 0 ? (
                <MenuItem disabled>No vehicles available</MenuItem>
              ) : (
                vehicles.map((vehicle) => (
                  <MenuItem key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                    {vehicle.display_name} - {vehicle.plate_number}
                  </MenuItem>
                ))
              )}
            </TextField>

            <TextField
              label="Request Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
              multiline
              minRows={1}
              maxRows={3}
              helperText={`${formData.title.length} characters (minimum 3)`}
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
                "& .MuiInputBase-input": {
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  overflow: "auto",
                  textOverflow: "unset",
                },
              }}
            />

            <TextField
              label="Modification Details"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              required
              multiline
              rows={4}
              helperText={`${formData.description.length}/1000 characters (minimum 10)`}
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
              label="Expected Completion Date"
              type="date"
              value={formData.expected_completion_date}
              onChange={(e) => setFormData({ ...formData, expected_completion_date: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: new Date().toISOString().split("T")[0],
                max: new Date(new Date().setDate(new Date().getDate() + 365)).toISOString().split("T")[0],
              }}
              helperText="Maximum 1 year (365 days) from today"
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
            onClick={() => setOpenCreateDialog(false)} 
            variant="outlined"
            sx={{ 
              borderColor: "#ddd", 
              color: "#666",
              px: 3,
              py: 1,
              borderRadius: 1
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateProject}
            variant="contained"
            disabled={
              !formData.vehicle ||
              !formData.title ||
              !formData.description ||
              !formData.expected_completion_date
            }
            sx={{
              backgroundColor: "#FF4D00",
              color: "white",
              px: 3,
              py: 1.5,
              borderRadius: 1,
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#E63900",
              },
              "&:disabled": {
                backgroundColor: "#ccc",
              }
            }}
          >
            Create Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modification Request Dialog */}
      <Dialog 
        open={openEditDialog} 
        onClose={() => setOpenEditDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>Edit Modification Request</Typography>
            <IconButton onClick={() => setOpenEditDialog(false)} size="small" sx={{ color: "#999" }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2 }}>
            <br />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              select
              label="Vehicle"
              value={formData.vehicle}
              onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
              fullWidth
              required
              helperText="Select the vehicle for this modification request"
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
            >
              {vehicles.length === 0 ? (
                <MenuItem disabled>No vehicles available</MenuItem>
              ) : (
                vehicles.map((vehicle) => (
                  <MenuItem key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                    {vehicle.display_name} - {vehicle.plate_number}
                  </MenuItem>
                ))
              )}
            </TextField>

            <TextField
              label="Request Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
              multiline
              minRows={1}
              maxRows={3}
              helperText={`${formData.title.length} characters (minimum 3)`}
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
                // When multiline, the input becomes a textarea. Ensure wrapping.
                "& .MuiInputBase-input": {
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  overflow: "auto",
                  textOverflow: "unset",
                },
              }}
            />

            <TextField
              label="Modification Details"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              required
              multiline
              rows={4}
              helperText={`${formData.description.length}/1000 characters (minimum 10)`}
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
              label="Expected Completion Date"
              type="date"
              value={formData.expected_completion_date}
              onChange={(e) => setFormData({ ...formData, expected_completion_date: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: new Date().toISOString().split("T")[0],
                max: new Date(new Date().setDate(new Date().getDate() + 365)).toISOString().split("T")[0],
              }}
              helperText="Maximum 1 year (365 days) from today"
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
            onClick={() => setOpenEditDialog(false)} 
            variant="outlined"
            sx={{ 
              borderColor: "#ddd", 
              color: "#666",
              px: 3,
              py: 1,
              borderRadius: 1
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateProject}
            variant="contained"
            disabled={
              !formData.vehicle ||
              !formData.title ||
              !formData.description ||
              !formData.expected_completion_date
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
              }
            }}
          >
            Update Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Modification Request Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>Modification Request Details</Typography>
            <IconButton onClick={() => setOpenViewDialog(false)} size="small" sx={{ color: "#999" }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2 }}>
          {selectedProject && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Request Title
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {selectedProject.title}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                <Chip
                  label={getStatusLabel(selectedProject.status)}
                  color={getStatusColor(selectedProject.status)}
                  size="medium"
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Modification Details
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="body1">{selectedProject.description}</Typography>
                </Paper>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Vehicle
                  </Typography>
                  <Typography variant="body1">{getVehicleDisplay(selectedProject.vehicle)}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Expected Completion
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedProject.expected_completion_date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Created At
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedProject.created_at).toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Last Updated
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedProject.updated_at).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setOpenViewDialog(false)} 
            variant="contained"
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
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectsSection;