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
  Button,
  TextField,
  MenuItem,
} from '@mui/material';

const ServiceRequests: React.FC = () => {
  // Mock data - replace with actual API data
  const requests = [
    {
      id: 1,
      customerName: 'John Doe',
      service: 'AC Repair',
      requestDate: '2025-10-29',
      status: 'Pending',
      priority: 'High',
      description: 'AC not cooling properly',
    },
    {
      id: 2,
      customerName: 'Jane Smith',
      service: 'Plumbing',
      requestDate: '2025-10-28',
      status: 'In Progress',
      priority: 'Medium',
      description: 'Leaking faucet',
    },
    // Add more mock requests as needed
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Service Requests
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              select
              label="Status"
              size="small"
              sx={{ minWidth: 150 }}
              defaultValue="all"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </TextField>

            <TextField
              select
              label="Priority"
              size="small"
              sx={{ minWidth: 150 }}
              defaultValue="all"
            >
              <MenuItem value="all">All Priority</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </TextField>

            <TextField
              label="Search"
              size="small"
              placeholder="Search requests..."
              sx={{ flexGrow: 1 }}
            />

            <Button variant="contained" color="primary">
              New Request
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Request Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.id}</TableCell>
                    <TableCell>{request.customerName}</TableCell>
                    <TableCell>{request.service}</TableCell>
                    <TableCell>{request.requestDate}</TableCell>
                    <TableCell>
                      <Chip
                        label={request.status}
                        color={
                          request.status === 'Completed'
                            ? 'success'
                            : request.status === 'In Progress'
                            ? 'primary'
                            : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={request.priority}
                        color={
                          request.priority === 'High'
                            ? 'error'
                            : request.priority === 'Medium'
                            ? 'warning'
                            : 'success'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{request.description}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" variant="outlined" color="primary">
                          Update
                        </Button>
                        <Button size="small" variant="outlined" color="success">
                          Complete
                        </Button>
                      </Box>
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

export default ServiceRequests;