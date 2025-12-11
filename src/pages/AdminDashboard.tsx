import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Edit,
  Delete,
  ExitToApp,
  People,
  PersonAdd,
  Block,
  CheckCircle,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  getAllUsers,
  getUserStatistics,
  createUser,
  updateUser,
  changeUserRole,
  deleteUser,
  toggleUserStatus,
  type User,
  type UserStats,
  type CreateUserData,
} from "../services/adminService";
import { logout } from "../services/authService";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateUserData>({
    email: "",
    first_name: "",
    last_name: "",
    password1: "",
    password2: "",
    user_role: "customer",
    phone_number: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, statsData] = await Promise.all([
        getAllUsers(),
        getUserStatistics(),
      ]);
      setUsers(usersData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCreateUser = async () => {
    try {
      setLoading(true);
      await createUser(formData);
      setSuccess("User created successfully!");
      setOpenCreateDialog(false);
      resetForm();
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      setLoading(true);
      await updateUser(selectedUser.id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
      });
      setSuccess("User updated successfully!");
      setOpenEditDialog(false);
      setSelectedUser(null);
      resetForm();
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser) return;
    try {
      setLoading(true);
      await changeUserRole(selectedUser.id, { user_role: formData.user_role });
      setSuccess(`User role changed to ${formData.user_role} successfully!`);
      setOpenRoleDialog(false);
      setSelectedUser(null);
      resetForm();
      loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to change user role"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      setLoading(true);
      await deleteUser(userId);
      setSuccess("User deleted successfully!");
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      setLoading(true);
      const result = await toggleUserStatus(userId);
      setSuccess(result.message);
      loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to toggle user status"
      );
    } finally {
      setLoading(false);
    }
  };

  const openEditUserDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      ...formData,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number || "",
      email: user.email,
    });
    setOpenEditDialog(true);
  };

  const openChangeRoleDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({ ...formData, user_role: user.user_role });
    setOpenRoleDialog(true);
  };

  const resetForm = () => {
    setFormData({
      email: "",
      first_name: "",
      last_name: "",
      password1: "",
      password2: "",
      user_role: "customer",
      phone_number: "",
    });
  };

  const getRoleColor = (
    role: string
  ):
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning" => {
    switch (role) {
      case "admin":
        return "error";
      case "employee":
        return "primary";
      case "customer":
        return "success";
      default:
        return "default";
    }
  };

  const filterUsersByRole = (role?: string) => {
    if (!role) return users;
    return users.filter((user) => user.user_role === role);
  };

  const renderStatistics = () => {
    if (!stats) return null;

    const statCards = [
      { label: "Total Users", value: stats.total_users, color: "#1976d2" },
      { label: "Customers", value: stats.total_customers, color: "#2e7d32" },
      { label: "Employees", value: stats.total_employees, color: "#ed6c02" },
      { label: "Admins", value: stats.total_admins, color: "#d32f2f" },
      { label: "Active Users", value: stats.active_users, color: "#388e3c" },
      {
        label: "Inactive Users",
        value: stats.inactive_users,
        color: "#757575",
      },
    ];

    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statCards.map((stat) => (
          <Grid key={stat.label} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
            <Card sx={{ bgcolor: stat.color, color: "white" }}>
              <CardContent>
                <Typography variant="h4" align="center">
                  {stat.value}
                </Typography>
                <Typography variant="body2" align="center">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderUserTable = (filteredUsers: User[]) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
                <TableCell>
                  <Chip
                    label={user.user_role}
                    color={getRoleColor(user.user_role)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{user.phone_number || "-"}</TableCell>
                <TableCell>
                  <Chip
                    icon={user.is_active ? <CheckCircle /> : <Block />}
                    label={user.is_active ? "Active" : "Inactive"}
                    color={user.is_active ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => openEditUserDialog(user)}
                    title="Edit User"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="secondary"
                    onClick={() => openChangeRoleDialog(user)}
                    title="Change Role"
                  >
                    <People />
                  </IconButton>
                  <IconButton
                    size="small"
                    color={user.is_active ? "warning" : "success"}
                    onClick={() => handleToggleStatus(user.id)}
                    title={user.is_active ? "Deactivate" : "Activate"}
                  >
                    {user.is_active ? <Block /> : <CheckCircle />}
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteUser(user.id)}
                    title="Delete User"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Alerts */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            severity="success"
            onClose={() => setSuccess(null)}
            sx={{ mb: 2 }}
          >
            {success}
          </Alert>
        )}

        {/* Statistics */}
        {renderStatistics()}

        {/* User Management Section */}
        <Card>
          <CardContent>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography variant="h5">User Management</Typography>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => setOpenCreateDialog(true)}
              >
                Add New User
              </Button>
            </Box>

            {/* Tabs for filtering */}
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{ mb: 2 }}
            >
              <Tab label="All Users" />
              <Tab label="Customers" />
              <Tab label="Employees" />
              <Tab label="Admins" />
            </Tabs>

            {/* User Table */}
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {activeTab === 0 && renderUserTable(users)}
                {activeTab === 1 &&
                  renderUserTable(filterUsersByRole("customer"))}
                {activeTab === 2 &&
                  renderUserTable(filterUsersByRole("employee"))}
                {activeTab === 3 && renderUserTable(filterUsersByRole("admin"))}
              </>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Create User Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <TextField
              label="First Name"
              fullWidth
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
            />
            <TextField
              label="Last Name"
              fullWidth
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
            />
            <TextField
              label="Phone Number"
              fullWidth
              value={formData.phone_number}
              onChange={(e) =>
                setFormData({ ...formData, phone_number: e.target.value })
              }
            />
            <TextField
              select
              label="Role"
              fullWidth
              value={formData.user_role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  user_role: e.target.value as
                    | "customer"
                    | "employee"
                    | "admin",
                })
              }
            >
              <MenuItem value="customer">Customer</MenuItem>
              <MenuItem value="employee">Employee</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={formData.password1}
              onChange={(e) =>
                setFormData({ ...formData, password1: e.target.value })
              }
            />
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              value={formData.password2}
              onChange={(e) =>
                setFormData({ ...formData, password2: e.target.value })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateUser}
            variant="contained"
            disabled={loading}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="First Name"
              fullWidth
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
            />
            <TextField
              label="Last Name"
              fullWidth
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
            />
            <TextField
              label="Phone Number"
              fullWidth
              value={formData.phone_number}
              onChange={(e) =>
                setFormData({ ...formData, phone_number: e.target.value })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateUser}
            variant="contained"
            disabled={loading}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog
        open={openRoleDialog}
        onClose={() => setOpenRoleDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Change User Role</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              select
              label="New Role"
              fullWidth
              value={formData.user_role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  user_role: e.target.value as
                    | "customer"
                    | "employee"
                    | "admin",
                })
              }
            >
              <MenuItem value="customer">Customer</MenuItem>
              <MenuItem value="employee">Employee</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRoleDialog(false)}>Cancel</Button>
          <Button
            onClick={handleChangeRole}
            variant="contained"
            disabled={loading}
          >
            Change Role
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
