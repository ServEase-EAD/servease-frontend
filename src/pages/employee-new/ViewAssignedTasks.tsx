import React, { useState } from 'react';
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
  SelectChangeEvent,
  Stack,
} from '@mui/material';
import TaskDetailsDialog from './TaskDetailsDialog';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface Task {
  id: number;
  taskName: string;
  customer: string;
  location: string;
  date: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
}

// Mock data for tasks
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

const mockTasks: Task[] = [
  {
    id: 1,
    taskName: 'Initial inspection and diagnostics',
    customer: 'John Doe',
    location: 'Colombo 7',
    date: '2025-10-30',
    status: 'Pending',
    priority: 'High',
    duration: '2.5h',
    vehicleDetails: 'Toyota Camry 2020',
    serviceType: 'Oil Change & Inspection',
  },
  {
    id: 2,
    taskName: 'Main service task',
    customer: 'Jane Smith',
    location: 'Nugegoda',
    date: '2025-10-29',
    status: 'In Progress',
    priority: 'Medium',
    duration: '3h',
    vehicleDetails: 'Toyota Camry 2020',
    serviceType: 'Oil Change & Inspection',
  },
  {
    id: 3,
    taskName: 'Initial inspection and diagnostics',
    customer: 'Mike Johnson',
    location: 'Rajagiriya',
    date: '2025-10-31',
    status: 'Completed',
    priority: 'Low',
    duration: '2.5h',
    vehicleDetails: 'Honda Accord 2019',
    serviceType: 'Brake System Repair',
  },
];

const ViewAssignedTasks: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
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

  const handleStatusChange = (taskId: number, newStatus: Task['status']) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
    setStatusMenuAnchor(null);
    setSelectedTaskId(null);
  };

  const handleStatusClick = (event: React.MouseEvent<HTMLElement>, taskId: number) => {
    setStatusMenuAnchor(event.currentTarget);
    setSelectedTaskId(taskId);
  };

  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    if (name === 'status') {
      setStatusFilter(value);
    } else if (name === 'priority') {
      setPriorityFilter(value);
    }
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

  const getTotalsByStatus = () => {
    return tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const totals = getTotalsByStatus();

  const filteredTasks = tasks.filter(task =>
    Object.values(task).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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
          { label: 'Total Tasks', value: tasks.length.toString(), color: 'primary.main' },
          { label: 'Pending', value: (totals['Pending'] || 0).toString(), color: 'error.main' },
          { label: 'In Progress', value: (totals['In Progress'] || 0).toString(), color: 'warning.main' },
          { label: 'Completed', value: (totals['Completed'] || 0).toString(), color: 'success.main' }
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

      {/* Search and Filter Bar */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
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
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="priority-filter-label">
            <FilterListIcon sx={{ mr: 1 }} />
            Priority Filter
          </InputLabel>
          <Select
            labelId="priority-filter-label"
            name="priority"
            value={priorityFilter}
            onChange={handleFilterChange}
            label="Priority Filter"
          >
            <MenuItem value="">All Priority</MenuItem>
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Tasks Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Task Name</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{task.taskName}</TableCell>
                <TableCell>{task.customer}</TableCell>
                <TableCell>{task.location}</TableCell>
                <TableCell>{task.date}</TableCell>
                <TableCell>
                  <Typography sx={{ color: getPriorityColor(task.priority), fontWeight: 'bold' }}>
                    {task.priority}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={task.status}
                    color={getStatusColor(task.status) as any}
                    size="small"
                  />
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
                        onClick={(e) => handleStatusClick(e, task.id)}
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

      {/* Status Change Menu */}
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={() => setStatusMenuAnchor(null)}
      >
        {selectedTaskId && tasks.find(t => t.id === selectedTaskId)?.status !== 'Completed' && (
          <MenuItem 
            onClick={() => handleStatusChange(
              selectedTaskId, 
              getNextStatus(tasks.find(t => t.id === selectedTaskId)?.status || '') as Task['status']
            )}
          >
            Move to {getNextStatus(tasks.find(t => t.id === selectedTaskId)?.status || '')}
          </MenuItem>
        )}
      </Menu>

      {/* Task Details Dialog */}
      <TaskDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        task={selectedTask}
      />
    </Box>
  );
};

export default ViewAssignedTasks;