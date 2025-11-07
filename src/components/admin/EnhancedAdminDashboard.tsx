import React, { useState, useEffect, lazy, Suspense } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Alert,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People,
  EventNote,
  Build,
  DirectionsCar,
  Assessment,
  ExitToApp,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  getDashboardStats,
  type DashboardStats,
} from "../../services/adminService";
import { logout } from "../../services/authService";
import { getUserFromToken } from "../../services/authService";
import { NotificationProvider } from "../../contexts/NotificationContext";
import { NotificationBellMUI } from "../notifications/NotificationBellMUI";
import LoadingSpinner from "../LoadingSpinner";

// Lazy load heavy components
const AdminDashboard = lazy(() => import("../../pages/AdminDashboard"));
const AppointmentManagement = lazy(() => import("./AppointmentManagement"));
const ProjectManagement = lazy(() => import("./ProjectManagement"));

const DRAWER_WIDTH = 240;
const STATS_CACHE_KEY = "admin_dashboard_stats";
const STATS_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

const EnhancedAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    () => {
      // Initialize from cache if available
      const cached = localStorage.getItem(STATS_CACHE_KEY);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < STATS_CACHE_DURATION) {
            return data;
          }
        } catch (e) {
          console.error("Error parsing cached stats:", e);
        }
      }
      return null;
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user information from JWT token for notifications
  const user = getUserFromToken();
  const userId = user?.id || null;

  useEffect(() => {
    // Only fetch if cache is expired or doesn't exist
    const cached = localStorage.getItem(STATS_CACHE_KEY);
    let shouldFetch = true;

    if (cached) {
      try {
        const { timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < STATS_CACHE_DURATION) {
          shouldFetch = false;
        }
      } catch (e) {
        console.error("Error checking cache:", e);
      }
    }

    if (shouldFetch) {
      loadDashboardStats();
    }
  }, []);

  const loadDashboardStats = async () => {
    setLoading(true);
    try {
      const stats = await getDashboardStats();
      setDashboardStats(stats);

      // Cache the stats with timestamp
      localStorage.setItem(
        STATS_CACHE_KEY,
        JSON.stringify({
          data: stats,
          timestamp: Date.now(),
        })
      );

      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard stats"
      );

      // Try to use cached data on error
      const cached = localStorage.getItem(STATS_CACHE_KEY);
      if (cached) {
        try {
          const { data } = JSON.parse(cached);
          setDashboardStats(data);
        } catch (e) {
          console.error("Error using cached stats:", e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { label: "Dashboard", icon: <DashboardIcon />, index: 0 },
    { label: "Users", icon: <People />, index: 1 },
    { label: "Appointments", icon: <EventNote />, index: 2 },
    { label: "Projects", icon: <Build />, index: 3 },
    { label: "Vehicles", icon: <DirectionsCar />, index: 4 },
    { label: "Employee Workload", icon: <Assessment />, index: 5 },
  ];

  const renderOverview = () => {
    if (!dashboardStats) return null;

    const overviewCards = [
      {
        title: "Total Vehicles",
        value: dashboardStats.total_vehicles,
        icon: <DirectionsCar fontSize="large" />,
        color: "#1976d2",
      },
      {
        title: "Active Projects",
        value: dashboardStats.active_projects,
        icon: <Build fontSize="large" />,
        color: "#2e7d32",
      },
      {
        title: "Pending Projects",
        value: dashboardStats.pending_projects,
        icon: <Assessment fontSize="large" />,
        color: "#ed6c02",
      },
      {
        title: "Total Employees",
        value: dashboardStats.total_employees,
        icon: <People fontSize="large" />,
        color: "#9c27b0",
      },
      {
        title: "Total Appointments",
        value: dashboardStats.appointment_stats?.total_appointments || 0,
        icon: <EventNote fontSize="large" />,
        color: "#0288d1",
      },
      {
        title: "Pending Appointments",
        value: dashboardStats.appointment_stats?.pending_appointments || 0,
        icon: <EventNote fontSize="large" />,
        color: "#f57c00",
      },
    ];

    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard Overview
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 3,
            mt: 2,
          }}
        >
          {overviewCards.map((card, index) => (
            <Card
              key={index}
              sx={{
                bgcolor: card.color,
                color: "white",
                height: "100%",
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="h3" component="div">
                      {card.value}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {card.title}
                    </Typography>
                  </Box>
                  <Box>{card.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Key Metrics */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
            mt: 3,
          }}
        >
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Status
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>Active Projects</Typography>
                  <Typography fontWeight="bold">
                    {dashboardStats.active_projects}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>Pending Approval</Typography>
                  <Typography fontWeight="bold" color="warning.main">
                    {dashboardStats.pending_projects}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography>Total Projects</Typography>
                  <Typography fontWeight="bold">
                    {dashboardStats.total_projects}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Appointment Status
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>Pending Approval</Typography>
                  <Typography fontWeight="bold" color="warning.main">
                    {dashboardStats.appointment_stats?.pending_appointments ||
                      0}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>Confirmed</Typography>
                  <Typography fontWeight="bold" color="info.main">
                    {dashboardStats.appointment_stats?.confirmed_appointments ||
                      0}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography>Completed</Typography>
                  <Typography fontWeight="bold" color="success.main">
                    {dashboardStats.appointment_stats?.completed_appointments ||
                      0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Quick Actions */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setActiveTab(2)}
              >
                Manage Appointments
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setActiveTab(3)}
              >
                Manage Projects
              </Button>
              <Button
                variant="contained"
                color="info"
                onClick={() => setActiveTab(1)}
              >
                Manage Users
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  };

  const renderProjectManagement = () => {
    return <ProjectManagement />;
  };

  const renderVehicleManagement = () => {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Vehicle Management
          </Typography>
          <Typography color="text.secondary" paragraph>
            Vehicle management features coming soon. You'll be able to:
          </Typography>
          <ul>
            <li>View all registered vehicles</li>
            <li>Filter by active projects/services</li>
            <li>Filter by assigned employees</li>
            <li>View complete service history</li>
            <li>Track vehicle maintenance status</li>
          </ul>
        </CardContent>
      </Card>
    );
  };

  const renderEmployeeWorkload = () => {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Employee Workload Management
          </Typography>
          <Typography color="text.secondary" paragraph>
            Employee workload monitoring coming soon. You'll be able to:
          </Typography>
          <ul>
            <li>View workload for all employees</li>
            <li>See active tasks per employee</li>
            <li>Monitor working hours and completion rates</li>
            <li>Assign or reassign tasks</li>
            <li>View performance metrics</li>
          </ul>
        </CardContent>
      </Card>
    );
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          ServEase Admin
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.index} disablePadding>
            <ListItemButton
              selected={activeTab === item.index}
              onClick={() => setActiveTab(item.index)}
            >
              <ListItemIcon
                sx={{
                  color: activeTab === item.index ? "primary.main" : "inherit",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <NotificationProvider userId={userId}>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
            ml: { sm: `${DRAWER_WIDTH}px` },
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1 }}
            >
              {menuItems[activeTab]?.label || "Dashboard"}
            </Typography>
            <NotificationBellMUI />
            <Button
              color="inherit"
              startIcon={<ExitToApp />}
              onClick={handleLogout}
              sx={{ display: { xs: "none", sm: "inline-flex" }, ml: 1 }}
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        <Box
          component="nav"
          sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
        >
          {/* Mobile drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: DRAWER_WIDTH,
              },
            }}
          >
            {drawer}
          </Drawer>
          {/* Desktop drawer */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: DRAWER_WIDTH,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          }}
        >
          <Toolbar />

          {error && (
            <Alert
              severity="error"
              onClose={() => setError(null)}
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
          )}

          {loading ? (
            <LoadingSpinner message="Loading dashboard stats..." />
          ) : (
            <Suspense
              fallback={<LoadingSpinner message="Loading section..." />}
            >
              {activeTab === 0 && renderOverview()}
              {activeTab === 1 && <AdminDashboard />}
              {activeTab === 2 && <AppointmentManagement />}
              {activeTab === 3 && renderProjectManagement()}
              {activeTab === 4 && renderVehicleManagement()}
              {activeTab === 5 && renderEmployeeWorkload()}
            </Suspense>
          )}
        </Box>
      </Box>
    </NotificationProvider>
  );
};

export default EnhancedAdminDashboard;
