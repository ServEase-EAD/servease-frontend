/**
 * ChatWindow Component
 * Main chatbot interface with message display, input, and session management
 */
import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  Tooltip,
} from "@mui/material";
import {
  Send,
  Close,
  Delete,
  Refresh,
  History,
  Add,
} from "@mui/icons-material";
import { useChatbot } from "../../hooks/useChatbot";
import { ChatMessage } from "./ChatMessage";

interface ChatWindowProps {
  onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onClose }) => {
  const {
    messages,
    sessions,
    currentSessionId,
    isLoading,
    isSending,
    error,
    sendMessage,
    loadSessions,
    loadSession,
    startNewSession,
    deleteSession,
    clearSession,
    clearError,
  } = useChatbot();

  const [inputMessage, setInputMessage] = useState("");
  const [showSessions, setShowSessions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputMessage.trim() || isSending) return;

    await sendMessage(inputMessage);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewSession = () => {
    startNewSession();
    setShowSessions(false);
  };

  const handleLoadSession = (sessionId: string) => {
    loadSession(sessionId);
    setShowSessions(false);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (window.confirm("Are you sure you want to delete this session?")) {
      try {
        await deleteSession(sessionId);
        await loadSessions();
      } catch {
        // Error handled by hook
      }
    }
  };

  const handleClearSession = async () => {
    if (!currentSessionId) return;
    if (window.confirm("Are you sure you want to clear this conversation?")) {
      try {
        await clearSession(currentSessionId);
      } catch {
        // Error handled by hook
      }
    }
  };

  return (
    <Paper
      elevation={8}
      sx={{
        position: "fixed",
        bottom: 20,
        right: 20,
        width: { xs: "calc(100vw - 40px)", sm: 420 },
        height: { xs: "calc(100vh - 100px)", sm: 600 },
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        overflow: "hidden",
        zIndex: 1300,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #FF4D00 0%, #FF7433 100%)",
          color: "#fff",
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            ServEase Assistant
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="View Sessions">
            <IconButton
              size="small"
              sx={{ color: "#fff" }}
              onClick={() => setShowSessions(!showSessions)}
            >
              <History />
            </IconButton>
          </Tooltip>
          <Tooltip title="New Session">
            <IconButton
              size="small"
              sx={{ color: "#fff" }}
              onClick={handleNewSession}
            >
              <Add />
            </IconButton>
          </Tooltip>
          {currentSessionId && (
            <Tooltip title="Clear Session">
              <IconButton
                size="small"
                sx={{ color: "#fff" }}
                onClick={handleClearSession}
              >
                <Delete />
              </IconButton>
            </Tooltip>
          )}
          <IconButton size="small" sx={{ color: "#fff" }} onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </Box>

      {/* Sessions List */}
      {showSessions && (
        <Box
          sx={{
            maxHeight: 200,
            overflowY: "auto",
            borderBottom: "1px solid #e0e0e0",
            bgcolor: "#f9f9f9",
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="subtitle2" fontWeight={600}>
                Previous Sessions
              </Typography>
              <IconButton size="small" onClick={loadSessions}>
                <Refresh fontSize="small" />
              </IconButton>
            </Box>
            {isLoading ? (
              <CircularProgress size={24} />
            ) : sessions.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No previous sessions
              </Typography>
            ) : (
              sessions.map((session) => (
                <Paper
                  key={session.session_id}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    cursor: "pointer",
                    "&:hover": { bgcolor: "#f0f0f0" },
                    border:
                      currentSessionId === session.session_id
                        ? "2px solid #FF4D00"
                        : "1px solid #e0e0e0",
                  }}
                  onClick={() => handleLoadSession(session.session_id)}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(session.created_at).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2">
                        {session.messages.length} messages
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.session_id);
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Paper>
              ))
            )}
          </Box>
        </Box>
      )}

      {/* Error Display */}
      {error && (
        <Alert
          severity="error"
          onClose={clearError}
          sx={{ mx: 2, mt: 1, mb: 0 }}
        >
          {error}
        </Alert>
      )}

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          py: 2,
          bgcolor: "#fafafa",
          minHeight: 0,
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              px: 3,
              textAlign: "center",
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Welcome to ServEase Assistant
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ask me anything about your services, appointments, vehicles, or
              general inquiries. I'm here to help!
            </Typography>
          </Box>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isSending && (
              <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          bgcolor: "#fff",
          borderTop: "1px solid #e0e0e0",
        }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!inputMessage.trim() || isSending}
            sx={{
              background: "linear-gradient(135deg, #FF4D00 0%, #FF7433 100%)",
              color: "#fff",
              "&:hover": {
                background: "linear-gradient(135deg, #E63900 0%, #FF5722 100%)",
              },
              "&.Mui-disabled": {
                background: "#ccc",
                color: "#888",
              },
            }}
          >
            <Send />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};