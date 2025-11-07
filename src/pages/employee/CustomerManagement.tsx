import React, { useState } from "react";
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
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";

// Mock customer data
const mockCustomers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+94 77 123 4567",
    location: "Colombo 7",
    totalServices: 5,
    lastService: "2025-10-15",
    status: "Active",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@email.com",
    phone: "+94 76 234 5678",
    location: "Nugegoda",
    totalServices: 3,
    lastService: "2025-10-20",
    status: "Active",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.j@email.com",
    phone: "+94 71 345 6789",
    location: "Rajagiriya",
    totalServices: 1,
    lastService: "2025-10-25",
    status: "Inactive",
  },
];

const CustomerManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const filteredCustomers = mockCustomers.filter((customer) =>
    Object.values(customer).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Summary Cards */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          mb: 4,
        }}
      >
        {[
          { label: "Total Customers", value: "45", color: "primary.main" },
          { label: "Active Customers", value: "38", color: "success.main" },
          { label: "New This Month", value: "12", color: "info.main" },
          { label: "Average Services", value: "3.5", color: "warning.main" },
        ].map((stat, index) => (
          <Box
            key={index}
            sx={{
              flex: { xs: "0 0 calc(50% - 12px)", sm: "0 0 calc(25% - 18px)" },
            }}
          >
            <Card>
              <CardContent>
                <Typography
                  variant="h4"
                  sx={{
                    color: stat.color,
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ textAlign: "center", color: "text.secondary" }}
                >
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
          placeholder="Search customers..."
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

      {/* Customers Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Total Services</TableCell>
              <TableCell>Last Service</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar>{customer.name.charAt(0)}</Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {customer.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {customer.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.location}</TableCell>
                <TableCell>{customer.totalServices}</TableCell>
                <TableCell>{customer.lastService}</TableCell>
                <TableCell>
                  <Chip
                    label={customer.status}
                    color={customer.status === "Active" ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => handleViewCustomer(customer)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Customer Details Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedCustomer && (
          <>
            <DialogTitle>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ width: 56, height: 56 }}>
                  {selectedCustomer.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedCustomer.name}</Typography>
                  <Chip
                    label={selectedCustomer.status}
                    color={
                      selectedCustomer.status === "Active"
                        ? "success"
                        : "default"
                    }
                    size="small"
                  />
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <EmailIcon color="action" />
                  <Typography>{selectedCustomer.email}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PhoneIcon color="action" />
                  <Typography>{selectedCustomer.phone}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LocationOnIcon color="action" />
                  <Typography>{selectedCustomer.location}</Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Card
                    variant="outlined"
                    sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 8px)" } }}
                  >
                    <CardContent>
                      <Typography color="text.secondary">
                        Total Services
                      </Typography>
                      <Typography variant="h6">
                        {selectedCustomer.totalServices}
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card
                    variant="outlined"
                    sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 8px)" } }}
                  >
                    <CardContent>
                      <Typography color="text.secondary">
                        Last Service
                      </Typography>
                      <Typography variant="h6">
                        {selectedCustomer.lastService}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CustomerManagement;
