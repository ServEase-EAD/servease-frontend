/**
 * ChatbotButton Component
 * Floating action button to toggle chatbot visibility
 */
import React, { useState } from "react";
import { Fab, Tooltip } from "@mui/material";
import { Chat, Close } from "@mui/icons-material";
import { ChatWindow } from "./ChatWindow";

export const ChatbotButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Action Button */}
      <Tooltip title={isOpen ? "Close Chat" : "Open Chat Assistant"} placement="left">
        <Fab
          color="primary"
          aria-label="chat"
          onClick={toggleChatbot}
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            background: isOpen
              ? "linear-gradient(135deg, #E63900 0%, #FF5722 100%)"
              : "linear-gradient(135deg, #FF4D00 0%, #FF7433 100%)",
            zIndex: 1299,
            "&:hover": {
              background: "linear-gradient(135deg, #E63900 0%, #FF5722 100%)",
            },
          }}
        >
          {isOpen ? <Close /> : <Chat />}
        </Fab>
      </Tooltip>

      {/* Chat Window */}
      {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}
    </>
  );
};
