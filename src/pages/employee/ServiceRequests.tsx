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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BuildIcon from '@mui/icons-material/Build';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DescriptionIcon from '@mui/icons-material/Description';

// Mock data for service requests
const mockRequests = [
  {
    id: 1,
    serviceType: 'AC Repair',
    customer: 'John Doe',
    location: 'Colombo 7',
    date: '2025-10-30',
    time: '10:00 AM',
    status: 'Pending',
    priority: 'High',
    price: 5000,
    description: 'AC not cooling properly, needs maintenance',
    customerContact: '+94 77 123 4567',
  },
  {
    id: 2,
    serviceType: 'Plumbing',
    customer: 'Jane Smith',
    location: 'Nugegoda',
    date: '2025-10-29',
    time: '2:30 PM',
    status: 'In Progress',
    priority: 'Medium',
    price: 3500,
    description: 'Water leakage in bathroom',
    customerContact: '+94 76 234 5678',
  },
  {
    id: 3,
    serviceType: 'Electrical',
    customer: 'Mike Johnson',
    location: 'Rajagiriya',
    date: '2025-10-31',
    time: '11:30 AM',
    status: 'Completed',
    priority: 'Low',
    price: 2500,
    description: 'Need to install new light fixtures',
    customerContact: '+94 71 345 6789',
  },
];

const ServiceRequests: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewRequest = (request: any) => {
    setSelectedRequest(request);
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

  const filteredRequests = mockRequests.filter(request =>
    Object.values(request).some(value =>
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
          { label: 'Total Requests', value: '25', color: 'primary.main' },
          { label: 'Pending', value: '10', color: 'error.main' },
          { label: 'In Progress', value: '8', color: 'warning.main' },
          { label: 'Completed', value: '7', color: 'success.main' }
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
              <TableCell>Service Type</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Date & Time</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <Typography variant="subtitle2">{request.serviceType}</Typography>
                </TableCell>
                <TableCell>{request.customer}</TableCell>
                <TableCell>{request.location}</TableCell>
                <TableCell>
                  <Typography variant="body2">{request.date}</Typography>
                  <Typography variant="caption" color="text.secondary">{request.time}</Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ color: getPriorityColor(request.priority), fontWeight: 'bold' }}>
                    {request.priority}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={request.status}
                    color={getStatusColor(request.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => handleViewRequest(request)}
                    title="View Details"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  {request.status !== 'Completed' && (
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Service Request Details Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedRequest && (
          <>
            <DialogTitle>
              <Typography variant="h6">Service Request Details</Typography>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BuildIcon color="action" />
                  <Box>
                    <Typography variant="subtitle2">Service Type</Typography>
                    <Typography>{selectedRequest.serviceType}</Typography>
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="action" />
                  <Box>
                    <Typography variant="subtitle2">Customer</Typography>
                    <Typography>{selectedRequest.customer}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedRequest.customerContact}
                    </Typography>
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon color="action" />
                  <Box>
                    <Typography variant="subtitle2">Location</Typography>
                    <Typography>{selectedRequest.location}</Typography>
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarTodayIcon color="action" />
                    <Box>
                      <Typography variant="subtitle2">Date</Typography>
                      <Typography>{selectedRequest.date}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon color="action" />
                    <Box>
                      <Typography variant="subtitle2">Time</Typography>
                      <Typography>{selectedRequest.time}</Typography>
                    </Box>
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoneyIcon color="action" />
                  <Box>
                    <Typography variant="subtitle2">Price</Typography>
                    <Typography>Rs. {selectedRequest.price.toLocaleString()}</Typography>
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <DescriptionIcon color="action" />
                  <Box>
                    <Typography variant="subtitle2">Description</Typography>
                    <Typography>{selectedRequest.description}</Typography>
                  </Box>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              {selectedRequest.status !== 'Completed' && (
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