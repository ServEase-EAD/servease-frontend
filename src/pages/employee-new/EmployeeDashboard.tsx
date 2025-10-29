import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as TaskIcon,
  People as CustomerIcon,
  Build as ServiceIcon,
  Assessment as ReportIcon,
  ExitToApp as LogoutIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";

// Import components
import DashboardContent from "./DashboardContent";
import ViewAssignedTasks from "./ViewAssignedTasks";
import CustomerManagement from "./CustomerManagement";
import ServiceRequests from "./ServiceRequests";
import ReportsAnalytics from "./ReportsAnalytics";

const DRAWER_WIDTH = 280;

const EmployeeDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, value: "dashboard" },
    { text: "View Assigned Tasks", icon: <TaskIcon />, value: "tasks" },
    { text: "Customer Management", icon: <CustomerIcon />, value: "customers" },
    { text: "Service Requests", icon: <ServiceIcon />, value: "services" },
    { text: "Reports & Analytics", icon: <ReportIcon />, value: "reports" },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardContent />;
      case "tasks":
        return <ViewAssignedTasks />;
      case "customers":
        return <CustomerManagement />;
      case "services":
        return <ServiceRequests />;
      case "reports":
        return <ReportsAnalytics />;
      default:
        return <DashboardContent />;
    }
  };

  const drawer = (
    <Box sx={{ mt: 2 }}>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.value} disablePadding>
            <ListItemButton
              onClick={() => {
                setActiveSection(item.value);
                if (isMobile) {
                  setMobileOpen(false);
                }
              }}
              selected={activeSection === item.value}
              sx={{
                py: 1.5,
                mx: 1,
                borderRadius: 1,
                "&.Mui-selected": {
                  backgroundColor: "primary.light",
                  "&:hover": {
                    backgroundColor: "primary.main",
                    color: "white",
                    "& .MuiListItemIcon-root": {
                      color: "white",
                    },
                  },
                  "& .MuiListItemIcon-root": {
                    color: "primary.main",
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: activeSection === item.value ? "primary.main" : "inherit",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: DRAWER_WIDTH,
            backgroundColor: theme.palette.background.default,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: DRAWER_WIDTH,
            backgroundColor: theme.palette.background.default,
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            background: "linear-gradient(135deg, #FF4D00 0%, #FF7433 100%)",
            color: "white",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ display: { md: "none" } }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                  }}
                >
                  Employee Dashboard
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    opacity: 0.9,
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  }}
                >
                  Welcome back! You are logged in as an Employee
                </Typography>
              </Box>
            </Box>
            <Button
              component={Link}
              to="/login"
              variant="outlined"
              startIcon={<LogoutIcon />}
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
        </Box>

        {/* Page Content */}
        <Box sx={{ p: 3, flexGrow: 1 }}>{renderContent()}</Box>
      </Box>
    </Box>
  );
};

export default EmployeeDashboard;