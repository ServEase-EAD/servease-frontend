import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  CircularProgress,
  Snackbar,
  IconButton,
  Typography,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { createAppointment } from "../../../services/appointmentService";
import { getVehicles, type Vehicle } from "../../../services/vehicleService";
import { getUserFromToken } from "../../../services/authService";
import type { CreateAppointmentData, AppointmentType } from "../../../types";
import { getTodayDate } from "../../../utils/dateUtils";

interface CreateAppointmentFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customerId: string;
}

const appointmentTypes: { value: AppointmentType; label: string }[] = [
  { value: "maintenance", label: "Regular Maintenance" },
  { value: "repair", label: "Repair" },
  { value: "inspection", label: "Inspection" },
  { value: "diagnostic", label: "Diagnostic" },
  { value: "emergency", label: "Emergency Service" },
];

const CreateAppointmentForm: React.FC<CreateAppointmentFormProps> = ({
  open,
  onClose,
  onSuccess,
  customerId,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  const [formData, setFormData] = useState<CreateAppointmentData>({
    customer_id: customerId,
    vehicle_id: "",
    appointment_type: "maintenance",
    scheduled_date: getTodayDate(),
    scheduled_time: "09:00",
    duration_minutes: 60,
    service_description: "",
    customer_notes: "",
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

  useEffect(() => {
    if (open) {
      fetchVehicles();
    }
  }, [open]);

  const fetchVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const data = await getVehicles();
      setVehicles(data);
    } catch (err) {
      const errorMessage = "Failed to load vehicles";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setLoadingVehicles(false);
    }
  };

  const handleChange = (
    field: keyof CreateAppointmentData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get the current user ID from the JWT token
      const currentUser = getUserFromToken();
      if (!currentUser) {
        const errorMessage =
          "Unable to verify user identity. Please log in again.";
        setError(errorMessage);
        showSnackbar(errorMessage, "error");
        setLoading(false);
        return;
      }

      // Add created_by_user_id to the form data
      const appointmentData: CreateAppointmentData = {
        ...formData,
        created_by_user_id: currentUser.id,
      };

      await createAppointment(appointmentData);
      showSnackbar("Appointment created successfully!", "success");
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        customer_id: customerId,
        vehicle_id: "",
        appointment_type: "maintenance",
        scheduled_date: getTodayDate(),
        scheduled_time: "09:00",
        duration_minutes: 60,
        service_description: "",
        customer_notes: "",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create appointment";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>
              Schedule New Appointment
            </Typography>
            <IconButton onClick={onClose} size="small" sx={{ color: "#999" }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loadingVehicles ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}
            >
              <FormControl fullWidth required>
                <InputLabel>Vehicle</InputLabel>
                <Select
                  value={formData.vehicle_id}
                  label="Vehicle"
                  onChange={(e) => handleChange("vehicle_id", e.target.value)}
                  sx={{
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#FF4D00",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#FF4D00",
                    },
                  }}
                >
                  {vehicles.map((vehicle) => (
                    <MenuItem
                      key={vehicle.vehicle_id}
                      value={vehicle.vehicle_id}
                    >
                      {vehicle.display_name ||
                        `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Appointment Type</InputLabel>
                <Select
                  value={formData.appointment_type}
                  label="Appointment Type"
                  onChange={(e) =>
                    handleChange("appointment_type", e.target.value)
                  }
                  sx={{
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#FF4D00",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#FF4D00",
                    },
                  }}
                >
                  {appointmentTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                required
                type="date"
                label="Date"
                value={formData.scheduled_date}
                onChange={(e) => handleChange("scheduled_date", e.target.value)}
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
                label="Time"
                value={formData.scheduled_time}
                onChange={(e) => handleChange("scheduled_time", e.target.value)}
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
                label="Service Description"
                value={formData.service_description}
                onChange={(e) =>
                  handleChange("service_description", e.target.value)
                }
                placeholder="Describe the service needed..."
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
                rows={2}
                label="Additional Notes"
                value={formData.customer_notes}
                onChange={(e) => handleChange("customer_notes", e.target.value)}
                placeholder="Any special instructions or concerns..."
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
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={onClose}
            disabled={loading}
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
            type="submit"
            variant="contained"
            disabled={loading || !formData.vehicle_id}
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
            {loading ? <CircularProgress size={24} /> : "Schedule Appointment"}
          </Button>
        </DialogActions>
      </form>

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
    </Dialog>
  );
};

export default CreateAppointmentForm;
