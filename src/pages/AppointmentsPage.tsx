import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { AppointmentList } from "../components/CustomerDashboard/Appointments";

const AppointmentsPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Appointments Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage all service appointments
        </Typography>
      </Box>

      <AppointmentList />
    </Container>
  );
};

export default AppointmentsPage;
