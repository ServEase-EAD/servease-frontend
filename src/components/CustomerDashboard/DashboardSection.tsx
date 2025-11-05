import React from "react";
import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import { Dashboard as DashboardIcon } from "@mui/icons-material";

interface DashboardSectionProps {
  customer: any;
  onNavigate: (tab: string) => void;
  onShowProfileData: () => void;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({
  customer,
  onNavigate,
  onShowProfileData,
}) => {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 3,
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      }}
    >
      {/* Customer Portal Card */}
      <Card elevation={3}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <DashboardIcon color="primary" sx={{ mr: 2 }} />
            <Typography variant="h6" component="h2">
              Customer Portal
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" paragraph>
            Access all your customer services and manage your account from this
            dashboard.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="primary" fontWeight="medium">
              ✓ You have full access to customer features
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              • View and manage your services
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Track service requests
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Update your profile information
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Quick Actions Card */}
      <Card elevation={3}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Quick Actions
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: 2,
            }}
          >
            <Button
              variant="outlined"
              fullWidth
              sx={{ py: 1.5, textTransform: "none" }}
            >
              Request Service
            </Button>
            <Button
              variant="outlined"
              fullWidth
              sx={{ py: 1.5, textTransform: "none" }}
            >
              View Service History
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => onNavigate("profile")}
              sx={{ py: 1.5, textTransform: "none" }}
            >
              Update Profile
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={onShowProfileData}
              sx={{ py: 1.5, textTransform: "none" }}
            >
              View Customer Profile Data
            </Button>
            <Button
              variant="outlined"
              fullWidth
              sx={{ py: 1.5, textTransform: "none" }}
            >
              Contact Support
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Service Summary Card */}
      <Card elevation={3}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Service Summary
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h3" color="primary" fontWeight="bold">
              {customer?.total_services || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Total Services Completed
            </Typography>
            {customer?.last_service_date && (
              <Typography variant="body2" color="text.secondary">
                Last Service:{" "}
                {new Date(customer.last_service_date).toLocaleDateString()}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              Preferred Contact:{" "}
              {customer?.preferred_contact_method || "Not set"}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardSection;