import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface Task {
  id: number;
  taskName: string;
  customer: string;
  location: string;
  date: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  duration?: string;
  serviceType?: string;
  vehicleDetails?: string;
}

interface TaskDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'success';
    case 'in progress':
      return 'warning';
    case 'pending':
      return 'error';
    default:
      return 'default';
  }
};

const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({ open, onClose, task }) => {
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
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
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
            {task.taskName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {task.vehicleDetails || `${task.serviceType || 'Service'} Request`}
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2">Duration</Typography>
            <Typography variant="body1" fontWeight="medium">
              {task.duration || '2.5h'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2">Date</Typography>
            <Typography variant="body1">
              {new Date(task.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2">Status</Typography>
            <Chip
              label={task.status}
              color={getStatusColor(task.status) as any}
              size="small"
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2">Customer</Typography>
            <Typography variant="body1">{task.customer}</Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2">Location</Typography>
            <Typography variant="body1">{task.location}</Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2">Priority</Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: task.priority === 'High' ? 'error.main' : 
                       task.priority === 'Medium' ? 'warning.main' : 
                       'success.main'
              }}
            >
              {task.priority}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsDialog;
