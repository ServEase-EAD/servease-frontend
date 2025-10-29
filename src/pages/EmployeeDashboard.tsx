import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  AppBar,
  Toolbar,
} from "@mui/material";
import {
  Work,
  ExitToApp,
  Assignment,
  People,
  Build,
  Assessment,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import ViewAssignedTasks from "./employee-new/ViewAssignedTasks";
import CustomerManagement from "./employee-new/CustomerManagement";
import ServiceRequests from "./employee-new/ServiceRequests";
import ReportsAnalytics from "./employee-new/ReportsAnalytics";

const EmployeeDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("tasks");

  const navigationItems = [
    { label: 'View Assigned Tasks', value: 'tasks', icon: Assignment },
    { label: 'Customer Management', value: 'customers', icon: People },
    { label: 'Service Requests', value: 'services', icon: Build },
    { label: 'Reports & Analytics', value: 'reports', icon: Assessment }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "tasks":
        return <ViewAssignedTasks />;
      case "customers":
        return <CustomerManagement />;
      case "services":
        return <ServiceRequests />;
      case "reports":
        return <ReportsAnalytics />;
      default:
        return <ViewAssignedTasks />;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="fixed" sx={{ backgroundColor: "#FF4D00", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Box sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            width: '100%'
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Work sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h6" component="h1">
                  ServEase
                </Typography>
                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                  Employee Dashboard
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
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ 
        display: 'flex', 
        flex: 1, 
        pt: '64px' // Height of AppBar
      }}>
        {/* Left Sidebar */}
        <Box sx={{ 
          width: 280, 
          flexShrink: 0,
          bgcolor: 'background.paper',
          borderRight: 1,
          borderColor: 'divider',
          position: 'fixed',
          height: 'calc(100vh - 64px)',
          pt: 2
        }}>
          <Box sx={{ px: 2 }}>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.value}
                  variant={activeSection === item.value ? "contained" : "text"}
                  fullWidth
                  startIcon={<Icon />}
                  onClick={() => setActiveSection(item.value)}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    mb: 1,
                    py: 1.5,
                    color: activeSection === item.value ? 'white' : '#FF4D00',
                    backgroundColor: activeSection === item.value ? '#FF4D00' : 'transparent',
                    '&:hover': {
                      backgroundColor: activeSection === item.value ? '#FF4D00' : 'rgba(255, 77, 0, 0.08)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          {/* Status Cards */}
          <Box sx={{ p: 2 }}>
            <Card elevation={0} sx={{ mb: 2, bgcolor: 'rgba(255, 77, 0, 0.05)' }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Work Summary
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="success.main">
                    ✓ Employee Status: Active
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Role: Service Employee
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card elevation={0} sx={{ bgcolor: 'rgba(255, 77, 0, 0.05)' }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Today's Overview
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">Pending:</Typography>
                    <Typography variant="body2" color="error.main">5</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">Completed:</Typography>
                    <Typography variant="body2" color="success.main">3</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">New Requests:</Typography>
                    <Typography variant="body2" color="primary.main">8</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box sx={{ 
          flexGrow: 1, 
          p: 3,
          ml: '280px', // Width of sidebar
          backgroundColor: '#f5f5f5',
          minHeight: 'calc(100vh - 64px)'
        }}>
          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
};

export default EmployeeDashboard;
