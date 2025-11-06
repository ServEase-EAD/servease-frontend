/**
 * Material-UI Notification Bell Component
 * Displays notification icon with badge and dropdown
 */

import { useState } from "react";
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  NotificationsActive,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon,
} from "@mui/icons-material";
import { useNotifications } from "../../hooks/useNotifications";
import type { Notification } from "../../types/notification";
import { formatDistanceToNow } from "date-fns";

export function NotificationBellMUI() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleDelete = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    deleteNotification(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "APPOINTMENT":
        return "primary";
      case "VEHICLE":
        return "success";
      case "PROJECT":
        return "warning";
      case "SYSTEM":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <>
      <Tooltip
        title={isConnected ? "Notifications" : "Notifications (Offline)"}
      >
        <IconButton
          onClick={handleClick}
          size="medium"
          aria-label={`${unreadCount} notifications`}
          color="inherit"
          sx={{
            opacity: isConnected ? 1 : 0.6,
            color: "white",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.1)",
            },
          }}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            {unreadCount > 0 ? (
              <NotificationsActive sx={{ color: "white", fontSize: 24 }} />
            ) : (
              <NotificationsIcon sx={{ color: "white", fontSize: 24 }} />
            )}
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            width: 400,
            maxHeight: 600,
            mt: 1.5,
            "& .MuiMenuItem-root": {
              px: 2,
              py: 1.5,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Notifications {unreadCount > 0 && `(${unreadCount})`}
          </Typography>
          {notifications.some((n) => !n.read_at) && (
            <Button
              size="small"
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAllAsRead}
              sx={{ textTransform: "none" }}
            >
              Mark all read
            </Button>
          )}
        </Box>

        <Divider />

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <NotificationsIcon
              sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
            />
            <Typography color="text.secondary">No notifications</Typography>
            <Typography variant="caption" color="text.disabled">
              You're all caught up!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: 400, overflow: "auto" }}>
            {notifications.slice(0, 10).map((notification: Notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => handleMarkAsRead(notification.id)}
                sx={{
                  alignItems: "flex-start",
                  bgcolor: notification.read_at
                    ? "transparent"
                    : "action.hover",
                  borderLeft: notification.read_at ? "none" : "4px solid",
                  borderLeftColor: "primary.main",
                  "&:hover": {
                    bgcolor: "action.selected",
                  },
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: notification.read_at ? "normal" : "bold",
                        flex: 1,
                        mr: 1,
                      }}
                    >
                      {notification.message}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleDelete(notification.id, e)}
                      sx={{ ml: 1 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Chip
                      label={notification.type}
                      size="small"
                      color={
                        getNotificationColor(notification.type) as
                          | "primary"
                          | "success"
                          | "secondary"
                          | "default"
                      }
                      sx={{ height: 20, fontSize: "0.7rem" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                      })}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Box>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1, textAlign: "center" }}>
              <Button
                fullWidth
                size="small"
                onClick={handleClose}
                sx={{ textTransform: "none" }}
              >
                Close
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
}
