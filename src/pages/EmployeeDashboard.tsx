import React, { useState, lazy, Suspense } from "react";
import {
  Box,
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
  AccessTime,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { NotificationProvider } from "../contexts/NotificationContext";
import { NotificationBellMUI } from "../components/notifications";
import { getUserFromToken } from "../services/authService";
import LoadingSpinner from "../components/LoadingSpinner";

// Lazy load components for better performance
const MyTasks = lazy(() => import("./employee/MyTasks"));
const TimeLogs = lazy(() => import("./employee/TimeLogs"));
const Profile = lazy(() => import("./employee/Profile"));

const EmployeeDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("tasks");

  const user = getUserFromToken();
  const userId = user?.id || null;

  const navigationItems = [
    { label: "My Tasks", value: "tasks", icon: Assignment },
    { label: "Time Logs", value: "timelogs", icon: AccessTime },
    { label: "My Profile", value: "profile", icon: People },
  ];

  const renderContent = () => {
    return (
      <Suspense fallback={<LoadingSpinner message="Loading..." />}>
        {activeSection === "tasks" && <MyTasks />}
        {activeSection === "timelogs" && <TimeLogs />}
        {activeSection === "profile" && <Profile />}
      </Suspense>
    );
  };

  return (
    <NotificationProvider userId={userId}>
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        {/* Header */}
        <AppBar
          position="fixed"
          sx={{
            backgroundColor: "#FF4D00",
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <NotificationBellMUI />
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
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Box
          sx={{
            display: "flex",
            flex: 1,
            pt: "64px", // Height of AppBar
          }}
        >
          {/* Left Sidebar */}
          <Box
            sx={{
              width: 280,
              flexShrink: 0,
              bgcolor: "background.paper",
              borderRight: 1,
              borderColor: "divider",
              position: "fixed",
              height: "calc(100vh - 64px)",
              pt: 2,
            }}
          >
            <Box sx={{ px: 2 }}>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.value}
                    variant={
                      activeSection === item.value ? "contained" : "text"
                    }
                    fullWidth
                    startIcon={<Icon />}
                    onClick={() => setActiveSection(item.value)}
                    sx={{
                      justifyContent: "flex-start",
                      textTransform: "none",
                      mb: 1,
                      py: 1.5,
                      color: activeSection === item.value ? "white" : "#FF4D00",
                      backgroundColor:
                        activeSection === item.value
                          ? "#FF4D00"
                          : "transparent",
                      "&:hover": {
                        backgroundColor:
                          activeSection === item.value
                            ? "#FF4D00"
                            : "rgba(255, 77, 0, 0.08)",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>
          </Box>

          {/* Main Content Area */}
          <Box
            sx={{
              flexGrow: 1,
              p: 3,
              ml: "280px", // Width of sidebar
              backgroundColor: "#f5f5f5",
              minHeight: "calc(100vh - 64px)",
            }}
          >
            {renderContent()}
          </Box>
        </Box>
      </Box>
    </NotificationProvider>
  );
};

export default EmployeeDashboard;
