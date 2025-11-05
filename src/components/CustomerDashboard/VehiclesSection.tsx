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
  CircularProgress,
  Tooltip,
  Paper,
  Divider,
  Snackbar,
} from "@mui/material";
import {
  DirectionsCar as VehicleIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CalendarToday as CalendarIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  ColorLens as ColorIcon,
  DateRange as YearIcon,
} from "@mui/icons-material";
import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  type Vehicle,
  type CreateVehicleData,
} from "../../services/vehicleService";

const VehiclesSection: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

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
    vehicleId: string | null;
  }>({
    open: false,
    vehicleId: null,
  });

  // Form state
  const [formData, setFormData] = useState<CreateVehicleData>({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    vin: "",
    plate_number: "",
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "warning" | "info"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const validateForm = (): boolean => {
    // Validate make
    if (formData.make.length < 2) {
      showSnackbar("Vehicle make must be at least 2 characters long", "warning");
      return false;
    }

    // Validate model
    if (formData.model.length < 2) {
      showSnackbar("Vehicle model must be at least 2 characters long", "warning");
      return false;
    }

    // Validate year
    const currentYear = new Date().getFullYear();
    if (formData.year < 1900 || formData.year > currentYear + 1) {
      showSnackbar(
        `Year must be between 1900 and ${currentYear + 1}`,
        "warning"
      );
      return false;
    }

    // Validate VIN
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
    const vinUpper = formData.vin.toUpperCase();
    if (!vinRegex.test(vinUpper)) {
      showSnackbar(
        "VIN must be exactly 17 characters (letters and numbers, no I, O, or Q)",
        "warning"
      );
      return false;
    }

    // Check for invalid characters in VIN
    if (/[IOQ]/.test(vinUpper)) {
      showSnackbar("VIN cannot contain letters I, O, or Q", "warning");
      return false;
    }

    // Validate plate number
    const plateRegex = /^[A-Z0-9\-\s]{2,10}$/;
    const plateUpper = formData.plate_number.toUpperCase();
    if (!plateRegex.test(plateUpper)) {
      showSnackbar(
        "Plate number must be 2-10 characters (letters, numbers, hyphens, or spaces)",
        "warning"
      );
      return false;
    }

    // Validate color
    if (formData.color.length < 3) {
      showSnackbar("Color must be at least 3 characters long", "warning");
      return false;
    }

    return true;
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await getVehicles();
      console.log("Fetched vehicles in component:", data);
      if (data.length > 0) {
        console.log("First vehicle details:", {
          make: data[0].make,
          model: data[0].model,
          year: data[0].year,
          display_name: data[0].display_name
        });
      }
      setVehicles(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load vehicles"
      );
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVehicle = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Convert to uppercase for VIN and plate number
      const vehicleData = {
        ...formData,
        vin: formData.vin.toUpperCase(),
        plate_number: formData.plate_number.toUpperCase(),
      };

      await createVehicle(vehicleData);
      await fetchVehicles();
      setOpenCreateDialog(false);
      resetForm();
      setError(null);
      showSnackbar("Vehicle created successfully!", "success");
    } catch (err) {
      console.error("Error creating vehicle:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create vehicle"
      );
    }
  };

  const handleUpdateVehicle = async () => {
    if (!selectedVehicle) return;

    if (!validateForm()) {
      return;
    }

    try {
      // Convert to uppercase for VIN and plate number
      const updateData = {
        make: formData.make,
        model: formData.model,
        year: formData.year,
        color: formData.color,
        vin: formData.vin.toUpperCase(),
        plate_number: formData.plate_number.toUpperCase(),
      };

      await updateVehicle(selectedVehicle.vehicle_id, updateData);
      await fetchVehicles();
      setOpenEditDialog(false);
      resetForm();
      setSelectedVehicle(null);
      setError(null);
      showSnackbar("Vehicle updated successfully!", "success");
    } catch (err) {
      console.error("Error updating vehicle:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update vehicle"
      );
    }
  };

  const openDeleteConfirmation = (vehicleId: string) => {
    setDeleteConfirmation({ open: true, vehicleId });
  };

  const handleDeleteVehicle = async () => {
    if (!deleteConfirmation.vehicleId) return;

    try {
      await deleteVehicle(deleteConfirmation.vehicleId);
      await fetchVehicles();
      setError(null);
      setDeleteConfirmation({ open: false, vehicleId: null });
      showSnackbar("Vehicle deleted successfully!", "success");
    } catch (err) {
      console.error("Error deleting vehicle:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete vehicle";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
      setDeleteConfirmation({ open: false, vehicleId: null });
    }
  };

  const resetForm = () => {
    setFormData({
      make: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
      vin: "",
      plate_number: "",
    });
  };

  const openCreateForm = () => {
    resetForm();
    setOpenCreateDialog(true);
  };

  const openEditForm = (vehicle: Vehicle) => {
    console.log("Opening edit form for vehicle:", vehicle);
    setSelectedVehicle(vehicle);
    // Ensure all fields are properly populated, including fallbacks
    const editFormData = {
      make: vehicle.make || "",
      model: vehicle.model || "",
      year: vehicle.year || new Date().getFullYear(),
      color: vehicle.color || "",
      vin: vehicle.vin || "",
      plate_number: vehicle.plate_number || "",
    };
    console.log("Setting form data:", editFormData);
    setFormData(editFormData);
    setOpenEditDialog(true);
  };

  const openViewForm = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setOpenViewDialog(true);
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          p: 3,
          backgroundColor: "white",
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          border: "1px solid #e0e0e0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <VehicleIcon sx={{ fontSize: 40, color: "#FF4D00" }} />
          <Box>
            <Typography
              variant="h6"
              component="h2"
              sx={{ color: "#333", fontWeight: 600 }}
            >
              My Vehicles
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and track your vehicles ({vehicles.length} total)
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
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
            Add Vehicle
          </Button>
        </Box>
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
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Main Content */}
      {vehicles.length === 0 ? (
        <Box
          sx={{
            backgroundColor: "white",
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            border: "1px solid #e0e0e0",
            p: 6,
            textAlign: "center",
          }}
        >
          <VehicleIcon sx={{ fontSize: 80, color: "#ccc", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No vehicles yet
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Add your first vehicle to get started
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
            Add Vehicle
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: 3,
          }}
        >
          {vehicles.map((vehicle) => (
            <Card
              key={vehicle.vehicle_id}
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
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    component="h4"
                    sx={{
                      flexGrow: 1,
                      pr: 1,
                      fontSize: "1rem",
                      fontWeight: 600,
                      letterSpacing: 0.1,
                      color: "#222",
                    }}
                  >
                    {vehicle.display_name}
                  </Typography>
                  <Chip
                    label={vehicle.is_active ? "Active" : "Inactive"}
                    color={vehicle.is_active ? "success" : "default"}
                    size="small"
                  />
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    minHeight: "20px",
                  }}
                >
                  {vehicle.plate_number}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ColorIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">
                      Color: {vehicle.color || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <YearIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      onClick={() => console.log("Vehicle data:", vehicle)}
                      sx={{ cursor: 'pointer' }}
                    >
                      Year: {vehicle.year || 'N/A'} {/* Debug: click to log */}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CalendarIcon
                      sx={{ fontSize: 18, color: "text.secondary" }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Added: {new Date(vehicle.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>

              <Divider />

              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 1,
                  backgroundColor: "#f9f9f9",
                }}
              >
                <Tooltip title="View Details">
                  <IconButton
                    size="small"
                    onClick={() => openViewForm(vehicle)}
                    sx={{
                      color: "#666",
                      "&:hover": {
                        color: "#FF4D00",
                        backgroundColor: "rgba(255, 77, 0, 0.08)",
                      },
                    }}
                  >
                    <ViewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit Vehicle">
                  <IconButton
                    size="small"
                    onClick={() => openEditForm(vehicle)}
                    sx={{
                      color: "#666",
                      "&:hover": {
                        color: "#FF4D00",
                        backgroundColor: "rgba(255, 77, 0, 0.08)",
                      },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Vehicle">
                  <IconButton
                    size="small"
                    onClick={() => openDeleteConfirmation(vehicle.vehicle_id)}
                    sx={{
                      color: "#666",
                      "&:hover": {
                        color: "#d32f2f",
                        backgroundColor: "rgba(211, 47, 47, 0.08)",
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
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
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmation.open}
        onClose={() =>
          setDeleteConfirmation({ open: false, vehicleId: null })
        }
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
            Are you sure you want to delete this vehicle? This action cannot be
            undone.
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Note: Vehicles with existing modification requests cannot be deleted.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() =>
              setDeleteConfirmation({ open: false, vehicleId: null })
            }
            variant="outlined"
            sx={{ borderColor: "#ddd", color: "#666" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteVehicle}
            variant="contained"
            color="error"
            sx={{ backgroundColor: "#d32f2f" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Vehicle Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
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
              Add New Vehicle
            </Typography>
            <IconButton
              onClick={() => setOpenCreateDialog(false)}
              size="small"
              sx={{ color: "#999" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2 }}>
          <br />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="Make"
              value={formData.make}
              onChange={(e) =>
                setFormData({ ...formData, make: e.target.value })
              }
              fullWidth
              required
              helperText="e.g., Toyota, Honda, BMW"
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
              label="Model"
              value={formData.model}
              onChange={(e) =>
                setFormData({ ...formData, model: e.target.value })
              }
              fullWidth
              required
              helperText="e.g., Camry, Civic, X5"
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
              label="Year"
              type="number"
              value={formData.year}
              onChange={(e) =>
                setFormData({ ...formData, year: parseInt(e.target.value) })
              }
              fullWidth
              required
              inputProps={{
                min: 1900,
                max: new Date().getFullYear() + 1,
              }}
              helperText={`Manufacturing year (1900 - ${
                new Date().getFullYear() + 1
              })`}
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
              label="Color"
              value={formData.color}
              onChange={(e) =>
                setFormData({ ...formData, color: e.target.value })
              }
              fullWidth
              required
              helperText="Vehicle color"
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
              label="VIN (Vehicle Identification Number)"
              value={formData.vin}
              onChange={(e) =>
                setFormData({ ...formData, vin: e.target.value.toUpperCase() })
              }
              fullWidth
              required
              inputProps={{ maxLength: 17 }}
              helperText={`${formData.vin.length}/17 characters (no I, O, or Q)`}
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
              label="Plate Number"
              value={formData.plate_number}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  plate_number: e.target.value.toUpperCase(),
                })
              }
              fullWidth
              required
              inputProps={{ maxLength: 10 }}
              helperText={`${formData.plate_number.length}/10 characters`}
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
              borderRadius: 1,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateVehicle}
            variant="contained"
            disabled={
              !formData.make ||
              !formData.model ||
              !formData.year ||
              !formData.color ||
              !formData.vin ||
              !formData.plate_number
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
              },
            }}
          >
            Add Vehicle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
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
              Edit Vehicle
            </Typography>
            <IconButton
              onClick={() => setOpenEditDialog(false)}
              size="small"
              sx={{ color: "#999" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2 }}>
          <br />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="Make"
              value={formData.make}
              onChange={(e) =>
                setFormData({ ...formData, make: e.target.value })
              }
              fullWidth
              required
              helperText="e.g., Toyota, Honda, BMW"
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
              label="Model"
              value={formData.model}
              onChange={(e) =>
                setFormData({ ...formData, model: e.target.value })
              }
              fullWidth
              required
              helperText="e.g., Camry, Civic, X5"
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
              label="Year"
              type="number"
              value={formData.year}
              onChange={(e) =>
                setFormData({ ...formData, year: parseInt(e.target.value) })
              }
              fullWidth
              required
              inputProps={{
                min: 1900,
                max: new Date().getFullYear() + 1,
              }}
              helperText={`Manufacturing year (1900 - ${
                new Date().getFullYear() + 1
              })`}
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
              label="Color"
              value={formData.color}
              onChange={(e) =>
                setFormData({ ...formData, color: e.target.value })
              }
              fullWidth
              required
              helperText="Vehicle color"
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
              label="VIN (Vehicle Identification Number)"
              value={formData.vin}
              onChange={(e) =>
                setFormData({ ...formData, vin: e.target.value.toUpperCase() })
              }
              fullWidth
              required
              inputProps={{ maxLength: 17 }}
              helperText={`${formData.vin.length}/17 characters (no I, O, or Q)`}
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
              label="Plate Number"
              value={formData.plate_number}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  plate_number: e.target.value.toUpperCase(),
                })
              }
              fullWidth
              required
              inputProps={{ maxLength: 10 }}
              helperText={`${formData.plate_number.length}/10 characters`}
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
              borderRadius: 1,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateVehicle}
            variant="contained"
            disabled={
              !formData.make ||
              !formData.model ||
              !formData.year ||
              !formData.color ||
              !formData.vin ||
              !formData.plate_number
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
            Update Vehicle
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Vehicle Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
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
              Vehicle Details
            </Typography>
            <IconButton
              onClick={() => setOpenViewDialog(false)}
              size="small"
              sx={{ color: "#999" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2 }}>
          {selectedVehicle && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Vehicle Name
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontSize: "1.1rem",
                    letterSpacing: 0.1,
                    color: "#222",
                  }}
                  gutterBottom
                >
                  {selectedVehicle.display_name}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Status
                </Typography>
                <Chip
                  label={selectedVehicle.is_active ? "Active" : "Inactive"}
                  color={selectedVehicle.is_active ? "success" : "default"}
                  size="medium"
                />
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Make
                  </Typography>
                  <Typography variant="body1">{selectedVehicle.make}</Typography>
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Model
                  </Typography>
                  <Typography variant="body1">
                    {selectedVehicle.model}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Year
                  </Typography>
                  <Typography variant="body1">{selectedVehicle.year}</Typography>
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Color
                  </Typography>
                  <Typography variant="body1">
                    {selectedVehicle.color}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  VIN (Vehicle Identification Number)
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography
                    variant="body1"
                    sx={{ fontFamily: "monospace", letterSpacing: 1 }}
                  >
                    {selectedVehicle.vin}
                  </Typography>
                </Paper>
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Plate Number
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography
                    variant="body1"
                    sx={{ fontFamily: "monospace", letterSpacing: 1 }}
                  >
                    {selectedVehicle.plate_number}
                  </Typography>
                </Paper>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Created At
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedVehicle.created_at).toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Last Updated
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedVehicle.updated_at).toLocaleString()}
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

export default VehiclesSection;