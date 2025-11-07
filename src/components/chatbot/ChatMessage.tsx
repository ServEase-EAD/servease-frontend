/**
 * ChatMessage Component
 * Displays individual chat messages with proper styling for user and assistant
 */
import React from "react";
import { Box, Paper, Typography, Avatar } from "@mui/material";
import { Person, SmartToy } from "@mui/icons-material";
import type { ChatMessage as ChatMessageType } from "../../types";

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        mb: 2,
        px: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: isUser ? "row-reverse" : "row",
          alignItems: "flex-start",
          maxWidth: "80%",
          gap: 1,
        }}
      >
        {/* Avatar */}
        <Avatar
          sx={{
            bgcolor: isUser
              ? "linear-gradient(135deg, #FF4D00 0%, #FF7433 100%)"
              : "linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)",
            width: 32,
            height: 32,
          }}
        >
          {isUser ? <Person fontSize="small" /> : <SmartToy fontSize="small" />}
        </Avatar>

        {/* Message Bubble */}
        <Paper
          elevation={1}
          sx={{
            px: 2,
            py: 1.5,
            borderRadius: 2,
            background: isUser
              ? "linear-gradient(135deg, #FF4D00 0%, #FF7433 100%)"
              : "#f5f5f5",
            color: isUser ? "#fff" : "#333",
            wordWrap: "break-word",
            "& p": {
              margin: 0,
              lineHeight: 1.6,
            },
          }}
        >
          <Typography
            variant="body1"
            sx={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {message.content}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.5,
              opacity: 0.7,
              fontSize: "0.7rem",
            }}
          >
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};
