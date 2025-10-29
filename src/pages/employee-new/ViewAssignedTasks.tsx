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
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Mock data for tasks
const mockTasks = [
  {
    id: 1,
    taskName: 'AC Repair',
    customer: 'John Doe',
    location: 'Colombo 7',
    date: '2025-10-30',
    status: 'Pending',
    priority: 'High',
  },
  {
    id: 2,
    taskName: 'Plumbing Fix',
    customer: 'Jane Smith',
    location: 'Nugegoda',
    date: '2025-10-29',
    status: 'In Progress',
    priority: 'Medium',
  },
  {
    id: 3,
    taskName: 'Electrical Wiring',
    customer: 'Mike Johnson',
    location: 'Rajagiriya',
    date: '2025-10-31',
    status: 'Completed',
    priority: 'Low',
  },
];

const ViewAssignedTasks: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredTasks = mockTasks.filter(task =>
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
          { label: 'Total Tasks', value: '15', color: 'primary.main' },
          { label: 'Pending', value: '5', color: 'error.main' },
          { label: 'In Progress', value: '7', color: 'warning.main' },
          { label: 'Completed', value: '3', color: 'success.main' }
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
      </Box>

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
                  <IconButton color="primary" size="small" title="View Details">
                    <VisibilityIcon />
                  </IconButton>
                  {task.status !== 'Completed' && (
                    <IconButton color="success" size="small" title="Mark as Complete">
                      <CheckCircleIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ViewAssignedTasks;