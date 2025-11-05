import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
} from "@mui/material";
import { Event as EventIcon } from "@mui/icons-material";

const AppointmentsSection: React.FC = () => {
  return (
    <Card elevation={3}>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <EventIcon color="primary" sx={{ mr: 2, fontSize: 30 }} />
          <Typography variant="h5" component="h2">
            My Appointments
          </Typography>
        </Box>

        {/* Info Alert */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Appointments feature is coming soon! You'll be able to view and
            manage your service appointments here.
          </Typography>
        </Alert>

        {/* Empty State */}
        <Box sx={{ textAlign: "center", py: 4 }}>
          <EventIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No appointments scheduled
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Schedule your first appointment to get started with our services.
          </Typography>
          <Button
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #FF4D00 0%, #FF7433 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #E63900 0%, #FF5722 100%)",
              },
            }}
          >
            Schedule Appointment
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AppointmentsSection;