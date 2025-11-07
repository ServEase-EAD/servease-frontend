/**
 * Notification Context
 * Provides notification state and methods throughout the app
 */

import { createContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { Notification } from "../types/notification";
import notificationService from "../services/notificationService";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

export const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
  userId: string | number | null; // Support both UUID string and number
}

export function NotificationProvider({
  children,
  userId,
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  console.log("🔧 [NotificationProvider] Initialized with userId:", userId);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      console.log("⚠️ [NotificationContext] Cannot fetch: userId is null");
      return;
    }

    console.log(
      "🔄 [NotificationContext] Fetching notifications for user:",
      userId
    );
    setIsLoading(true);
    try {
      const response = await notificationService.getNotifications(userId);
      console.log(
        "✅ [NotificationContext] Fetched",
        response.results?.length || 0,
        "notifications"
      );
      setNotifications(response.results);

      // Calculate unread count
      const unread = response.results.filter((n) => !n.read_at).length;
      console.log("📊 [NotificationContext] Unread count:", unread);
      setUnreadCount(unread);
    } catch (error) {
      console.error(
        "❌ [NotificationContext] Error fetching notifications:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Mark single notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();

      // Update local state
      const now = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at || now }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);

      // Update local state
      setNotifications((prev) => {
        const notification = prev.find((n) => n.id === notificationId);
        if (notification && !notification.read_at) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        return prev.filter((n) => n.id !== notificationId);
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Handle real-time notifications
  useEffect(() => {
    if (!userId) return;

    // Connect to WebSocket
    notificationService.connect(userId);

    // Listen for new notifications
    const unsubscribeNotification = notificationService.onNotification(
      (data) => {
        console.log("New notification received in context:", data);

        // Fetch fresh data from API to get the full notification object
        fetchNotifications();

        // Show browser notification if permitted
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("ServEase Notification", {
            body: data.message,
            icon: "/favicon.ico",
          });
        }
      }
    );

    // Listen for connection status changes
    const unsubscribeStatus = notificationService.onConnectionStatus(
      (connected) => {
        setIsConnected(connected);
      }
    );

    // Initial fetch
    fetchNotifications();

    // Cleanup
    return () => {
      unsubscribeNotification();
      unsubscribeStatus();
      notificationService.disconnect();
    };
  }, [userId, fetchNotifications]);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
