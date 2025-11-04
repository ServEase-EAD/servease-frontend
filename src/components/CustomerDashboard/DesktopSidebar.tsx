import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Tooltip,
} from "@mui/material";
import { Person } from "@mui/icons-material";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  requiresProfile: boolean;
}

interface SidebarProps {
  menuItems: MenuItem[];
  activeTab: string;
  hasProfile: boolean;
  user: any;
  onTabChange: (tabId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  menuItems,
  activeTab,
  hasProfile,
  user,
  onTabChange,
}) => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 280,
        flexShrink: 0,
        display: { xs: "none", md: "block" },
        "& .MuiDrawer-paper": {
          width: 280,
          boxSizing: "border-box",
          background: "linear-gradient(135deg, #FF4D00 0%, #FF7433 100%)",
          color: "white",
        },
      }}
    >
      {/* Logo Header */}
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
            <Typography
              variant="h6"
              sx={{ color: "#FF4D00", fontWeight: "bold" }}
            >
              S
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" component="h1" fontWeight="bold">
              ServEase
            </Typography>
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
                title={
                  isDisabled
                    ? "Complete your profile to access this section"
                    : ""
                }
                placement="right"
                arrow
              >
                <Box sx={{ width: "100%" }}>
                  <ListItemButton
                    onClick={() => onTabChange(item.id)}
                    disabled={isDisabled}
                    sx={{
                      mx: 2,
                      mb: 1,
                      borderRadius: 1,
                      backgroundColor:
                        activeTab === item.id
                          ? "rgba(255,255,255,0.2)"
                          : "transparent",
                      opacity: isDisabled ? 0.5 : 1,
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      "&:hover": {
                        backgroundColor: isDisabled
                          ? "transparent"
                          : "rgba(255,255,255,0.1)",
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
      <Box
        sx={{
          p: 2,
          mt: "auto",
          borderTop: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Person sx={{ mr: 2, fontSize: 20 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" fontWeight="bold">
              {user?.fullName ||
                `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                user?.email ||
                "Customer"}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;