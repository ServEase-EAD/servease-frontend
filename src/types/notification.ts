/**
 * Notification Types for ServEase Application
 */

export type NotificationType =
  | "SYSTEM"
  | "APPOINTMENT"
  | "VEHICLE"
  | "PROJECT"
  | "OTHER";

export interface Notification {
  id: string;
  recipient_user_id: number;
  message: string;
  type: NotificationType;
  read_at: string | null;
  created_at: string;
}

export interface NotificationResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Notification[];
}

export interface WebSocketNotification {
  type: "new_notification";
  data: {
    message: string;
    type: NotificationType;
    timestamp: string;
    metadata?: Record<string, unknown>;
  };
}
