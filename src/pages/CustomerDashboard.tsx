import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Button,
  Paper,
} from "@mui/material";
import {
  Person,
  Dashboard as DashboardIcon,
  ExitToApp,
} from "@mui/icons-material";
import { Link } from "react-router-dom";

const CustomerDashboard: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 4,
            background: "linear-gradient(135deg, #FF4D00 0%, #FF7433 100%)",
            color: "white",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Person sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  Customer Dashboard
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Welcome back! You are logged in as a Customer
                </Typography>
              </Box>
            </Box>
            <Button
              component={Link}
              to="/login"
              variant="outlined"
              startIcon={<ExitToApp />}
              sx={{
                color: "white",
                borderColor: "white",
                "&:hover": {
                  borderColor: "white",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              Logout
            </Button>
          </Box>
        </Paper>

        {/* Dashboard Content */}
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >
          <Card elevation={3}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <DashboardIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6" component="h2">
                  Customer Portal
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" paragraph>
                Access all your customer services and manage your account from
                this dashboard.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="primary" fontWeight="medium">
                  ✓ You have full access to customer features
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
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

          <Card elevation={3}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" component="h2" gutterBottom>
                Quick Actions
              </Typography>
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
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
                  sx={{ py: 1.5, textTransform: "none" }}
                >
                  Update Profile
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

          <Card elevation={3}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" component="h2" gutterBottom>
                Account Status
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="body2"
                  color="success.main"
                  fontWeight="medium"
                >
                  ✓ Account Active
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Role: Customer
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Login Status: Authenticated
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last Login: Today
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default CustomerDashboard;
