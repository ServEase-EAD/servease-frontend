import React, { useState, useEffect } from 'react';
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
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BuildIcon from '@mui/icons-material/Build';
import DescriptionIcon from '@mui/icons-material/Description';
import { getEmployeeTasks, type Task } from '../../services/projectService';

const ServiceRequests: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmployeeTasks();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

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

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return '#ff0000';
      case 'high':
        return '#ff4444';
      case 'medium':
        return '#ffbb33';
      case 'low':
        return '#00C851';
      default:
        return '#333333';
    }
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.priority.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === 'not_started').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Summary Cards */}
      <Box sx={{ 
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
        mb: 4
      }}>
        {[
          { label: 'Total Tasks', value: totalTasks.toString(), color: 'primary.main' },
          { label: 'Not Started', value: pendingTasks.toString(), color: 'error.main' },
          { label: 'In Progress', value: inProgressTasks.toString(), color: 'warning.main' },
          { label: 'Completed', value: completedTasks.toString(), color: 'success.main' }
        ].map((stat, index) => (
          <Box key={index} sx={{ flex: { xs: '0 0 calc(50% - 12px)', sm: '0 0 calc(25% - 18px)' } }}>
            <Card>
              <CardContent>
                <Typography variant="h4" sx={{ color: stat.color, textAlign: 'center', fontWeight: 'bold' }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search service requests..."
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
      </Box>

      {/* Service Requests Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Task Title</TableCell>
              <TableCell>Project Name</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No tasks assigned to you yet
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow key={task.task_id}>
                  <TableCell>
                    <Typography variant="subtitle2">{task.title}</Typography>
                  </TableCell>
                  <TableCell>{task.project_name || task.project}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ color: getPriorityColor(task.priority), fontWeight: 'bold' }}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      color={getStatusColor(task.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => handleViewTask(task)}
                      title="View Details"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    {task.status !== 'completed' && (
                      <IconButton
                        color="success"
                        size="small"
                        title="Mark as Complete"
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Task Details Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedTask && (
          <>
            <DialogTitle>
              <Typography variant="h6">Task Details</Typography>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BuildIcon color="action" />
                  <Box>
                    <Typography variant="subtitle2">Task Title</Typography>
                    <Typography>{selectedTask.title}</Typography>
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <DescriptionIcon color="action" />
                  <Box>
                    <Typography variant="subtitle2">Description</Typography>
                    <Typography>{selectedTask.description}</Typography>
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarTodayIcon color="action" />
                    <Box>
                      <Typography variant="subtitle2">Due Date</Typography>
                      <Typography>
                        {selectedTask.due_date 
                          ? new Date(selectedTask.due_date).toLocaleDateString() 
                          : 'No due date set'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box>
                    <Typography variant="subtitle2">Priority</Typography>
                    <Typography sx={{ color: getPriorityColor(selectedTask.priority), fontWeight: 'bold' }}>
                      {selectedTask.priority.charAt(0).toUpperCase() + selectedTask.priority.slice(1)}
                    </Typography>
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box>
                    <Typography variant="subtitle2">Status</Typography>
                    <Chip
                      label={selectedTask.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      color={getStatusColor(selectedTask.status) as any}
                      size="small"
                    />
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon color="action" />
                  <Box>
                    <Typography variant="subtitle2">Created</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(selectedTask.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              {selectedTask.status !== 'completed' && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                >
                  Mark as Complete
                </Button>
              )}
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ServiceRequests;