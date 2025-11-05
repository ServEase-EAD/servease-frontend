import React from "react";
import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import {
  AccountCircle,
  Edit,
  Add,
  Email,
  Person,
  Phone,
  LocationOn,
  Business,
  CalendarToday,
} from "@mui/icons-material";

interface ProfileSectionProps {
  customer: any;
  onEditProfile: () => void;
  onCreateProfile: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  customer,
  onEditProfile,
  onCreateProfile,
}) => {
  // If no customer profile exists
  if (!customer) {
    return (
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
            onClick={onCreateProfile}
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
    );
  }

  // If customer profile exists
  return (
    <Card elevation={3} sx={{ mb: 3 }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header with Edit Button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 3,
          }}
        >
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
            onClick={onEditProfile}
          >
            Edit Profile
          </Button>
        </Box>

        {/* Profile Information Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 3,
          }}
        >
          {/* Personal Information */}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Personal Information
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Email sx={{ mr: 1, fontSize: 18, color: "text.secondary" }} />
              <Typography variant="body2">
                {customer.email || "Not provided"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Person sx={{ mr: 1, fontSize: 18, color: "text.secondary" }} />
              <Typography variant="body2">
                {customer.full_name ||
                  `${customer.first_name || ""} ${customer.last_name || ""}`
                    .trim() ||
                  "Not provided"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Phone sx={{ mr: 1, fontSize: 18, color: "text.secondary" }} />
              <Typography variant="body2">
                {customer.phone_number || "Not provided"}
              </Typography>
            </Box>
          </Box>

          {/* Address Information */}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Address
            </Typography>
            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}>
              <LocationOn
                sx={{ mr: 1, fontSize: 18, color: "text.secondary", mt: 0.5 }}
              />
              <Typography variant="body2">
                {customer.full_address || "No address provided"}
              </Typography>
            </Box>
          </Box>

          {/* Business Information (conditional) */}
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
              <CalendarToday
                sx={{ mr: 1, fontSize: 18, color: "text.secondary" }}
              />
              <Typography variant="body2">
                Customer since:{" "}
                {new Date(customer.customer_since).toLocaleDateString()}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Total Services: {customer.total_services}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProfileSection;