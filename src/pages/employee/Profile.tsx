import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  MenuItem,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import api, { API_ENDPOINTS } from "../../config/api.config";
import LoadingSpinner from "../../components/LoadingSpinner";

interface EmployeeProfile {
  // Basic Information
  fullName: string;
  email: string;
  phoneNumber: string;
  gender?: "Male" | "Female" | "Other";
  dateOfBirth?: string;

  // Employment Information - removed (managed by admin)
  // System Information - removed (managed internally)

  // Address Information
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
}

const CACHE_KEY = "employee_profile_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profile, setProfile] = useState<EmployeeProfile>(() => {
    // Initialize from cache if available
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return data;
        }
      } catch (e) {
        console.error("Error parsing cached profile:", e);
      }
    }
    return {
      fullName: "",
      email: "",
      phoneNumber: "",
      gender: undefined,
      dateOfBirth: undefined,
      addressLine1: undefined,
      addressLine2: undefined,
      city: undefined,
      postalCode: undefined,
    };
  });

  useEffect(() => {
    // Only fetch if cache is expired or doesn't exist
    const cached = localStorage.getItem(CACHE_KEY);
    let shouldFetch = true;

    if (cached) {
      try {
        const { timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          shouldFetch = false;
        }
      } catch (e) {
        console.error("Error checking cache:", e);
      }
    }

    if (shouldFetch) {
      fetchProfileData();
    }
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(API_ENDPOINTS.EMPLOYEES.PROFILE);
      const profileData = response.data;

      if (profileData) {
        const updatedProfile: EmployeeProfile = {
          fullName: profileData.full_name || "",
          email: profileData.email || "",
          phoneNumber: profileData.phone_number || "",
          gender: profileData.gender as "Male" | "Female" | "Other" | undefined,
          dateOfBirth: profileData.date_of_birth || "",
          addressLine1: profileData.address_line1 || "",
          addressLine2: profileData.address_line2 || "",
          city: profileData.city || "",
          postalCode: profileData.postal_code || "",
        };

        setProfile(updatedProfile);

        // Cache with timestamp
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: updatedProfile,
            timestamp: Date.now(),
          })
        );
      }
    } catch (err) {
      console.error("Error fetching profile:", err);

      // Try to use cache on error
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data } = JSON.parse(cached);
          setProfile(data);
          setError("Using cached data. Unable to fetch latest profile.");
        } catch (parseErr) {
          console.error("Error parsing cached profile:", parseErr);
          setError("Failed to load profile data.");
        }
      } else {
        setError("Failed to fetch profile data.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      const updateData = {
        phone_number: profile.phoneNumber,
        gender: profile.gender,
        date_of_birth: profile.dateOfBirth,
        address_line1: profile.addressLine1 || "",
        address_line2: profile.addressLine2 || "",
        city: profile.city || "",
        postal_code: profile.postalCode || "",
      };

      await api.put(API_ENDPOINTS.EMPLOYEES.UPDATE_PROFILE, updateData);
      await fetchProfileData();

      setSuccessMessage("Profile updated successfully");
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      await api.post(API_ENDPOINTS.EMPLOYEES.CHANGE_PASSWORD, {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setIsPasswordDialogOpen(false);
      setSuccessMessage("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        My Profile
      </Typography>

      {/* Loading State */}
      {isLoading && (
        <LoadingSpinner message="Loading profile..." minHeight="200px" />
      )}

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSuccessMessage(null)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Basic Information Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography variant="h6">Basic Information</Typography>
              {!isEditing && (
                <Button
                  startIcon={<Edit />}
                  onClick={handleEditProfile}
                  sx={{ color: "#FF4D00" }}
                >
                  Edit Profile
                </Button>
              )}
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                label="Full Name"
                value={profile.fullName}
                disabled
                helperText="Full name cannot be changed"
              />
              <TextField
                fullWidth
                label="Email"
                value={profile.email}
                disabled
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={profile.phoneNumber}
                onChange={(e) =>
                  setProfile({ ...profile, phoneNumber: e.target.value })
                }
                disabled={!isEditing}
              />
              <TextField
                select
                fullWidth
                label="Gender"
                value={profile.gender || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    gender: e.target.value as "Male" | "Female" | "Other",
                  })
                }
                disabled={!isEditing}
              >
                {["Male", "Female", "Other"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                type="date"
                label="Date of Birth"
                value={profile.dateOfBirth || ""}
                onChange={(e) =>
                  setProfile({ ...profile, dateOfBirth: e.target.value })
                }
                disabled={!isEditing}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Address Line 1"
                value={profile.addressLine1 || ""}
                onChange={(e) =>
                  setProfile({ ...profile, addressLine1: e.target.value })
                }
                disabled={!isEditing}
              />
              <TextField
                fullWidth
                label="Address Line 2"
                value={profile.addressLine2 || ""}
                onChange={(e) =>
                  setProfile({ ...profile, addressLine2: e.target.value })
                }
                disabled={!isEditing}
              />
              <TextField
                fullWidth
                label="City / Town"
                value={profile.city || ""}
                onChange={(e) =>
                  setProfile({ ...profile, city: e.target.value })
                }
                disabled={!isEditing}
              />
              <TextField
                fullWidth
                label="Postal Code"
                value={profile.postalCode || ""}
                onChange={(e) =>
                  setProfile({ ...profile, postalCode: e.target.value })
                }
                disabled={!isEditing}
              />
            </Box>

            {isEditing && (
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSaveProfile}
                  sx={{ bgcolor: "#FF4D00", "&:hover": { bgcolor: "#cc3d00" } }}
                >
                  Save Changes
                </Button>
                <Button variant="outlined" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Employment Information Card - REMOVED */}
      {/* This section is now managed through the admin/HR system */}

      {/* System Information Card - REMOVED */}
      {/* This section is now managed internally by the system */}

      {/* Change Password Dialog */}
      <Dialog
        open={isPasswordDialogOpen}
        onClose={() => setIsPasswordDialogOpen(false)}
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            label="Current Password"
            type="password"
            fullWidth
            margin="normal"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            label="Confirm New Password"
            type="password"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={newPassword !== confirmPassword && confirmPassword !== ""}
            helperText={
              newPassword !== confirmPassword && confirmPassword !== ""
                ? "Passwords do not match"
                : ""
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsPasswordDialogOpen(false);
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePasswordChange}
            variant="contained"
            disabled={
              !currentPassword ||
              !newPassword ||
              !confirmPassword ||
              newPassword !== confirmPassword
            }
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
