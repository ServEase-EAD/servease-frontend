import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  Person,
  Dashboard as DashboardIcon,
  ExitToApp,
  Edit,
  Add,
  LocationOn,
  Business,
  Phone,
  Email,
  CalendarToday,
  CheckCircle,
  Warning,
  Event as EventIcon,
  Work as ProjectIcon,
  AccountCircle,
  Menu as MenuIcon,
  Chat as ChatIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { NotificationProvider } from "../contexts/NotificationContext";
import { NotificationBellMUI } from "../components/notifications";
import { getUserFromToken } from "../services/authService";
import { useCustomer } from "../hooks/useCustomer";
import { CustomerProfileForm } from "../components/CustomerProfileForm";

const CustomerDashboard: React.FC = () => {
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showProfileData, setShowProfileData] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get actual user ID from JWT token
  const user = getUserFromToken();
  const userId = user?.id || null;

  // Check if user is authenticated
  const isAuthenticated = user !== null;

  // Use customer hook for data management
  const {
    customer,
    loading,
    error,
    hasProfile,
    profileCheckLoading,
    createProfile,
    updateProfile,
    retryConnection,
  } = useCustomer();

  // If user is not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ py: 8, textAlign: "center" }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Authentication Required
            </Typography>
            <Typography variant="body1">
              Please log in to access your customer dashboard.
            </Typography>
          </Alert>
          <Button
            component={Link}
            to="/login"
            variant="contained"
            size="large"
            sx={{
              background: "linear-gradient(135deg, #FF4D00 0%, #FF7433 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #E63900 0%, #FF5722 100%)",
              },
            }}
          >
            Go to Login
          </Button>
        </Box>
      </Container>
    );
  }

  const handleCreateProfile = async (data: any) => {
    try {
      await createProfile(data);
      setShowProfileForm(false);
    } catch (error) {
      // Error is handled by the hook
      console.error("Failed to create profile:", error);
    }
  };

  const handleUpdateProfile = async (data: any) => {
    try {
      await updateProfile(data);
      setShowProfileForm(false);
      setIsEditMode(false);
    } catch (error) {
      // Error is handled by the hook
      console.error("Failed to update profile:", error);
    }
  };

  const openCreateForm = () => {
    setIsEditMode(false);
    setShowProfileForm(true);
  };

  const openEditForm = () => {
    setIsEditMode(true);
    setShowProfileForm(true);
  };

  const closeForm = () => {
    setShowProfileForm(false);
    setIsEditMode(false);
  };

  // Sidebar menu items
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <DashboardIcon />, requiresProfile: true },
    { id: "appointments", label: "Service", icon: <EventIcon />, requiresProfile: true },
    { id: "projects", label: "Projects", icon: <ProjectIcon />, requiresProfile: true },
    { id: "profile", label: "Profile", icon: <AccountCircle />, requiresProfile: false },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTabChange = (tabId: string) => {
    // Prevent navigation to profile-required sections if no profile exists
    const menuItem = menuItems.find(item => item.id === tabId);
    if (menuItem?.requiresProfile && !hasProfile) {
      return; // Don't allow navigation
    }
    setActiveTab(tabId);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboardContent();
      case "appointments":
        return renderAppointmentsContent();
      case "projects":
        return renderProjectsContent();
      case "profile":
        return renderProfileContent();
      default:
        return renderDashboardContent();
    }
  };

  // Dashboard content (original dashboard cards)
  const renderDashboardContent = () => (
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
            <Typography
              variant="body2"
              color="primary"
              fontWeight="medium"
            >
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
              onClick={() => setActiveTab("profile")}
              sx={{ py: 1.5, textTransform: "none" }}
            >
              Update Profile
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setShowProfileData(true)}
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

      <Card elevation={3}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Service Summary
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="h3"
              color="primary"
              fontWeight="bold"
            >
              {customer?.total_services || 0}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Total Services Completed
            </Typography>
            {customer?.last_service_date && (
              <Typography variant="body2" color="text.secondary">
                Last Service: {new Date(customer.last_service_date).toLocaleDateString()}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              Preferred Contact: {customer?.preferred_contact_method || "Not set"}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  // Appointments content
  const renderAppointmentsContent = () => (
    <Card elevation={3}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <EventIcon color="primary" sx={{ mr: 2, fontSize: 30 }} />
          <Typography variant="h5" component="h2">
            My Appointments
          </Typography>
        </Box>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Appointments feature is coming soon! You'll be able to view and manage your service appointments here.
          </Typography>
        </Alert>
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

  // Projects content
  const renderProjectsContent = () => (
    <Card elevation={3}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <ProjectIcon color="primary" sx={{ mr: 2, fontSize: 30 }} />
          <Typography variant="h5" component="h2">
            My Projects
          </Typography>
        </Box>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Projects feature is coming soon! You'll be able to view and track your service projects here.
          </Typography>
        </Alert>
        <Box sx={{ textAlign: "center", py: 4 }}>
          <ProjectIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No projects available
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Your service projects will appear here once they are created.
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
            Request Service
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  // Profile content (current profile display)
  const renderProfileContent = () => (
    <>
      {customer ? (
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <AccountCircle color="primary" sx={{ mr: 2, fontSize: 30 }} />
                <Typography variant="h5" component="h2">
                  Customer Profile
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Edit />}
                onClick={openEditForm}
              >
                Edit Profile
              </Button>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 3 }}>
              {/* Personal Information */}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Personal Information
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Email sx={{ mr: 1, fontSize: 18, color: "text.secondary" }} />
                  <Typography variant="body2">{customer.email || "Not provided"}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Person sx={{ mr: 1, fontSize: 18, color: "text.secondary" }} />
                  <Typography variant="body2">
                    {customer.full_name || `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || "Not provided"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Phone sx={{ mr: 1, fontSize: 18, color: "text.secondary" }} />
                  <Typography variant="body2">{customer.phone_number || "Not provided"}</Typography>
                </Box>
              </Box>

              {/* Address Information */}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Address
                </Typography>
                <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}>
                  <LocationOn sx={{ mr: 1, fontSize: 18, color: "text.secondary", mt: 0.5 }} />
                  <Typography variant="body2">
                    {customer.full_address || "No address provided"}
                  </Typography>
                </Box>
              </Box>

              {/* Business Information */}
              {customer.is_business_customer && (
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Business Information
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Business sx={{ mr: 1, fontSize: 18, color: "text.secondary" }} />
                    <Typography variant="body2">{customer.company_name}</Typography>
                  </Box>
                  {customer.business_type && (
                    <Typography variant="body2" color="text.secondary">
                      Type: {customer.business_type}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Account Status */}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Account Status
                </Typography>
                {/* <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CheckCircle sx={{ mr: 1, fontSize: 18, color: customer.is_verified ? "success.main" : "warning.main" }} />
                  <Chip
                    label={customer.is_verified ? "Verified" : "Pending Verification"}
                    color={customer.is_verified ? "success" : "warning"}
                    size="small"
                  />
                </Box> */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CalendarToday sx={{ mr: 1, fontSize: 18, color: "text.secondary" }} />
                  <Typography variant="body2">
                    Customer since: {new Date(customer.customer_since).toLocaleDateString()}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Total Services: {customer.total_services}
                </Typography>
              </Box>
            </Box>

            {/* <Box sx={{ mt: 3, textAlign: "center" }}>
              <Button
                variant="outlined"
                onClick={() => setShowProfileData(true)}
                sx={{ mr: 2 }}
              >
                View Complete Profile Data
              </Button>
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={openEditForm}
                sx={{
                  background: "linear-gradient(135deg, #FF4D00 0%, #FF7433 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #E63900 0%, #FF5722 100%)",
                  },
                }}
              >
                Edit Profile
              </Button>
            </Box> */}
          </CardContent>
        </Card>
      ) : (
        <Card elevation={3}>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <AccountCircle sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Profile Not Found
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Complete your profile to access all customer features.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={openCreateForm}
              sx={{
                background: "linear-gradient(135deg, #FF4D00 0%, #FF7433 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #E63900 0%, #FF5722 100%)",
                },
              }}
            >
              Create Profile
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );

  return (
    <NotificationProvider userId={userId}>
      <Box sx={{ display: "flex" }}>
        {/* Sidebar */}
        <Drawer
          variant="permanent"
          sx={{
            width: 280,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              background: "linear-gradient(135deg, #FF4D00 0%, #FF7433 100%)",
              color: "white",
            },
          }}
        >
          {/* Header */}
          <Box sx={{ p: 3, borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: "white",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h6" sx={{ color: "#FF4D00", fontWeight: "bold" }}>
                  S
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" component="h1" fontWeight="bold">
                  ServEase
                </Typography>
                {/* <Typography variant="body2" sx={{ opacity: 0.8, fontSize: "0.75rem" }}>
                  Customer Dashboard
                </Typography> */}
              </Box>
            </Box>
          </Box>

          {/* Navigation Menu */}
          <List sx={{ pt: 2 }}>
            {menuItems.map((item) => {
              const isDisabled = item.requiresProfile && !hasProfile;
              return (
                <ListItem key={item.id} disablePadding>
                  <Tooltip 
                    title={isDisabled ? "Complete your profile to access this section" : ""} 
                    placement="right"
                    arrow
                  >
                    <Box sx={{ width: "100%" }}>
                      <ListItemButton
                        onClick={() => handleTabChange(item.id)}
                        disabled={isDisabled}
                        sx={{
                          mx: 2,
                          mb: 1,
                          borderRadius: 1,
                          backgroundColor: activeTab === item.id ? "rgba(255,255,255,0.2)" : "transparent",
                          opacity: isDisabled ? 0.5 : 1,
                          cursor: isDisabled ? "not-allowed" : "pointer",
                          "&:hover": {
                            backgroundColor: isDisabled ? "transparent" : "rgba(255,255,255,0.1)",
                          },
                          "&.Mui-disabled": {
                            opacity: 0.5,
                          },
                        }}
                      >
                        <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.label}
                          primaryTypographyProps={{
                            fontWeight: activeTab === item.id ? "bold" : "normal",
                          }}
                        />
                      </ListItemButton>
                    </Box>
                  </Tooltip>
                </ListItem>
              );
            })}
          </List>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", mx: 2, my: 2 }} />

          {/* User Info Section */}
          <Box sx={{ p: 2, mt: "auto", borderTop: "1px solid rgba(255,255,255,0.2)" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Person sx={{ mr: 2, fontSize: 20 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  {user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.email || "Customer"}
                </Typography>
                {/* <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {customer?.is_verified ? "✓ Verified" : "⚠ Pending Verification"}
                </Typography> */}
              </Box>
            </Box>
            
          </Box>
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            backgroundColor: "#f5f5f5",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Title Bar */}
          <Box
            sx={{
              backgroundColor: "white",
              borderBottom: "1px solid #e0e0e0",
              px: 3,
              py: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <Typography variant="h5" component="h1" fontWeight="bold" color="text.primary">
              {menuItems.find(item => item.id === activeTab)?.label || "Dashboard"}
            </Typography>
            
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {/* Notification Bell */}
              <Box
                sx={{
                  backgroundColor: "rgba(255, 77, 0, 0.9)",
                  borderRadius: "50%",
                  padding: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <NotificationBellMUI />
              </Box>
              
              {/* Logout Button */}
              <Button
                component={Link}
                to="/login"
                variant="outlined"
                startIcon={<ExitToApp />}
                sx={{
                  color: "#FF4D00",
                  borderColor: "#FF4D00",
                  "&:hover": {
                    borderColor: "#E63900",
                    backgroundColor: "rgba(255, 77, 0, 0.05)",
                  },
                }}
              >
                Logout
              </Button>
            </Box>
          </Box>

          {/* Content Area */}
          <Box sx={{ flexGrow: 1, p: 3, position: "relative" }}>
            {/* AI Chatbot Button - Bottom Right Corner */}
            <Box
              sx={{
                position: "fixed",
                bottom: 24,
                right: 24,
                zIndex: 1000,
              }}
            >
              <IconButton
                size="large"
                sx={{
                  backgroundColor: "#FF4D00",
                  color: "white",
                  width: 60,
                  height: 60,
                  boxShadow: "0 4px 12px rgba(255, 77, 0, 0.4)",
                  "&:hover": {
                    backgroundColor: "#E63900",
                    transform: "scale(1.05)",
                    boxShadow: "0 6px 16px rgba(255, 77, 0, 0.6)",
                  },
                  transition: "all 0.3s ease",
                }}
                aria-label="Open AI Chatbot"
              >
                <ChatIcon sx={{ fontSize: 28 }} />
              </IconButton>
            </Box>

            {/* Mobile Header */}
            <AppBar
              position="static"
              sx={{
                display: { xs: "block", md: "none" },
                mb: 3,
                background: "linear-gradient(135deg, #FF4D00 0%, #FF7433 100%)",
              }}
            >
              <Toolbar>
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={toggleSidebar}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  {menuItems.find(item => item.id === activeTab)?.label || "Dashboard"}
                </Typography>
              </Toolbar>
            </AppBar>

            {/* Loading State */}
            {profileCheckLoading && (
              <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {/* Error State */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 3 }}
                action={
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button 
                      color="inherit" 
                      size="small"
                      onClick={retryConnection}
                      disabled={loading || profileCheckLoading}
                    >
                      Retry
                    </Button>
                    {error.includes("No response from server") && (
                      <Button 
                        color="inherit" 
                        size="small"
                        onClick={openCreateForm}
                        disabled={loading || profileCheckLoading}
                      >
                        Create Profile
                      </Button>
                    )}
                  </Box>
                }
              >
                <Typography variant="subtitle2" gutterBottom>
                  Connection Error
                </Typography>
                <Typography variant="body2">
                  {error}
                </Typography>
                {error.includes("No response from server") && (
                  <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic" }}>
                    Unable to verify if you have an existing profile. You can try to create a new profile or check your connection and retry.
                  </Typography>
                )}
              </Alert>
            )}

            {/* No Profile State - Only show if we successfully checked and confirmed no profile exists */}
            {!profileCheckLoading && !hasProfile && !error && (
              <>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                    Profile Setup Required
                  </Typography>
                  <Typography variant="body2">
                    Some sections are currently locked. Complete your profile to unlock all features including Service appointments and Projects.
                  </Typography>
                </Alert>
                <Card elevation={3} sx={{ mb: 3 }}>
                  <CardContent sx={{ p: 4, textAlign: "center" }}>
                    <Warning sx={{ fontSize: 60, color: "warning.main", mb: 2 }} />
                    <Typography variant="h5" gutterBottom>
                      Complete Your Profile
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      To get started with ServEase, please create your customer profile.
                      This will help us provide you with personalized service.
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<Add />}
                      onClick={openCreateForm}
                      sx={{
                        background: "linear-gradient(135deg, #FF4D00 0%, #FF7433 100%)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #E63900 0%, #FF5722 100%)",
                        },
                      }}
                    >
                      Create Profile
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Tab Content */}
            {!profileCheckLoading && hasProfile && customer && renderTabContent()}
          </Box>
        </Box>

        {/* Mobile Sidebar Drawer */}
        <Drawer
          anchor="left"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sx={{
            display: { xs: "block", md: "none" },
            '& .MuiDrawer-paper': {
              width: 280,
              background: "linear-gradient(135deg, #FF4D00 0%, #FF7433 100%)",
              color: "white",
            },
          }}
        >
          {/* Same content as permanent sidebar */}
          <Box sx={{ p: 3, borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: "white",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h6" sx={{ color: "#FF4D00", fontWeight: "bold" }}>
                  S
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" component="h1" fontWeight="bold">
                  ServEase
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, fontSize: "0.75rem" }}>
                  Customer Dashboard
                </Typography>
              </Box>
            </Box>
          </Box>

          <List sx={{ pt: 2 }}>
            {menuItems.map((item) => {
              const isDisabled = item.requiresProfile && !hasProfile;
              return (
                <ListItem key={item.id} disablePadding>
                  <Tooltip 
                    title={isDisabled ? "Complete your profile to access this section" : ""} 
                    placement="right"
                    arrow
                  >
                    <Box sx={{ width: "100%" }}>
                      <ListItemButton
                        onClick={() => handleTabChange(item.id)}
                        disabled={isDisabled}
                        sx={{
                          mx: 2,
                          mb: 1,
                          borderRadius: 1,
                          backgroundColor: activeTab === item.id ? "rgba(255,255,255,0.2)" : "transparent",
                          opacity: isDisabled ? 0.5 : 1,
                          cursor: isDisabled ? "not-allowed" : "pointer",
                          "&:hover": {
                            backgroundColor: isDisabled ? "transparent" : "rgba(255,255,255,0.1)",
                          },
                          "&.Mui-disabled": {
                            opacity: 0.5,
                          },
                        }}
                      >
                        <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.label}
                          primaryTypographyProps={{
                            fontWeight: activeTab === item.id ? "bold" : "normal",
                          }}
                        />
                        {isDisabled && (
                          <Warning sx={{ fontSize: 18, ml: 1, opacity: 0.7 }} />
                        )}
                      </ListItemButton>
                    </Box>
                  </Tooltip>
                </ListItem>
              );
            })}
          </List>
        </Drawer>

        {/* Profile Form Dialog */}
        <Dialog
          open={showProfileForm}
          onClose={closeForm}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {isEditMode ? "Update Customer Profile" : "Create Customer Profile"}
          </DialogTitle>
          <DialogContent>
            <CustomerProfileForm
              customer={isEditMode ? customer : null}
              onSubmit={isEditMode ? handleUpdateProfile : handleCreateProfile}
              loading={loading}
              error={error}
              isEdit={isEditMode}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeForm}>Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* Customer Profile Data Dialog */}
        <Dialog
          open={showProfileData}
          onClose={() => setShowProfileData(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Person color="primary" />
              <Typography variant="h6">Complete Customer Profile Data</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            {customer ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Personal Information
                </Typography>
                <Paper sx={{ p: 2, mb: 3, backgroundColor: "grey.50" }}>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">User ID</Typography>
                      <Typography variant="body2">{customer.user_id || customer.id || "N/A"}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Primary account identifier
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">Email</Typography>
                      <Typography variant="body2">{customer.email || "N/A"}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">First Name</Typography>
                      <Typography variant="body2">{customer.first_name || "N/A"}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">Last Name</Typography>
                      <Typography variant="body2">{customer.last_name || "N/A"}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">Full Name</Typography>
                      <Typography variant="body2">{customer.full_name || "N/A"}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">Phone Number</Typography>
                      <Typography variant="body2">{customer.phone_number || "N/A"}</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            ) : (
              <Alert severity="info">
                No customer profile data available. Please create a profile first.
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowProfileData(false)} variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </NotificationProvider>
  );
};

export default CustomerDashboard;
