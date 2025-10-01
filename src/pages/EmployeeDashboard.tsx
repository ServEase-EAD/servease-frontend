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
  Work,
  Dashboard as DashboardIcon,
  ExitToApp,
  Assessment,
} from "@mui/icons-material";
import { Link } from "react-router-dom";

const EmployeeDashboard: React.FC = () => {
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
              <Work sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  Employee Dashboard
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Welcome back! You are logged in as an Employee
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
                  Employee Portal
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" paragraph>
                Manage customer services and handle administrative tasks from
                your employee dashboard.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="primary" fontWeight="medium">
                  ✓ You have employee-level access
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  • Process customer requests
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Manage service assignments
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Access employee tools
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card elevation={3}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" component="h2" gutterBottom>
                Employee Actions
              </Typography>
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
              >
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ py: 1.5, textTransform: "none" }}
                >
                  View Assigned Tasks
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ py: 1.5, textTransform: "none" }}
                >
                  Customer Management
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ py: 1.5, textTransform: "none" }}
                >
                  Service Requests
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ py: 1.5, textTransform: "none" }}
                >
                  Reports & Analytics
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card elevation={3}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Assessment color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6" component="h2">
                  Work Summary
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="body2"
                  color="success.main"
                  fontWeight="medium"
                >
                  ✓ Employee Status: Active
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Role: Employee
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Login Status: Authenticated
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last Login: Today
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Department: Service Management
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card elevation={3}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" component="h2" gutterBottom>
                Today's Overview
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Pending Tasks:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    5
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Completed Today:
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="medium"
                    color="success.main"
                  >
                    3
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Customer Requests:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    8
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default EmployeeDashboard;
