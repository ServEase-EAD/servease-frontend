/**
 * Notification Service
 * Handles real-time WebSocket notifications and REST API calls
 * Following DRY principles with centralized notification management
 */

import type {
  NotificationResponse,
  WebSocketNotification,
} from "../types/notification";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8006";
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8006";

type NotificationCallback = (
  notification: WebSocketNotification["data"]
) => void;
type ConnectionStatusCallback = (isConnected: boolean) => void;

class NotificationService {
  private ws: WebSocket | null = null;
  private userId: string | number | null = null;  // Support both UUID and number
  private reconnectTimeout: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private listeners: NotificationCallback[] = [];
  private statusListeners: ConnectionStatusCallback[] = [];
  private isManualDisconnect = false;

  /**
   * Connect to WebSocket for real-time notifications
   */
  connect(userId: string | number): void {  // Accept both UUID string and number
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return;
    }

    this.userId = userId;
    this.isManualDisconnect = false;
    this.establishConnection();
  }

  /**
   * Establish WebSocket connection
   */
  private establishConnection(): void {
    if (!this.userId) {
      console.error("Cannot connect: userId is not set");
      return;
    }

    try {
      // Get JWT token from localStorage (try both possible keys)
      const token = localStorage.getItem("access_token") || localStorage.getItem("accessToken");
      
      if (!token) {
        console.error("Cannot connect: No authentication token found");
        return;
      }
      
      // Add token as query parameter for WebSocket authentication
      const wsUrl = `${WS_BASE_URL}/ws/notifications/${this.userId}/?token=${token}`;
      console.log(`Connecting to WebSocket for user ${this.userId} (authenticated)`);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("✓ WebSocket Connected");
        this.reconnectAttempts = 0;
        this.notifyStatusListeners(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketNotification;

          if (data.type === "new_notification") {
            console.log("📬 New notification received:", data.data);
            this.notifyListeners(data.data);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      this.ws.onclose = (event) => {
        console.log("WebSocket disconnected", event.code, event.reason);
        this.notifyStatusListeners(false);

        // Attempt to reconnect unless it was a manual disconnect
        if (!this.isManualDisconnect) {
          this.attemptReconnect();
        }
      };
    } catch (error) {
      console.error("Error establishing WebSocket connection:", error);
      this.attemptReconnect();
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    console.log(
      `Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    this.reconnectTimeout = setTimeout(() => {
      this.establishConnection();
    }, delay);
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.isManualDisconnect = true;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.userId = null;
    this.reconnectAttempts = 0;
    console.log("WebSocket manually disconnected");
  }

  /**
   * Subscribe to new notifications
   */
  onNotification(callback: NotificationCallback): () => void {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Subscribe to connection status changes
   */
  onConnectionStatus(callback: ConnectionStatusCallback): () => void {
    this.statusListeners.push(callback);

    // Return unsubscribe function
    return () => {
      this.statusListeners = this.statusListeners.filter(
        (cb) => cb !== callback
      );
    };
  }

  /**
   * Notify all listeners of new notification
   */
  private notifyListeners(notification: WebSocketNotification["data"]): void {
    this.listeners.forEach((callback) => {
      try {
        callback(notification);
      } catch (error) {
        console.error("Error in notification listener:", error);
      }
    });
  }

  /**
   * Notify all status listeners of connection change
   */
  private notifyStatusListeners(isConnected: boolean): void {
    this.statusListeners.forEach((callback) => {
      try {
        callback(isConnected);
      } catch (error) {
        console.error("Error in status listener:", error);
      }
    });
  }

  // ============================================================================
  // REST API Methods
  // ============================================================================

  /**
   * Fetch notifications from API
   */
  async getNotifications(
    userId: string | number,  // Support both UUID and number
    page = 1,
    pageSize = 20
  ): Promise<NotificationResponse> {
    const url = `${API_BASE_URL}/api/v1/notifications/?recipient_user_id=${userId}&page=${page}&page_size=${pageSize}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string | number): Promise<number> {  // Support both UUID and number
    try {
      const data = await this.getNotifications(userId, 1, 1);
      // Filter unread from results or use count if backend provides it
      return data.results.filter((n) => !n.read_at).length;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    const url = `${API_BASE_URL}/api/v1/notifications/${notificationId}/mark_as_read/`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to mark notification as read: ${response.statusText}`
      );
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ message: string; count: number }> {
    const url = `${API_BASE_URL}/api/v1/notifications/mark_all_as_read/`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to mark all as read: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    const url = `${API_BASE_URL}/api/v1/notifications/${notificationId}/`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete notification: ${response.statusText}`);
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): "connected" | "connecting" | "disconnected" {
    if (!this.ws) return "disconnected";

    switch (this.ws.readyState) {
      case WebSocket.OPEN:
        return "connected";
      case WebSocket.CONNECTING:
        return "connecting";
      default:
        return "disconnected";
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
