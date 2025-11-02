import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Edit, CameraAlt } from '@mui/icons-material';

interface EmployeeProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  joiningDate: string;
  skills: string[];
  schedule: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
  };
  availability: 'available' | 'unavailable';
  profilePicture?: string;
}

interface WorkloadSummary {
  activeTasks: number;
  pendingServices: number;
  completedServices: number;
  totalHoursLogged: string;
}

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  
  const [profile, setProfile] = useState<EmployeeProfile>({
    name: 'John Smith',
    email: 'john.smith@servease.com',
    phone: '+94 77 123 4567',
    role: 'Senior Mechanic',
    joiningDate: '2023-01-15',
    skills: ['Engine Repair', 'Brake Systems', 'Electrical Systems', 'Diagnostics'],
    schedule: {
      monday: '9:00 AM - 5:00 PM',
      tuesday: '9:00 AM - 5:00 PM',
      wednesday: '9:00 AM - 5:00 PM',
      thursday: '9:00 AM - 5:00 PM',
      friday: '9:00 AM - 5:00 PM',
    },
    availability: 'available'
  });

  const [workload, setWorkload] = useState<WorkloadSummary>({
    activeTasks: 3,
    pendingServices: 5,
    completedServices: 12,
    totalHoursLogged: '156.5'
  });

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    // TODO: Save profile changes to backend
  };

  const handlePasswordChange = () => {
    setIsPasswordDialogOpen(false);
    // TODO: Implement password change functionality
  };

  const handleProfilePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Implement profile picture upload
      console.log('Uploading file:', file.name);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        My Profile
      </Typography>

      {/* Basic Info Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                sx={{ width: 120, height: 120 }}
                src={profile.profilePicture}
              />
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-picture-upload"
                type="file"
                onChange={handleProfilePictureUpload}
              />
              <label htmlFor="profile-picture-upload">
                <Button
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    minWidth: 'auto',
                    p: 0.5,
                  }}
                >
                  <CameraAlt />
                </Button>
              </label>
            </Box>

            <Box sx={{ flexGrow: 1 }}>
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
                  value={profile.name}
                  disabled={!isEditing}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  value={profile.email}
                  disabled
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={profile.phone}
                  disabled={!isEditing}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Role"
                  value={profile.role}
                  disabled
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Joining Date"
                  value={profile.joiningDate}
                  disabled
                  sx={{ mb: 2 }}
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
          </Box>
        </CardContent>
      </Card>

      {/* Skills & Schedule Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Skills & Schedule
          </Typography>

          <Typography variant="subtitle2" gutterBottom>
            Skills
          </Typography>
          <Box sx={{ mb: 3 }}>
            {profile.skills.map((skill) => (
              <Chip
                key={skill}
                label={skill}
                sx={{ mr: 1, mb: 1 }}
                color="primary"
              />
            ))}
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            Working Hours
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2
            }}
          >
            {Object.entries(profile.schedule).map(([day, hours]) => (
              <Box key={day} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                  {day}:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {hours}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Workload Overview Card */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Workload Overview
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)'
              },
              gap: 3
            }}
          >
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Active Tasks
              </Typography>
              <Typography variant="h4" color="primary">
                {workload.activeTasks}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Pending Services
              </Typography>
              <Typography variant="h4" color="error">
                {workload.pendingServices}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Completed Services
              </Typography>
              <Typography variant="h4" color="success.main">
                {workload.completedServices}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Total Hours Logged
              </Typography>
              <Typography variant="h4" sx={{ color: '#FF4D00' }}>
                {workload.totalHoursLogged}h
              </Typography>
            </Box>
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
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="normal"
          />
          <TextField
            label="Confirm New Password"
            type="password"
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPasswordDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePasswordChange} variant="contained">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;