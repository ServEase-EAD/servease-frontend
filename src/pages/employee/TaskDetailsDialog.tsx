import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

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

interface TaskDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "success";
    case "in progress":
      return "warning";
    case "pending":
      return "error";
    default:
      return "default";
  }
};

const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({
  open,
  onClose,
  task,
}) => {
  if (!task) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography variant="h6">Task Details</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {task.appointment_type}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Service Request
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gap: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle2">Customer ID</Typography>
            <Typography variant="body1" fontWeight="medium">
              {task.customer_id}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle2">Customer Name</Typography>
            <Typography variant="body1">{task.customer_name}</Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle2">Vehicle ID</Typography>
            <Typography variant="body1">{task.vehicle_id}</Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle2">Vehicle Details</Typography>
            <Typography variant="body1">
              {typeof task.vehicle_details === "string"
                ? task.vehicle_details
                : "Unknown Vehicle"}
            </Typography>
            
            {task.vehicle_details ? (
              <Box sx={{ display: 'grid', gap: 1.5, ml: 2 }}>
                {task.vehicle_details.make && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2">Make</Typography>
                    <Typography variant="body2">{task.vehicle_details.make}</Typography>
                  </Box>
                )}
                {task.vehicle_details.model && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2">Model</Typography>
                    <Typography variant="body2">{task.vehicle_details.model}</Typography>
                  </Box>
                )}
                {task.vehicle_details.year && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2">Year</Typography>
                    <Typography variant="body2">{task.vehicle_details.year}</Typography>
                  </Box>
                )}
                {task.vehicle_details.color && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2">Color</Typography>
                    <Typography variant="body2">{task.vehicle_details.color}</Typography>
                  </Box>
                )}
                {task.vehicle_details.plate_number && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2">License Plate</Typography>
                    <Typography variant="body2">{task.vehicle_details.plate_number}</Typography>
                  </Box>
                )}
                {task.vehicle_details.vin && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2">VIN</Typography>
                    <Typography variant="body2">{task.vehicle_details.vin}</Typography>
                  </Box>
                )}
                {task.vehicle_details.age && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2">Vehicle Age</Typography>
                    <Typography variant="body2">{task.vehicle_details.age} years</Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No vehicle details available
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle2">Date</Typography>
            <Typography variant="body1">{task.scheduled_date}</Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle2">Time</Typography>
            <Typography variant="body1">{task.scheduled_time}</Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle2">Status</Typography>
            <Chip
              label={task.status}
              color={getStatusColor(task.status) as any}
              size="small"
            />
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsDialog;
