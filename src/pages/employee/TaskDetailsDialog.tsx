import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Stack,
  Divider,
} from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import DescriptionIcon from "@mui/icons-material/Description";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

interface VehicleDetails {
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  plate_number?: string;
  vin?: string;
  age?: number;
}

interface Task {
  id: string;
  appointment_type: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  customer_name: string;
  vehicle_details: VehicleDetails | string;
  customer_details?: any;
  service_description?: string;
  customer_notes?: string;
  internal_notes?: string;
  estimated_cost?: number;
  duration_minutes?: number;
  assigned_employee_id?: string;
  employee_name?: string;
}

interface TaskDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  onMarkAsNoShow?: (taskId: string) => void;
}

const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({
  open,
  onClose,
  task,
  onMarkAsNoShow,
}) => {
  if (!task) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6">Task Details</Typography>
        <Typography variant="caption" color="text.secondary">
          Customer Appointment
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Service Type */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <BuildIcon color="action" />
            <Box>
              <Typography variant="subtitle2">Service Type</Typography>
              <Typography>{task.appointment_type}</Typography>
            </Box>
          </Box>
          <Divider />

          {/* Description */}
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
            <DescriptionIcon color="action" />
            <Box>
              <Typography variant="subtitle2">Description</Typography>
              <Typography>
                {task.service_description || 
                 task.customer_notes || 
                 "No description available"}
              </Typography>
            </Box>
          </Box>
          <Divider />

          {/* Scheduled Date & Time */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarTodayIcon color="action" />
            <Box>
              <Typography variant="subtitle2">Scheduled Date & Time</Typography>
              <Typography>
                {task.scheduled_date} at {task.scheduled_time}
              </Typography>
            </Box>
          </Box>
          <Divider />

          {/* Created Date */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccessTimeIcon color="action" />
            <Box>
              <Typography variant="subtitle2">Created</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(task.scheduled_date).toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        {(task.status === "confirmed" || task.status === "not_started") && (
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              onMarkAsNoShow?.(task.id);
              onClose();
            }}
            >
            Mark as No Show
          </Button>
        )}
        <Button color="error" onClick={onClose}>
          CLOSE
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDetailsDialog;
