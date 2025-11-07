import React, { useState, Suspense, useEffect } from "react";
import {
  Box,
  Container,
  Button,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
} from "@mui/material";
import {
  Person,
  ExitToApp,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Event as EventIcon,
  Build as BuildIcon,
  DirectionsCar as VehicleIcon,
  AccountCircle,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { NotificationProvider } from "../contexts/NotificationContext";
import { NotificationBellMUI } from "../components/notifications";
import { getUserFromToken } from "../services/authService";
import { useCustomer } from "../hooks/useCustomer";
import { CustomerProfileForm } from "../components/CustomerDashboard/CustomerProfileForm";
import DesktopSidebar from "../components/CustomerDashboard/DesktopSidebar";
import MobileSidebar from "../components/CustomerDashboard/MobileSidebar";
import DashboardSection from "../components/CustomerDashboard/DashboardSection";
import AppointmentsSection from "../components/CustomerDashboard/AppointmentsSection";
import ProjectsSection from "../components/CustomerDashboard/ProjectsSection";
import VehiclesSection from "../components/CustomerDashboard/VehiclesSection";
import ProfileSection from "../components/CustomerDashboard/ProfileSection";
import { ChatbotButton } from "../components/chatbot";
import LoadingSpinner from "../components/LoadingSpinner";

const CustomerDashboard: React.FC = () => {
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showProfileData, setShowProfileData] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    // Check if this is a new signup
    const isNewSignup = localStorage.getItem("isNewSignup");
    if (isNewSignup === "true") {
      // Clear the flag immediately
      localStorage.removeItem("isNewSignup");
      return "profile";
    }
    return "dashboard";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openAppointmentDialog, setOpenAppointmentDialog] = useState(false);
  const [openProjectDialog, setOpenProjectDialog] = useState(false);
  const [openVehicleDialog, setOpenVehicleDialog] = useState(false);

  const user = getUserFromToken();
  const userId = user?.id || null;
  const isAuthenticated = user !== null;

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

  // Automatically navigate to profile section if user has no profile and not already on profile tab
  useEffect(() => {
    if (!profileCheckLoading && !hasProfile && !error && activeTab !== "profile") {
      setActiveTab("profile");
    }
  }, [profileCheckLoading, hasProfile, error, activeTab]);

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
      console.error("Failed to create profile:", error);
    }
  };

  const handleUpdateProfile = async (data: any) => {
    try {
      await updateProfile(data);
      setShowProfileForm(false);
      setIsEditMode(false);
    } catch (error) {
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

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <DashboardIcon />,
      requiresProfile: true,
    },
    {
      id: "appointments",
      label: "Service",
      icon: <EventIcon />,
      requiresProfile: true,
    },
    {
      id: "projects",
      label: "Projects",
      icon: <BuildIcon />,
      requiresProfile: true,
    },
    {
      id: "vehicles",
      label: "Vehicles",
      icon: <VehicleIcon />,
      requiresProfile: true,
    },
    {
      id: "profile",
      label: "Profile",
      icon: <AccountCircle />,
      requiresProfile: false,
    },
  ];

  const handleTabChange = (tabId: string) => {
    const menuItem = menuItems.find((item) => item.id === tabId);
    if (menuItem?.requiresProfile && !hasProfile) {
      return;
    }
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  const handleOpenAppointmentDialog = () => {
    setOpenAppointmentDialog(true);
  };

  const handleOpenProjectDialog = () => {
    setOpenProjectDialog(true);
  };

  const handleOpenVehicleDialog = () => {
    setOpenVehicleDialog(true);
  };

  const renderTabContent = () => {
    return (
      <Suspense fallback={<LoadingSpinner message="Loading section..." />}>
        {activeTab === "dashboard" && (
          <DashboardSection
            customer={customer}
            onNavigate={setActiveTab}
            onShowProfileData={() => setShowProfileData(true)}
            onOpenAppointmentDialog={handleOpenAppointmentDialog}
            onOpenProjectDialog={handleOpenProjectDialog}
            onOpenVehicleDialog={handleOpenVehicleDialog}
          />
        )}
        {activeTab === "appointments" && (
          <AppointmentsSection
            openCreateDialog={openAppointmentDialog}
            onDialogClose={() => setOpenAppointmentDialog(false)}
          />
        )}
        {activeTab === "projects" && (
          <ProjectsSection
            openCreateDialog={openProjectDialog}
            onDialogClose={() => setOpenProjectDialog(false)}
          />
        )}
        {activeTab === "vehicles" && (
          <VehiclesSection
            openCreateDialog={openVehicleDialog}
            onDialogClose={() => setOpenVehicleDialog(false)}
          />
        )}
        {activeTab === "profile" && (
          <ProfileSection
            customer={customer}
            onEditProfile={openEditForm}
            onCreateProfile={openCreateForm}
          />
        )}
      </Suspense>
    );
  };

  return (
    <NotificationProvider userId={userId}>
      <Box sx={{ display: "flex" }}>
        <DesktopSidebar
          menuItems={menuItems}
          activeTab={activeTab}
          hasProfile={hasProfile}
          user={user}
          onTabChange={handleTabChange}
        />

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
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton
                sx={{ display: { xs: "block", md: "none" } }}
                onClick={() => setSidebarOpen(true)}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                variant="h5"
                component="h1"
                fontWeight="bold"
                color="text.primary"
              >
                {menuItems.find((item) => item.id === activeTab)?.label ||
                  "Dashboard"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
            {/* AI Chatbot Button */}
            <ChatbotButton />

            {profileCheckLoading && (
              <LoadingSpinner message="Checking profile..." />
            )}

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
                <Typography variant="body2">{error}</Typography>
              </Alert>
            )}

            {!profileCheckLoading && !hasProfile && !error && activeTab !== "profile" && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  fontWeight="bold"
                >
                  Profile Setup Required
                </Typography>
                <Typography variant="body2">
                  Some sections are currently locked. Complete your profile to
                  unlock all features including Service appointments and
                  Projects.
                </Typography>
              </Alert>
            )}

            {!profileCheckLoading &&
              (hasProfile ||
                activeTab === "profile" ||
                activeTab === "dashboard") &&
              renderTabContent()}
          </Box>
        </Box>

        <MobileSidebar
          open={sidebarOpen}
          menuItems={menuItems}
          activeTab={activeTab}
          hasProfile={hasProfile}
          onClose={() => setSidebarOpen(false)}
          onTabChange={handleTabChange}
        />

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

        <Dialog
          open={showProfileData}
          onClose={() => setShowProfileData(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Person color="primary" />
              <Typography variant="h6">
                Complete Customer Profile Data
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            {customer ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Personal Information
                </Typography>
                <Paper sx={{ p: 2, mb: 3, backgroundColor: "grey.50" }}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(250px, 1fr))",
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        User ID
                      </Typography>
                      <Typography variant="body2">
                        {customer.user_id || customer.id || "N/A"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Email
                      </Typography>
                      <Typography variant="body2">
                        {customer.email || "N/A"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Full Name
                      </Typography>
                      <Typography variant="body2">
                        {customer.full_name || "N/A"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Phone Number
                      </Typography>
                      <Typography variant="body2">
                        {customer.phone_number || "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            ) : (
              <Alert severity="info">
                No customer profile data available. Please create a profile
                first.
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setShowProfileData(false)}
              variant="contained"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </NotificationProvider>
  );
};

export default CustomerDashboard;
