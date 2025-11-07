/**
 * Custom hook for managing chatbot functionality
 */
import { useState, useCallback, useEffect } from "react";
import type { ChatMessage, ChatSession, ChatModel } from "../types";
import * as chatbotService from "../services/chatbotService";

interface UseChatbotReturn {
  // State
  messages: ChatMessage[];
  sessions: ChatSession[];
  currentSessionId: string | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  selectedModel: ChatModel;

  // Actions
  sendMessage: (message: string) => Promise<void>;
  loadSessions: () => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  startNewSession: () => void;
  deleteSession: (sessionId: string) => Promise<void>;
  clearSession: (sessionId: string) => Promise<void>;
  setSelectedModel: (model: ChatModel) => void;
  clearError: () => void;
}

export const useChatbot = (): UseChatbotReturn => {
  // State management
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ChatModel>("gemini-2.5-flash");

  /**
   * Load all chat sessions
   */
  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sessionsData = await chatbotService.getChatSessions();
      setSessions(sessionsData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load sessions";
      setError(errorMessage);
      console.error("Error loading sessions:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load a specific session
   */
  const loadSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const sessionData = await chatbotService.getChatSession(sessionId);
      setMessages(sessionData.messages);
      setCurrentSessionId(sessionData.session_id);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load session";
      setError(errorMessage);
      console.error("Error loading session:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Send a message to the chatbot
   */
  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return;

      setIsSending(true);
      setError(null);

      // Add user message immediately to UI
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        const response = await chatbotService.sendMessage(
          message,
          currentSessionId || undefined,
          selectedModel
        );

        // Update session ID if this was a new session
        if (!currentSessionId) {
          setCurrentSessionId(response.session_id);
        }

        // Add assistant message
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          role: response.role,
          content: response.message,
          timestamp: response.timestamp,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to send message";
        setError(errorMessage);
        console.error("Error sending message:", err);
        // Remove the temporary user message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      } finally {
        setIsSending(false);
      }
    },
    [currentSessionId, selectedModel]
  );

  /**
   * Start a new chat session
   */
  const startNewSession = useCallback(() => {
    setMessages([]);
    setCurrentSessionId(null);
    setError(null);
  }, []);

  /**
   * Delete a session
   */
  const deleteSession = useCallback(
    async (sessionId: string) => {
      setError(null);
      try {
        await chatbotService.deleteChatSession(sessionId);
        // Remove from sessions list
        setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
        // If current session was deleted, start new
        if (currentSessionId === sessionId) {
          startNewSession();
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete session";
        setError(errorMessage);
        console.error("Error deleting session:", err);
        throw err;
      }
    },
    [currentSessionId, startNewSession]
  );

  /**
   * Clear all messages in a session
   */
  const clearSession = useCallback(
    async (sessionId: string) => {
      setError(null);
      try {
        await chatbotService.clearChatSession(sessionId);
        // If current session was cleared, clear messages
        if (currentSessionId === sessionId) {
          setMessages([]);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to clear session";
        setError(errorMessage);
        console.error("Error clearing session:", err);
        throw err;
      }
    },
    [currentSessionId]
  );

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    // State
    messages,
    sessions,
    currentSessionId,
    isLoading,
    isSending,
    error,
    selectedModel,

    // Actions
    sendMessage,
    loadSessions,
    loadSession,
    startNewSession,
    deleteSession,
    clearSession,
    setSelectedModel,
    clearError,
  };
};
