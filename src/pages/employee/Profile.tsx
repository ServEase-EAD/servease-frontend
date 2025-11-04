import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Snackbar,
  Alert,
  MenuItem,
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import api, { API_ENDPOINTS } from '../../config/api.config';

interface EmployeeProfile {
  // Basic Information
  fullName: string;
  email: string;
  phoneNumber: string;
  gender?: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;


  // Employment Information
  employeeId: string;
  role: string;
  department?: string;
  joiningDate: string;
  employmentType?: 'Full-Time' | 'Part-Time' | 'Contract';
  supervisor?: string;

  // System Information
  accountCreated: string;
  lastLogin?: string;
  status: 'Active' | 'Suspended';
  accessRole: string;

  // Address Information
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
}

interface WorkloadSummary {
  activeTasks: number;
  pendingServices: number;
  completedServices: number;
  totalHoursLogged: string;
}

interface ApiError {
  message: string;
}

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [profile, setProfile] = useState<EmployeeProfile>({
    // Basic Information
    fullName: '',
    email: '',
    phoneNumber: '',
    gender: undefined,
    dateOfBirth: undefined,

    // Employment Information
    employeeId: '',
    role: '',
    department: undefined,
    joiningDate: '',
    employmentType: undefined,
    supervisor: undefined,

    // System Information
    accountCreated: new Date().toISOString(),
    lastLogin: undefined,
    status: 'Active',
    accessRole: 'Employee',

    // Address Information
    addressLine1: undefined,
    addressLine2: undefined,
    city: undefined,
    postalCode: undefined
  });

  useEffect(() => {
    // Fetch fresh data on component mount
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      setError(null); // Clear any previous errors
      
      // Fetch from employee service instead of auth service
      const response = await api.get(API_ENDPOINTS.EMPLOYEES.PROFILE);
      const profileData = response.data;
      
      console.log('Fetched profile data:', profileData);
      
      if (profileData) {
        const updatedProfile: EmployeeProfile = {
          // Basic Information
          fullName: profileData.full_name || '',
          email: profileData.email || '',
          phoneNumber: profileData.phone_number || '',
          gender: profileData.gender as 'Male' | 'Female' | 'Other' | undefined,
          dateOfBirth: profileData.date_of_birth || '',

          // Employment Information
          employeeId: profileData.employee_id || '',
          role: profileData.role || '',
          department: profileData.department || '',
          joiningDate: profileData.joining_date || '',
          employmentType: profileData.employment_type as 'Full-Time' | 'Part-Time' | 'Contract' | undefined,
          supervisor: profileData.supervisor || '',

          // System Information
          accountCreated: profileData.account_created || new Date().toISOString(),
          lastLogin: profileData.last_login || '',
          status: profileData.is_active ? 'Active' : 'Suspended',
          accessRole: profileData.user_role || profileData.access_role || 'Employee',

          // Address Information
          addressLine1: profileData.address_line1 || '',
          addressLine2: profileData.address_line2 || '',
          city: profileData.city || '',
          postalCode: profileData.postal_code || ''
        };
        
        console.log('Updated profile:', updatedProfile);
        
        // Update local state
        setProfile(updatedProfile);
        
        // Cache the profile data
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      console.error('Error response:', err.response);
      
      // Only show cached data message if we actually have cached data
      const cachedProfile = localStorage.getItem('userProfile');
      if (cachedProfile) {
        try {
          const parsedProfile = JSON.parse(cachedProfile);
          setProfile(parsedProfile);
          console.log('Loaded profile from cache due to error:', parsedProfile);
          // Only show this specific message if there was a network error
          if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') {
            setError('Unable to fetch latest data. Showing cached profile.');
          } else {
            const errorMessage = err.response?.data?.detail || err.response?.data?.message || 'Failed to fetch profile data';
            setError(errorMessage);
          }
        } catch (parseErr) {
          console.error('Error parsing cached profile:', parseErr);
          setError('Failed to load profile data. Please try logging in again.');
        }
      } else {
        const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to fetch profile data';
        setError(errorMessage);
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
        address_line1: profile.addressLine1 || '',
        address_line2: profile.addressLine2 || '',
        city: profile.city || '',
        postal_code: profile.postalCode || ''
      };
      
      // Use employee service endpoint instead of auth service
      await api.put(API_ENDPOINTS.EMPLOYEES.UPDATE_PROFILE, updateData);
      
      // Fetch the complete updated profile from the server
      await fetchProfileData();
      
      setSuccessMessage('Profile updated successfully');
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      // Use employee service endpoint
      await api.post(API_ENDPOINTS.EMPLOYEES.CHANGE_PASSWORD, {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      setIsPasswordDialogOpen(false);
      setSuccessMessage('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update password');
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
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Error Snackbar */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={6000} 
        onClose={() => setSuccessMessage(null)}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>

        {/* Basic Information Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Basic Information</Typography>
              {!isEditing && (
                <Button
                  startIcon={<Edit />}
                  onClick={handleEditProfile}
                  sx={{ color: '#FF4D00' }}
                >
                  Edit Profile
                </Button>
              )}
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                gap: 2
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
                onChange={(e) => setProfile({...profile, phoneNumber: e.target.value})}
                disabled={!isEditing}
              />
              <TextField
                select
                fullWidth
                label="Gender"
                value={profile.gender || ''}
                onChange={(e) => setProfile({...profile, gender: e.target.value as 'Male' | 'Female' | 'Other'})}
                disabled={!isEditing}
              >
                {['Male', 'Female', 'Other'].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                type="date"
                label="Date of Birth"
                value={profile.dateOfBirth || ''}
                onChange={(e) => setProfile({...profile, dateOfBirth: e.target.value})}
                disabled={!isEditing}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Address Line 1"
                value={profile.addressLine1 || ''}
                onChange={(e) => setProfile({...profile, addressLine1: e.target.value})}
                disabled={!isEditing}
              />
              <TextField
                fullWidth
                label="Address Line 2"
                value={profile.addressLine2 || ''}
                onChange={(e) => setProfile({...profile, addressLine2: e.target.value})}
                disabled={!isEditing}
              />
              <TextField
                fullWidth
                label="City / Town"
                value={profile.city || ''}
                onChange={(e) => setProfile({...profile, city: e.target.value})}
                disabled={!isEditing}
              />
              <TextField
                fullWidth
                label="Postal Code"
                value={profile.postalCode || ''}
                onChange={(e) => setProfile({...profile, postalCode: e.target.value})}
                disabled={!isEditing}
              />
            </Box>

            {isEditing && (
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSaveProfile}
                  sx={{ bgcolor: '#FF4D00', '&:hover': { bgcolor: '#cc3d00' } }}
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

      {/* Employment Information Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Employment Information
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2
            }}
          >
            <TextField
              fullWidth
              label="Employee ID"
              value={profile.employeeId}
              disabled
            />
            <TextField
              fullWidth
              label="Role / Designation"
              value={profile.role}
              disabled
            />
            <TextField
              fullWidth
              label="Department"
              value={profile.department || ''}
              disabled
            />
            <TextField
              fullWidth
              label="Joining Date"
              value={profile.joiningDate}
              disabled
            />
            <TextField
              select
              fullWidth
              label="Employment Type"
              value={profile.employmentType || ''}
              disabled
            >
              {['Full-Time', 'Part-Time', 'Contract'].map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Supervisor / Manager"
              value={profile.supervisor || ''}
              disabled
            />
          </Box>
        </CardContent>
      </Card>

      {/* System Information Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            System Information
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2
            }}
          >
            <TextField
              fullWidth
              label="Account Created"
              value={new Date(profile.accountCreated).toLocaleDateString()}
              disabled
            />
            <TextField
              fullWidth
              label="Last Login"
              value={profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'N/A'}
              disabled
            />
            <TextField
              fullWidth
              label="Status"
              value={profile.status}
              disabled
            />
            <TextField
              fullWidth
              label="Access Role"
              value={profile.accessRole}
              disabled
            />
          </Box>
        </CardContent>
      </Card>


      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onClose={() => setIsPasswordDialogOpen(false)}>
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
            error={newPassword !== confirmPassword && confirmPassword !== ''}
            helperText={
              newPassword !== confirmPassword && confirmPassword !== ''
                ? 'Passwords do not match'
                : ''
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setIsPasswordDialogOpen(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
          }}>
            Cancel
          </Button>
          <Button
            onClick={handlePasswordChange}
            variant="contained"
            disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;