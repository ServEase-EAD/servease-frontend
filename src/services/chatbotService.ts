/**
 * Chatbot Service
 * Handles chatbot-related API operations
 */
import apiClient, { handleApiError } from "./apiService";
import { API_ENDPOINTS } from "../config/api.config";
import type {
  ChatSession,
  ChatRequest,
  ChatResponse,
  ChatSessionsResponse,
  ChatModel,
} from "../types";

/**
 * Send a message to the chatbot
 */
export const sendMessage = async (
  message: string,
  sessionId?: string,
  model: ChatModel = "gemini-2.5-flash"
): Promise<ChatResponse> => {
  try {
    const payload: ChatRequest = {
      message,
      model,
    };

    if (sessionId) {
      payload.session_id = sessionId;
    }

    const response = await apiClient.post<ChatResponse>(
      API_ENDPOINTS.CHATBOT.CHAT,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Get all chat sessions for the authenticated user
 */
export const getChatSessions = async (): Promise<ChatSession[]> => {
  try {
    const response = await apiClient.get<ChatSessionsResponse>(
      API_ENDPOINTS.CHATBOT.SESSIONS
    );
    return response.data.results;
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Get a specific chat session by ID
 */
export const getChatSession = async (
  sessionId: string
): Promise<ChatSession> => {
  try {
    const response = await apiClient.get<ChatSession>(
      API_ENDPOINTS.CHATBOT.SESSION_DETAIL(sessionId)
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching chat session:", error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Delete a chat session
 */
export const deleteChatSession = async (
  sessionId: string
): Promise<{ message: string; session_id: string }> => {
  try {
    const response = await apiClient.delete<{
      message: string;
      session_id: string;
    }>(API_ENDPOINTS.CHATBOT.DELETE_SESSION(sessionId));
    return response.data;
  } catch (error) {
    console.error("Error deleting chat session:", error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Clear all messages in a chat session
 */
export const clearChatSession = async (
  sessionId: string
): Promise<{ message: string; session_id: string }> => {
  try {
    const response = await apiClient.post<{
      message: string;
      session_id: string;
    }>(API_ENDPOINTS.CHATBOT.CLEAR_SESSION(sessionId));
    return response.data;
  } catch (error) {
    console.error("Error clearing chat session:", error);
    throw new Error(handleApiError(error));
  }
};
