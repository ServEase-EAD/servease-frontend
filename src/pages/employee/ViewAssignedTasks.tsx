import React, { useState, useEffect } from 'react';
import type { SelectChangeEvent } from '@mui/material';
import api from '../../api/apiConfig'; // ✅ centralized axios instance
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
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  CircularProgress,
} from '@mui/material';
import TaskDetailsDialog from './TaskDetailsDialog';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

// ----------------- Types -----------------
interface Task {
  id: string;
  customer_id: string;
  vehicle_id: string;
  appointment_type: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  customer_name: string;
  vehicle_details: string;
}

// ----------------- Component -----------------
const ViewAssignedTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ----------------- Fetch Data from Backend -----------------
  useEffect(() => {
    const fetchAssignedTasks = async () => {
      setLoading(true);
      setError('');

      try {
        // Step 1: Login via API Gateway
        const loginResponse = await api.post('auth/login/', {
          email: 'testemployee@gmail.com',
          password: '@Test1234',
        });

        const accessToken = loginResponse.data.tokens?.access;
        const refreshToken = loginResponse.data.tokens?.refresh;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        console.log('✅ Login successful via API Gateway');

        // Step 2: Fetch appointments through API Gateway
        const response = await api.get('appointments/', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data =
          Array.isArray(response.data)
            ? response.data
            : response.data.results || response.data.appointments || [];

        setTasks(data);
      } catch (error: any) {
        console.error('⚠️ Error fetching assigned tasks:', error);

        if (error.response?.data?.code === 'token_not_valid') {
          // Step 3: Attempt to refresh the token
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const refreshResponse = await api.post('auth/refresh/', { refresh: refreshToken });
              const newAccessToken = refreshResponse.data.access;
              localStorage.setItem('accessToken', newAccessToken);

              // Step 4: Retry fetching appointments
              const response = await api.get('appointments/', {
                headers: { Authorization: `Bearer ${newAccessToken}` },
              });

              const data =
                Array.isArray(response.data)
                  ? response.data
                  : response.data.results || response.data.appointments || [];

              setTasks(data);
            } catch (refreshError) {
              console.error('❌ Token refresh failed:', refreshError);
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              setError('Session expired. Please log in again.');
            }
          } else {
            setError('Authentication error. Please log in again.');
          }
        } else {
          setError(
            error.response?.data?.detail ||
              error.response?.data?.error ||
              'Failed to load assigned tasks.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedTasks();
  }, []);

  // ----------------- Helper Functions -----------------
  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setDetailsDialogOpen(true);
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

  const handleStatusChange = (taskId: string, newStatus: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
    setStatusMenuAnchor(null);
    setSelectedTaskId(null);
  };

  const handleStatusClick = (event: React.MouseEvent<HTMLElement>, taskId: string) => {
    setStatusMenuAnchor(event.currentTarget);
    setSelectedTaskId(taskId);
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'Pending':
        return 'In Progress';
      case 'In Progress':
        return 'Completed';
      default:
        return currentStatus;
    }
  };

  const handleFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };

  const getTotalsByStatus = () => {
    return tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const totals = getTotalsByStatus();

  const filteredTasks = tasks
    .filter(task =>
      Object.values(task).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .filter(task => (statusFilter ? task.status === statusFilter : true));

  // ----------------- Render -----------------
  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Summary Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        {[
          { label: 'Total Tasks', value: tasks.length.toString(), color: 'primary.main' },
          { label: 'Pending', value: (totals['Pending'] || 0).toString(), color: 'error.main' },
          { label: 'In Progress', value: (totals['In Progress'] || 0).toString(), color: 'warning.main' },
          { label: 'Completed', value: (totals['Completed'] || 0).toString(), color: 'success.main' },
        ].map((stat, index) => (
          <Box key={index} sx={{ flex: { xs: '0 0 calc(50% - 12px)', sm: '0 0 calc(25% - 18px)' } }}>
            <Card>
              <CardContent>
                <Typography
                  variant="h4"
                  sx={{ color: stat.color, textAlign: 'center', fontWeight: 'bold' }}
                >
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

      {/* Search and Filter */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
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
            name="status"
            value={statusFilter}
            onChange={handleFilterChange}
            label="Status Filter"
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Loading & Error */}
      {loading && (
        <Stack alignItems="center" sx={{ my: 3 }}>
          <CircularProgress />
          <Typography sx={{ mt: 1 }}>Loading assigned tasks...</Typography>
        </Stack>
      )}
      {error && <Typography color="error">{error}</Typography>}

      {/* Table */}
      {!loading && !error && (
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
              {filteredTasks.map(task => (
                <TableRow key={task.id}>
                  <TableCell>{task.appointment_type}</TableCell>
                  <TableCell>{task.customer_name}</TableCell>
                  <TableCell>{task.vehicle_details}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{task.scheduled_date}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {task.scheduled_time}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={task.status} color={getStatusColor(task.status) as any} size="small" />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewTask(task)}
                      >
                        View
                      </Button>
                      {task.status !== 'Completed' && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={e => handleStatusClick(e, task.id)}
                          endIcon={<ArrowDropDownIcon />}
                          color={task.status === 'Pending' ? 'warning' : 'success'}
                        >
                          Change Status
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Status Menu */}
      <Menu anchorEl={statusMenuAnchor} open={Boolean(statusMenuAnchor)} onClose={() => setStatusMenuAnchor(null)}>
        {selectedTaskId &&
          tasks.find(t => t.id === selectedTaskId)?.status !== 'Completed' && (
            <MenuItem
              onClick={() =>
                handleStatusChange(
                  selectedTaskId,
                  getNextStatus(tasks.find(t => t.id === selectedTaskId)?.status || '')
                )
              }
            >
              Move to {getNextStatus(tasks.find(t => t.id === selectedTaskId)?.status || '')}
            </MenuItem>
          )}
      </Menu>

      {/* Task Details Dialog */}
      <TaskDetailsDialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} task={selectedTask} />
    </Box>
  );
};

export default ViewAssignedTasks;
