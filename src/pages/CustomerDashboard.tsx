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

  return (
    <NotificationProvider userId={userId}>
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
                    Welcome back, {user?.firstName || user?.email || "Customer"}!
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
          </Paper>

          {/* Loading State */}
          {profileCheckLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Debug Information (temporary) */}
          {import.meta.env.DEV && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Debug Info:</strong><br />
                User: {user ? `${user.email} (ID: ${user.id})` : "Not authenticated"}<br />
                Profile Check Loading: {profileCheckLoading ? "Yes" : "No"}<br />
                Has Profile: {hasProfile ? "Yes" : "No"}<br />
                Profile Loading: {loading ? "Yes" : "No"}<br />
                Error: {error || "None"}
              </Typography>
            </Alert>
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
          )}

          {/* Dashboard Content with Profile */}
          {!profileCheckLoading && hasProfile && customer && (
            <>
              {/* Customer Profile Card */}
              <Card elevation={3} sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "between", alignItems: "flex-start", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Person color="primary" sx={{ mr: 2, fontSize: 30 }} />
                      <Typography variant="h6" component="h2">
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
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <CheckCircle sx={{ mr: 1, fontSize: 18, color: customer.is_verified ? "success.main" : "warning.main" }} />
                        <Chip
                          label={customer.is_verified ? "Verified" : "Pending Verification"}
                          color={customer.is_verified ? "success" : "warning"}
                          size="small"
                        />
                      </Box>
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
                </CardContent>
              </Card>

              {/* Dashboard Content Grid */}
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
                        onClick={openEditForm}
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
                        {customer.total_services}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Total Services Completed
                      </Typography>
                      {customer.last_service_date && (
                        <Typography variant="body2" color="text.secondary">
                          Last Service: {new Date(customer.last_service_date).toLocaleDateString()}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        Preferred Contact: {customer.preferred_contact_method}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </>
          )}

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
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">Emergency Contact Name</Typography>
                        <Typography variant="body2">{customer.emergency_contact_name || "N/A"}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">Emergency Contact Phone</Typography>
                        <Typography variant="body2">{customer.emergency_contact_phone || "N/A"}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">Emergency Contact Relationship</Typography>
                        <Typography variant="body2">{customer.emergency_contact_relationship || "N/A"}</Typography>
                      </Box>
                    </Box>
                  </Paper>

                  <Typography variant="h6" gutterBottom color="primary">
                    Address Information
                  </Typography>
                  <Paper sx={{ p: 2, mb: 3, backgroundColor: "grey.50" }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">Street Address</Typography>
                        <Typography variant="body2">{customer.street_address || "N/A"}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">City</Typography>
                        <Typography variant="body2">{customer.city || "N/A"}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">State/Province</Typography>
                        <Typography variant="body2">{customer.state || "N/A"}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">Postal Code</Typography>
                        <Typography variant="body2">{customer.postal_code || "N/A"}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">Country</Typography>
                        <Typography variant="body2">{customer.country || "N/A"}</Typography>
                      </Box>
                      <Box sx={{ gridColumn: "1 / -1" }}>
                        <Typography variant="subtitle2" fontWeight="bold">Full Address</Typography>
                        <Typography variant="body2">{customer.full_address || "N/A"}</Typography>
                      </Box>
                    </Box>
                  </Paper>

                  <Typography variant="h6" gutterBottom color="primary">
                    Business Information
                  </Typography>
                  <Paper sx={{ p: 2, mb: 3, backgroundColor: "grey.50" }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">Is Business Customer</Typography>
                        <Chip 
                          label={customer.is_business_customer ? "Yes" : "No"} 
                          color={customer.is_business_customer ? "success" : "default"}
                          size="small"
                        />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">Company Name</Typography>
                        <Typography variant="body2">{customer.company_name || "N/A"}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">Business Type</Typography>
                        <Typography variant="body2">{customer.business_type || "N/A"}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">Tax ID</Typography>
                        <Typography variant="body2">{customer.tax_id || "N/A"}</Typography>
                      </Box>
                    </Box>
                  </Paper>

                  <Typography variant="h6" gutterBottom color="primary">
                    Account Status & Preferences
                  </Typography>
                  <Paper sx={{ p: 2, mb: 3, backgroundColor: "grey.50" }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">Verification Status</Typography>
                        <Chip 
                          label={customer.is_verified ? "Verified" : "Pending"} 
                          color={customer.is_verified ? "success" : "warning"}
                          size="small"
                        />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">Preferred Contact Method</Typography>
                        <Typography variant="body2">{customer.preferred_contact_method || "N/A"}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">Customer Since</Typography>
                        <Typography variant="body2">
                          {customer.customer_since ? new Date(customer.customer_since).toLocaleDateString() : "N/A"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">Last Updated</Typography>
                        <Typography variant="body2">
                          {customer.updated_at ? new Date(customer.updated_at).toLocaleString() : "N/A"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">Created At</Typography>
                        <Typography variant="body2">
                          {customer.created_at ? new Date(customer.created_at).toLocaleString() : "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>

                  <Typography variant="h6" gutterBottom color="primary">
                    Service Information
                  </Typography>
                  <Paper sx={{ p: 2, mb: 2, backgroundColor: "grey.50" }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">Total Services</Typography>
                        <Typography variant="body2">{customer.total_services || 0}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">Last Service Date</Typography>
                        <Typography variant="body2">
                          {customer.last_service_date ? new Date(customer.last_service_date).toLocaleDateString() : "N/A"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">Notification Preferences</Typography>
                        <Typography variant="body2">
                          {customer.notification_preferences ? JSON.stringify(customer.notification_preferences) : "Default"}
                        </Typography>
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
      </Container>
    </NotificationProvider>
  );
};

export default CustomerDashboard;
