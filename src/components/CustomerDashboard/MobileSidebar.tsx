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
  Tooltip,
} from "@mui/material";
import { Warning } from "@mui/icons-material";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  requiresProfile: boolean;
}

interface MobileSidebarProps {
  open: boolean;
  menuItems: MenuItem[];
  activeTab: string;
  hasProfile: boolean;
  onClose: () => void;
  onTabChange: (tabId: string) => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  open,
  menuItems,
  activeTab,
  hasProfile,
  onClose,
  onTabChange,
}) => {
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        display: { xs: "block", md: "none" },
        "& .MuiDrawer-paper": {
          width: 280,
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
            <Typography
              variant="body2"
              sx={{ opacity: 0.8, fontSize: "0.75rem" }}
            >
              Customer Dashboard
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
                    {isDisabled && (
                      <Warning sx={{ fontSize: 18, ml: 1, opacity: 0.7 }} />
                    )}
                  </ListItemButton>
                </Box>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};

export default MobileSidebar;