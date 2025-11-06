/**
 * Customer Profile Form Component
 * Form for creating and updating customer profiles
 */
import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import { Person, Save } from "@mui/icons-material";
import type { Customer, CustomerCreateRequest, CustomerUpdateRequest } from "../../types";

interface CustomerProfileFormProps {
  customer?: Customer | null;
  onSubmit: (data: CustomerCreateRequest | CustomerUpdateRequest) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  isEdit?: boolean;
}

export const CustomerProfileForm: React.FC<CustomerProfileFormProps> = ({
  customer,
  onSubmit,
  loading = false,
  error = null,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState<CustomerCreateRequest>({
    street_address: customer?.street_address || "",
    city: customer?.city || "",
    state: customer?.state || "",
    postal_code: customer?.postal_code || "",
    country: customer?.country || "USA",
    company_name: customer?.company_name || "",
    business_type: customer?.business_type || "",
    tax_id: customer?.tax_id || "",
    emergency_contact_name: customer?.emergency_contact_name || "",
    emergency_contact_phone: customer?.emergency_contact_phone || "",
    emergency_contact_relationship: customer?.emergency_contact_relationship || "",
    preferred_contact_method: customer?.preferred_contact_method || "email",
    notification_preferences: customer?.notification_preferences || {},
  });

  const handleChange = (field: keyof CustomerCreateRequest) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Card elevation={3}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Person color="primary" sx={{ mr: 2, fontSize: 30 }} />
          <Typography variant="h5" component="h2">
            {isEdit ? "Update Profile" : "Create Customer Profile"}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Address Information */}
            <Typography variant="h6" color="primary">
              Address Information
            </Typography>

            <TextField
              label="Street Address"
              value={formData.street_address}
              onChange={handleChange("street_address")}
              fullWidth
              placeholder="e.g., 123 Main Street, Apt 4B"
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="City"
                value={formData.city}
                onChange={handleChange("city")}
                fullWidth
              />
              <TextField
                label="State"
                value={formData.state}
                onChange={handleChange("state")}
                sx={{ minWidth: 100 }}
              />
              <TextField
                label="Postal Code"
                value={formData.postal_code}
                onChange={handleChange("postal_code")}
                sx={{ minWidth: 120 }}
              />
            </Box>

            <TextField
              label="Country"
              value={formData.country}
              onChange={handleChange("country")}
              fullWidth
            />

            {/* Business Information */}
            <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
              Business Information (Optional)
            </Typography>

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Company Name"
                value={formData.company_name}
                onChange={handleChange("company_name")}
                fullWidth
                placeholder="Optional"
              />
              <TextField
                label="Business Type"
                value={formData.business_type}
                onChange={handleChange("business_type")}
                fullWidth
                placeholder="e.g., Auto Repair"
              />
            </Box>

            <TextField
              label="Tax ID / EIN"
              value={formData.tax_id}
              onChange={handleChange("tax_id")}
              fullWidth
              placeholder="Optional"
            />

            {/* Emergency Contact */}
            <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
              Emergency Contact (Optional)
            </Typography>

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Emergency Contact Name"
                value={formData.emergency_contact_name}
                onChange={handleChange("emergency_contact_name")}
                fullWidth
              />
              <TextField
                label="Emergency Contact Phone"
                value={formData.emergency_contact_phone}
                onChange={handleChange("emergency_contact_phone")}
                fullWidth
                placeholder="+1234567890"
              />
              <TextField
                label="Relationship"
                value={formData.emergency_contact_relationship}
                onChange={handleChange("emergency_contact_relationship")}
                fullWidth
                placeholder="e.g., Spouse"
              />
            </Box>

            {/* Preferences */}
            <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
              Preferences
            </Typography>

            <FormControl fullWidth sx={{ maxWidth: 300 }}>
              <InputLabel>Preferred Contact Method</InputLabel>
              <Select
                value={formData.preferred_contact_method}
                onChange={handleChange("preferred_contact_method")}
                label="Preferred Contact Method"
              >
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="phone">Phone</MenuItem>
                <MenuItem value="sms">SMS</MenuItem>
              </Select>
            </FormControl>

            {/* Submit Button */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                disabled={loading}
                sx={{
                  px: 4,
                  py: 1.5,
                  background: "linear-gradient(135deg, #FF4D00 0%, #FF7433 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #E63900 0%, #FF5722 100%)",
                  },
                }}
              >
                {loading 
                  ? (isEdit ? "Updating..." : "Creating...") 
                  : (isEdit ? "Update Profile" : "Create Profile")
                }
              </Button>
            </Box>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};