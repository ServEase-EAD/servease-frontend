import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';

const ViewAssignedTasks: React.FC = () => {
  // Mock data - replace with actual API data
  const tasks = [
    {
      id: 1,
      title: 'AC Repair',
      customer: 'John Doe',
      dueDate: '2025-11-01',
      status: 'In Progress',
      priority: 'High',
    },
    {
      id: 2,
      title: 'Plumbing Service',
      customer: 'Jane Smith',
      dueDate: '2025-11-02',
      status: 'Pending',
      priority: 'Medium',
    },
    // Add more mock tasks as needed
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        View Assigned Tasks
      </Typography>
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Task ID</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.id}</TableCell>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{task.customer}</TableCell>
                    <TableCell>{task.dueDate}</TableCell>
                    <TableCell>
                      <Chip
                        label={task.status}
                        color={task.status === 'In Progress' ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.priority}
                        color={
                          task.priority === 'High'
                            ? 'error'
                            : task.priority === 'Medium'
                            ? 'warning'
                            : 'success'
                        }
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ViewAssignedTasks;